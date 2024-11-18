import "dotenv/config";
import {afterAll, expect, test} from "@jest/globals";
import {getCalendars, getQuarters} from "./index";
import dayjs from "dayjs";
import firebaseFunctionsTest from "firebase-functions-test";
import {
  type CalendarsData,
  type FunctionResponse,
  type Quarter,
  Status,
} from "./types";

const featuresList = firebaseFunctionsTest({
  databaseURL: "https://team16-441820-default-rtdb.firebaseio.com",
  projectId: "team16-441820",
  storageBucket: "team16-441820.firebasestorage.app",
}, "service-account-key.json");

test("test-get-calendars", async () => {
  const calendarsResponse: FunctionResponse<CalendarsData> =
      await featuresList.wrap(getCalendars)({data: {
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
      }});
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
    expect(
      dayjs(quartersResponse.data.current.firstDayOfQuarter).diff(now)
    ).toBeLessThanOrEqual(0);
    expect(
      dayjs(quartersResponse.data.current.lastDayOfSchedule).diff(now)
    ).toBeGreaterThanOrEqual(0);
    let quarter = parseInt(quartersResponse.data.current.quarter);
    quarter += quarter % 10 === 4 ? 7 : 1;
    expect(quartersResponse.data.next.quarter).toBe(quarter.toString());
  }
});

afterAll(() => {
  featuresList.cleanup();
});
