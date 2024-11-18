"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const globals_1 = require("@jest/globals");
const index_1 = require("./index");
const dayjs_1 = __importDefault(require("dayjs"));
const firebase_functions_test_1 = __importDefault(require("firebase-functions-test"));
const types_1 = require("./types");
const featuresList = (0, firebase_functions_test_1.default)({
    databaseURL: "https://team16-441820-default-rtdb.firebaseio.com",
    projectId: "team16-441820",
    storageBucket: "team16-441820.firebasestorage.app",
}, "service-account-key.json");
(0, globals_1.test)("test-get-calendars", async () => {
    const calendarsResponse = await featuresList.wrap(index_1.getCalendars)({ data: {
            username: process.env.USERNAME,
            password: process.env.PASSWORD,
        } });
    console.log("calendarsResponse", calendarsResponse);
    (0, globals_1.expect)(calendarsResponse.status).toBe(types_1.Status.OK);
    if (calendarsResponse.status === types_1.Status.OK) {
        (0, globals_1.expect)(calendarsResponse.data.canvasEvents.length).toBeGreaterThan(0);
        (0, globals_1.expect)(calendarsResponse.data.ucsbEvents.courses.length).toBeGreaterThan(0);
        (0, globals_1.expect)(calendarsResponse.data.ucsbEvents.finals.length).toBeGreaterThan(0);
    }
}, 120000);
(0, globals_1.test)("test-get-quarters", async () => {
    const quartersResponse = await featuresList.wrap(index_1.getQuarters)(void (0));
    console.log("quartersResponse", quartersResponse);
    (0, globals_1.expect)(quartersResponse.status).toBe(types_1.Status.OK);
    if (quartersResponse.status === types_1.Status.OK) {
        const now = (0, dayjs_1.default)();
        (0, globals_1.expect)((0, dayjs_1.default)(quartersResponse.data.current.firstDayOfQuarter).diff(now)).toBeLessThanOrEqual(0);
        (0, globals_1.expect)((0, dayjs_1.default)(quartersResponse.data.current.lastDayOfSchedule).diff(now)).toBeGreaterThanOrEqual(0);
        let quarter = parseInt(quartersResponse.data.current.quarter);
        quarter += quarter % 10 === 4 ? 7 : 1;
        (0, globals_1.expect)(quartersResponse.data.next.quarter).toBe(quarter.toString());
    }
});
(0, globals_1.afterAll)(() => {
    featuresList.cleanup();
});
//# sourceMappingURL=index.test.js.map