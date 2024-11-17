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
exports.getCalendars = void 0;
const https_1 = require("firebase-functions/v2/https");
const puppeteer_1 = __importDefault(require("puppeteer"));
const ucsb_calendar_1 = __importDefault(require("./ucsb-calendar"));
const canvas_calendars_1 = __importDefault(require("./canvas-calendars"));
const admin = __importStar(require("firebase-admin"));
const jsdom_1 = require("jsdom");
const firebase_functions_1 = require("firebase-functions");
const types_1 = require("../../../../types");
exports.getCalendars = (0, https_1.onCall)(async (request) => {
    try {
        const { auth, data } = request;
        if (auth) {
            let cookies;
            const doc = admin.firestore().collection("users").doc(auth.uid);
            if (data) {
                cookies = data;
            }
            else {
                const snap = await doc.get();
                if (snap.exists) {
                    const data = snap.data();
                    cookies = JSON.parse(data?.cookies);
                }
                else {
                    return {
                        status: types_1.Status.NO_COOKIES,
                    };
                }
            }
            const browser = await puppeteer_1.default.launch();
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
                                firebase_functions_1.logger.log("Waiting for Duo authentication");
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
                        const jsdom = new jsdom_1.JSDOM(await response.text());
                        return (0, ucsb_calendar_1.default)(jsdom);
                    })(await browser.newPage()),
                    (async (page) => {
                        await page.bringToFront();
                        await page.goto("https://ucsb.instructure.com/");
                        if (page.url() === "https://www.canvas.ucsb.edu/") {
                            await page.goto("https://ucsb.instructure.com/login/saml");
                            while (page.url().startsWith("https://sso.ucsb.edu/cas/login")) {
                                if (await page.$("#duo_iframe")) {
                                    firebase_functions_1.logger.log("Waiting for Duo authentication");
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
                        return (0, canvas_calendars_1.default)(page);
                    })(await browser.newPage()),
                ]);
                return {
                    status: types_1.Status.OK,
                    data: { ucsbEvents, canvasEvents },
                };
            }
            finally {
                await page0.goto("https://sso.ucsb.edu/cas/login");
                await doc.update({
                    cookies: JSON.stringify(await page0.cookies()),
                });
                await browser.close();
            }
        }
        else {
            return {
                status: types_1.Status.NOT_SIGNED_IN,
            };
        }
    }
    catch (error) {
        console.error(error);
        return {
            status: types_1.Status.INTERNAL_SERVER_ERROR,
            error: error,
        };
    }
});
//# sourceMappingURL=index.js.map