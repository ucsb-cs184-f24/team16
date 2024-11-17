import "dotenv/config";
import {afterAll, beforeAll, expect, test} from "@jest/globals";
import * as admin from "firebase-admin";
import {type CalendarsData, getCalendars, getQuarters} from "./index";
import dayjs from "dayjs";
import puppeteer, {CookieParam} from "puppeteer";
import {type FunctionResponse, Status} from "./constants";
import {type Quarter} from "./quarters";
import firebaseFunctionsTest from "firebase-functions-test";

const featuresList = firebaseFunctionsTest({
  databaseURL: "https://team16-441820-default-rtdb.firebaseio.com",
  projectId: "team16-441820",
  storageBucket: "team16-441820.firebasestorage.app",
}, "service-account-key.json");

test("test-get-calendars", async () => {
  const browser = await puppeteer.launch({
    headless: false,
    pipe: true,
    args: [
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
  });
  let cookies: CookieParam[];
  try {
    const page = await browser.newPage();
    await page.goto("https://sso.ucsb.edu/cas/login");
    await page.locator("form[action=\"login\"] input[name=\"username\"]")
      .fill(process.env.USERNAME ?? "");
    await page.locator("form[action=\"login\"] input[name=\"password\"]")
      .fill(process.env.PASSWORD ?? "");
    await page.locator("form[action=\"login\"] input[name=\"submit\"]").click();
    do {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } while (!await page.$("div.alert-success"));
    cookies = await page.cookies();
  } finally {
    await browser.close();
  }
  await admin.firestore().collection("users").doc("test-user").set({
    cookies: JSON.stringify(cookies),
  }, {merge: true});
  const calendarsResponse: FunctionResponse<CalendarsData> =
      await featuresList.wrap(getCalendars)({
        auth: {
          uid: "test-user",
        },
      });
  console.log("calendarsResponse", calendarsResponse);
  expect(calendarsResponse.status).toBe(Status.OK);
  if (calendarsResponse.status === Status.OK) {
    expect(calendarsResponse.data.canvasEvents.length).toBeGreaterThan(0);
    expect(calendarsResponse.data.ucsbEvents.courses.length).toBeGreaterThan(0);
    expect(calendarsResponse.data.ucsbEvents.finals.length).toBeGreaterThan(0);
  }
}, 120000);

test("test-get-quarters", async () => {
  const quartersResponse: FunctionResponse<{
    current: Quarter;
    next: Quarter;
  }> = await featuresList.wrap(getQuarters)(void (0));
  console.log("quartersResponse", quartersResponse);
  expect(quartersResponse.status).toBe(Status.OK);
  if (quartersResponse.status === Status.OK) {
    const now = dayjs();
    expect(dayjs(quartersResponse.data.current.firstDayOfQuarter).diff(now))
      .toBeLessThanOrEqual(0);
    expect(dayjs(quartersResponse.data.current.lastDayOfSchedule).diff(now))
      .toBeGreaterThanOrEqual(0);
    let quarter = parseInt(quartersResponse.data.current.quarter);
    quarter += quarter % 10 === 4 ? 7 : 1;
    expect(quartersResponse.data.next.quarter).toBe(quarter.toString());
  }
});

beforeAll(() => {
  admin.initializeApp();
});

afterAll(() => {
  featuresList.cleanup();
});
