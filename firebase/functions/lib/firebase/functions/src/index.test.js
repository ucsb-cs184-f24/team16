"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const globals_1 = require("@jest/globals");
const admin = __importStar(require("firebase-admin"));
const index_1 = require("./index");
const dayjs_1 = __importDefault(require("dayjs"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const firebase_functions_test_1 = __importDefault(require("firebase-functions-test"));
const types_1 = require("../../../types");
const featuresList = (0, firebase_functions_test_1.default)({
    databaseURL: "https://team16-441820-default-rtdb.firebaseio.com",
    projectId: "team16-441820",
    storageBucket: "team16-441820.firebasestorage.app",
}, "service-account-key.json");
(0, globals_1.test)("test-get-calendars", async () => {
    const browser = await puppeteer_1.default.launch({
        headless: false,
        pipe: true,
        args: [
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
        ],
    });
    let cookies;
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
    }
    finally {
        await browser.close();
    }
    await admin.firestore().collection("users").doc("test-user").set({
        cookies: JSON.stringify(cookies),
    }, { merge: true });
    const calendarsResponse = await featuresList.wrap(index_1.getCalendars)({
        auth: {
            uid: "test-user",
        },
    });
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
        (0, globals_1.expect)((0, dayjs_1.default)(quartersResponse.data.current.firstDayOfQuarter).diff(now))
            .toBeLessThanOrEqual(0);
        (0, globals_1.expect)((0, dayjs_1.default)(quartersResponse.data.current.lastDayOfSchedule).diff(now))
            .toBeGreaterThanOrEqual(0);
        let quarter = parseInt(quartersResponse.data.current.quarter);
        quarter += quarter % 10 === 4 ? 7 : 1;
        (0, globals_1.expect)(quartersResponse.data.next.quarter).toBe(quarter.toString());
    }
});
(0, globals_1.beforeAll)(() => {
    admin.initializeApp();
});
(0, globals_1.afterAll)(() => {
    featuresList.cleanup();
});
//# sourceMappingURL=index.test.js.map