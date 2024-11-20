import {https, logger} from "firebase-functions";
import type {Page} from "puppeteer";
import getUCSBEvents from "./ucsb-calendar";
import getCanvasAssignments from "./canvas-calendars";
import {JSDOM} from "jsdom";
import {
  type CalendarsData,
  type Credentials, RequestData,
  type ResponseData,
  Status,
} from "../types";
import {
  getGradescopeAssignments,
  getGradescopeCourses,
} from "./gradescope-calendars";
import {Mutex} from "async-mutex";
import {browserContextCache, getUserAgent} from "../puppeteer";

/**
 * Wait for UCSB auth
 * @param {Page} page - the page to wait on
 * @param {Credentials} credentials - the credentials to use
 * @return {Promise<void>}
 */
async function waitForAuth(
  page: Page,
  credentials: Credentials
): Promise<void> {
  logger.log("waitForAuth");
  await page.bringToFront();
  while (
    page.url().startsWith("https://sso.ucsb.edu/cas/login") &&
    await page.$("div.alert-success").then(
      (e) => !e,
      () => true
    )
  ) {
    if (await page.$("#duo_iframe").then(
      (e) => !!e,
      () => false
    )) {
      logger.log("Waiting for Duo authentication");
      await page.waitForNavigation({
        timeout: 60000,
      });
      break;
    } else if (await page.$("form[action=\"login\"]").then(
      (e) => !!e,
      () => false
    )) {
      logger.log("Entering credentials");
      await page.locator(
        "form[action=\"login\"] input[name=\"username\"]"
      ).fill(credentials.username);
      await page.locator(
        "form[action=\"login\"] input[name=\"password\"]"
      ).fill(credentials.password);
      await page.locator(
        "form[action=\"login\"] input[name=\"submit\"]"
      ).click();
    }
  }
}

export const getCalendars = https.onCall<
  RequestData<Credentials | null, CalendarsData>,
  Promise<ResponseData<CalendarsData>>
>({
  memory: "2GiB",
  timeoutSeconds: 120,
}, async ({data: {params, keys}}): Promise<ResponseData<CalendarsData>> => {
  logger.log("params:", params);
  if (!params) {
    logger.log("Not signed in");
    return {
      status: Status.NOT_SIGNED_IN,
    } as ResponseData<CalendarsData>;
  }
  try {
    logger.log("Getting browser context");
    const context = await browserContextCache.fetch(params.username);
    if (!context) {
      logger.error("Cannot get browser context");
      return {
        status: Status.INTERNAL_SERVER_ERROR,
        error: new Error("Cannot get browser context"),
      };
    }
    const userAgent = await getUserAgent();
    const data: Partial<CalendarsData> = {};
    keys ??= ["ucsbEvents", "canvasEvents", "gradescopeCourses"];
    const mutex = new Mutex();
    await Promise.all(keys.map(async (key) => {
      switch (key) {
      case "ucsbEvents": {
        const page = await context.newPage();
        const session = await page.createCDPSession();
        await session.send("Emulation.setFocusEmulationEnabled", {
          enabled: true,
        });
        session.detach().then();
        logger.log("Getting UCSB response");
        const release = await mutex.acquire();
        await page.goto("https://my.sa.ucsb.edu/gold/StudentSchedule.aspx");
        await waitForAuth(page, params);
        release();
        const cookies = await page.cookies();
        page.close().then();
        const cookieStr = cookies.map(
          (cookie) => `${cookie.name}=${cookie.value}`
        ).join("; ");
        const response = await fetch("https://my.sa.ucsb.edu/gold/StudentSchedule.aspx", {
          method: "GET",
          headers: {
            "accept": "text/html",
            "cookie": cookieStr,
            "user-agent": userAgent,
          },
        });
        logger.log("Processing UCSB response");
        const jsdom = new JSDOM(await response.text(), {
          url: response.url,
        });
        data.ucsbEvents = getUCSBEvents(jsdom);
      } break;
      case "canvasEvents": {
        const page = await context.newPage();
        const session = await page.createCDPSession();
        await session.send("Emulation.setFocusEmulationEnabled", {
          enabled: true,
        });
        session.detach().then();
        logger.log("Getting Canvas response");
        const release = await mutex.acquire();
        await page.goto("https://ucsb.instructure.com/");
        if (page.url() === "https://www.canvas.ucsb.edu/") {
          await page.goto("https://ucsb.instructure.com/login/saml");
          await waitForAuth(page, params);
        }
        if (page.url() !== "https://ucsb.instructure.com/") {
          await page.waitForNavigation();
        }
        release();
        const cookies = await page.cookies();
        page.close().then();
        const cookieStr = cookies.map(
          (cookie) => `${cookie.name}=${cookie.value}`
        ).join("; ");
        logger.log("Processing response");
        data.canvasEvents = await getCanvasAssignments(userAgent, cookieStr);
      } break;
      case "gradescopeCourses": {
        const page = await context.newPage();
        const session = await page.createCDPSession();
        await session.send("Emulation.setFocusEmulationEnabled", {
          enabled: true,
        });
        session.detach().then();
        logger.log("Getting Gradescope response");
        const release = await mutex.acquire();
        await page.goto("https://www.gradescope.com/auth/saml/ucsb");
        await waitForAuth(page, params);
        while (page.url() !== "https://www.gradescope.com/") {
          await page.waitForNavigation();
        }
        release();
        const cookies = await page.cookies();
        page.close().then();
        const cookieStr = cookies.map(
          (cookie) => `${cookie.name}=${cookie.value}`
        ).join("; ");
        const response = await fetch("https://www.gradescope.com/", {
          method: "GET",
          headers: {
            "accept": "text/html",
            "cookie": cookieStr,
            "user-agent": userAgent,
          },
        });
        const jsdom = new JSDOM(await response.text(), {
          url: response.url,
        });
        const courses = getGradescopeCourses(jsdom);
        data.gradescopeCourses = await Promise.all(courses.map(async (
          course
        ) => {
          const response = await fetch(course.href, {
            method: "GET",
            headers: {
              "accept": "text/html",
              "cookie": cookieStr,
              "user-agent": userAgent,
            },
          });
          const jsdom = new JSDOM(await response.text(), {
            url: response.url,
          });
          return {
            ...course,
            assignments: getGradescopeAssignments(jsdom),
          };
        }));
      } break;
      }
    }));
    logger.log("Returning data", data);
    return {
      status: Status.OK,
      data,
    };
  } catch (error) {
    logger.error(error);
    return {
      status: Status.INTERNAL_SERVER_ERROR,
      error: error,
    };
  }
});
