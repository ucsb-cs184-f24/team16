"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
dayjs_1.default.tz.setDefault("America/Los_Angeles");
const UCSBFinalDatePattern = new RegExp([
    /\w+, /,
    /(?<MMMM>\w+) (?<D>\d+), (?<YYYY>\d+) /,
    /(?<h1>\d+):(?<mm1>\d+) (?<A1>\w+) - (?<h2>\d+):(?<mm2>\d+) (?<A2>\w+)/,
].map((r) => r.source).join(""));
/**
 * Get UCSB Events
 * @param {JSDOM} jsdom - JSDOM object
 * @return {UCSBEvents}
 */
function getUCSBEvents(jsdom) {
    const result = {
        courses: [],
        finals: [],
    };
    const gridElement = jsdom.window.document.querySelector("#ctl00_pageContent_ScheduleGrid");
    if (gridElement) {
        const scheduleItemElements = gridElement.querySelectorAll(".scheduleItem:not(:last-child)");
        for (const scheduleItem of Array.from(scheduleItemElements)) {
            const course = {
                name: scheduleItem.querySelector(".courseTitle > span")
                    ?.textContent?.replaceAll(/\s+/g, " ").trim() ?? "",
                sessions: [],
            };
            const sessionElements = scheduleItem.querySelectorAll(".session");
            for (const sessionItem of Array.from(sessionElements)) {
                const labelElements = sessionItem.querySelectorAll("label.visible-xs");
                let days = null;
                let start = null;
                let end = null;
                let location = null;
                let url = null;
                let instructors = null;
                for (const labelElement of Array.from(labelElements)) {
                    const sibling = labelElement.nextSibling;
                    if (sibling) {
                        switch (labelElement.textContent) {
                            case "Days":
                                if (sibling.textContent) {
                                    days = sibling.textContent.trim().split(/\s+/g);
                                }
                                break;
                            case "Time":
                                if (sibling.textContent) {
                                    [start, end] = sibling.textContent.trim().split("-", 2);
                                }
                                break;
                            case "Location":
                                if (sibling.textContent) {
                                    location = sibling.textContent.trim();
                                    url = sibling.href;
                                }
                                break;
                            case "Instructor":
                                instructors = [];
                                for (let element = sibling; element; element = element.nextElementSibling) {
                                    if (element.nodeType === 3 && element.textContent) {
                                        const instructor = element.textContent.trim();
                                        if (instructor.length) {
                                            instructors.push(instructor);
                                        }
                                    }
                                }
                        }
                    }
                }
                if (days && start && end && location && url && instructors) {
                    course.sessions.push({
                        name: course.name, days, start, end, location, url, instructors,
                    });
                }
            }
            result.courses.push(course);
        }
    }
    const finalElements = jsdom.window.document.querySelectorAll(".finalBlock:not(:last-child)");
    for (const element of Array.from(finalElements)) {
        const [nameElement, timeElement] = Array.from(element.querySelectorAll("div"));
        if (nameElement.textContent) {
            const match = timeElement.textContent?.match(UCSBFinalDatePattern);
            if (match?.groups) {
                const { MMMM, D, YYYY, h1, mm1, A1, h2, mm2, A2 } = match.groups;
                result.finals.push({
                    name: nameElement.textContent.replaceAll(/\s+/g, " ").trim(),
                    start: (0, dayjs_1.default)(`${MMMM} ${D}, ${YYYY} ${h1}:${mm1} ${A1}`, "MMMM D, YYYY h:mm A").toISOString(),
                    end: (0, dayjs_1.default)(`${MMMM} ${D}, ${YYYY} ${h2}:${mm2} ${A2}`, "MMMM D, YYYY h:mm A").toISOString(),
                });
            }
        }
    }
    return result;
}
exports.default = getUCSBEvents;
//# sourceMappingURL=ucsb-calendar.js.map