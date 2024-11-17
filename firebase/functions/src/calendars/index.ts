import {onCall} from "firebase-functions/v2/https";
import puppeteer, {type CookieParam} from "puppeteer";
import getUCSBEvents from "./ucsb-calendar";
import getCanvasEvents from "./canvas-calendars";
import * as admin from "firebase-admin";
import {JSDOM} from "jsdom";
import {logger} from "firebase-functions";
import {
  type CalendarsData,
  type FunctionResponse,
  Status,
} from "../types";

export const getCalendars = onCall<
    CookieParam[] | void,
    Promise<FunctionResponse<CalendarsData>>>(async (request):
Promise<FunctionResponse<CalendarsData>> => {
      try {
        const {auth, data} = request;
        if (auth) {
          let cookies: CookieParam[];
          const doc = admin.firestore().collection("users").doc(auth.uid);
          if (data) {
            cookies = data;
          } else {
            const snap = await doc.get();
            if (snap.exists) {
              const data = snap.data();
              cookies = JSON.parse(data?.cookies) as CookieParam[];
            } else {
              return {
                status: Status.NO_COOKIES,
              } as FunctionResponse<CalendarsData>;
            }
          }
          const browser = await puppeteer.launch();
          const page0 = await browser.newPage();
          try {
            await page0.bringToFront();
            await page0.goto("https://sso.ucsb.edu/cas/login");
            await page0.setCookie(...cookies);
            const [ucsbEvents, canvasEvents] = await Promise.all([
              (async (page) => {
                await page.bringToFront();
                let response = await page.goto("https://my.sa.ucsb.edu/gold/StudentSchedule.aspx");
                while (page.url().startsWith("https://sso.ucsb.edu/cas/login")) {
                  if (await page.$("#duo_iframe")) {
                    logger.log("Waiting for Duo authentication");
                    await page.bringToFront();
                    await page.waitForNavigation({
                      timeout: 60000,
                    });
                    break;
                  }
                }
                if (page.url() !== "https://my.sa.ucsb.edu/gold/StudentSchedule.aspx") {
                  response = await page.goto("https://my.sa.ucsb.edu/gold/StudentSchedule.aspx");
                }
                if (page.url() !== "https://my.sa.ucsb.edu/gold/StudentSchedule.aspx") {
                  throw new Error("UCSB authentication failed");
                }
                if (!response) {
                  throw new Error("No UCSB Response");
                }
                const jsdom = new JSDOM(await response.text());
                return getUCSBEvents(jsdom);
              })(await browser.newPage()),
              (async (page) => {
                await page.bringToFront();
                await page.goto("https://ucsb.instructure.com/");
                if (page.url() === "https://www.canvas.ucsb.edu/") {
                  await page.goto("https://ucsb.instructure.com/login/saml");
                  while (page.url().startsWith("https://sso.ucsb.edu/cas/login")) {
                    if (await page.$("#duo_iframe")) {
                      logger.log("Waiting for Duo authentication");
                      await page.bringToFront();
                      await page.waitForNavigation({
                        timeout: 60000,
                      });
                      break;
                    }
                  }
                }
                if (page.url() !== "https://ucsb.instructure.com/") {
                  await page.waitForNavigation();
                }
                if (page.url() !== "https://ucsb.instructure.com/") {
                  throw new Error("Canvas authentication failed");
                }
                return getCanvasEvents(page);
              })(await browser.newPage()),
            ]);
            return {
              status: Status.OK,
              data: {ucsbEvents, canvasEvents},
            } as FunctionResponse<CalendarsData>;
          } finally {
            await page0.goto("https://sso.ucsb.edu/cas/login");
            await doc.update({
              cookies: JSON.stringify(await page0.cookies()),
            });
            await browser.close();
          }
        } else {
          return {
            status: Status.NOT_SIGNED_IN,
          } as FunctionResponse<CalendarsData>;
        }
      } catch (error) {
        console.error(error);
        return {
          status: Status.INTERNAL_SERVER_ERROR,
          error: error,
        } as FunctionResponse<CalendarsData>;
      }
    });
