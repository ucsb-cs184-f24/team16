"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendars = void 0;
const firebase_functions_1 = require("firebase-functions");
const puppeteer_1 = __importDefault(require("puppeteer"));
const ucsb_calendar_1 = __importDefault(require("./ucsb-calendar"));
const canvas_calendars_1 = __importDefault(require("./canvas-calendars"));
const jsdom_1 = require("jsdom");
const types_1 = require("../types");
/**
 * Wait for UCSB auth
 * @param {Page} page - the page to wait on
 * @param {Credentials} credentials - the credentials to use
 * @return {Promise<void>}
 */
async function waitForAuth(page, credentials) {
    firebase_functions_1.logger.log("waitForAuth");
    while (page.url().startsWith("https://sso.ucsb.edu/cas/login") &&
        await page.$("div.alert-success").then((e) => !e, () => true)) {
        if (await page.$("#duo_iframe").then((e) => !!e, () => false)) {
            firebase_functions_1.logger.log("Waiting for Duo authentication");
            await page.bringToFront();
            await page.waitForNavigation({
                timeout: 60000,
            });
            break;
        }
        else if (await page.$("form[action=\"login\"]").then((e) => !!e, () => false)) {
            firebase_functions_1.logger.log("Entering credentials");
            await page.locator("form[action=\"login\"] input[name=\"username\"]").fill(credentials.username);
            await page.locator("form[action=\"login\"] input[name=\"password\"]").fill(credentials.password);
            await page.locator("form[action=\"login\"] input[name=\"submit\"]").click();
        }
    }
}
exports.getCalendars = firebase_functions_1.https.onCall({
    memory: "2GiB",
    timeoutSeconds: 120,
}, async ({ data }) => {
    firebase_functions_1.logger.log("data:", data);
    if (!data) {
        firebase_functions_1.logger.log("Not signed in");
        return {
            status: types_1.Status.NOT_SIGNED_IN,
        };
    }
    try {
        firebase_functions_1.logger.log("Launching browser");
        const browser = await puppeteer_1.default.launch({
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
                    firebase_functions_1.logger.log("Getting UCSB response");
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
                    firebase_functions_1.logger.log("Processing UCSB response");
                    const jsdom = new jsdom_1.JSDOM(await response.text());
                    return (0, ucsb_calendar_1.default)(jsdom);
                })(await browser.newPage()),
                (async (page) => {
                    firebase_functions_1.logger.log("Getting Canvas response");
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
                    firebase_functions_1.logger.log("Processing response");
                    return (0, canvas_calendars_1.default)(page);
                })(await browser.newPage()),
            ]);
            const result = {
                status: types_1.Status.OK,
                data: { ucsbEvents, canvasEvents },
            };
            firebase_functions_1.logger.log("Returning result", result);
            return result;
        }
        finally {
            firebase_functions_1.logger.log("Closing browser");
            await browser.close();
        }
    }
    catch (error) {
        firebase_functions_1.logger.error(error);
        return {
            status: types_1.Status.INTERNAL_SERVER_ERROR,
            error: error,
        };
    }
});
//# sourceMappingURL=index.js.map