import {https, logger} from "firebase-functions";
import puppeteer, {type Page} from "puppeteer";
import getUCSBEvents from "./ucsb-calendar";
import getCanvasEvents from "./canvas-calendars";
import {JSDOM} from "jsdom";
import {
  type CalendarsData,
  type Credentials,
  type FunctionResponse,
  Status,
} from "../types";

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
      await page.bringToFront();
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
  Credentials | null,
  Promise<FunctionResponse<CalendarsData>>
>({
  memory: "2GiB",
  timeoutSeconds: 120,
}, async ({data}): Promise<FunctionResponse<CalendarsData>> => {
  logger.log("data:", data);
  if (!data) {
    logger.log("Not signed in");
    return {
      status: Status.NOT_SIGNED_IN,
    } as FunctionResponse<CalendarsData>;
  }
  try {
    logger.log("Launching browser");
    const browser = await puppeteer.launch({
      headless: true,
      pipe: true,
      args: [
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-setuid-sandbox",
        "--no-sandbox",
      ],
    });
    try {
      const page = await browser.newPage();
      await page.goto("https://sso.ucsb.edu/cas/login");
      await waitForAuth(page, data);
      const [ucsbEvents, canvasEvents] = await Promise.all([
        (async (page) => {
          logger.log("Getting UCSB response");
          await page.bringToFront();
          let response = await page.goto("https://my.sa.ucsb.edu/gold/StudentSchedule.aspx");
          await waitForAuth(page, data);
          if (page.url() !== "https://my.sa.ucsb.edu/gold/StudentSchedule.aspx") {
            response = await page.goto("https://my.sa.ucsb.edu/gold/StudentSchedule.aspx");
          }
          if (page.url() !== "https://my.sa.ucsb.edu/gold/StudentSchedule.aspx") {
            throw new Error("UCSB authentication failed");
          }
          if (!response) {
            throw new Error("No UCSB Response");
          }
          logger.log("Processing UCSB response");
          const jsdom = new JSDOM(await response.text());
          return getUCSBEvents(jsdom);
        })(await browser.newPage()),
        (async (page) => {
          logger.log("Getting Canvas response");
          await page.bringToFront();
          await page.goto("https://ucsb.instructure.com/");
          if (page.url() === "https://www.canvas.ucsb.edu/") {
            await page.goto("https://ucsb.instructure.com/login/saml");
            await waitForAuth(page, data);
          }
          if (page.url() !== "https://ucsb.instructure.com/") {
            await page.waitForNavigation();
          }
          if (page.url() !== "https://ucsb.instructure.com/") {
            throw new Error("Canvas authentication failed");
          }
          logger.log("Processing response");
          return getCanvasEvents(page);
        })(await browser.newPage()),
      ]);
      const result = {
        status: Status.OK,
        data: {ucsbEvents, canvasEvents},
      } as FunctionResponse<CalendarsData>;
      logger.log("Returning result", result);
      return result;
    } finally {
      logger.log("Closing browser");
      await browser.close();
    }
  } catch (error) {
    logger.error(error);
    return {
      status: Status.INTERNAL_SERVER_ERROR,
      error: error,
    } as FunctionResponse<CalendarsData>;
  }
});
