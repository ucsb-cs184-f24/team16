"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const quarters_1 = require("../quarters");
const firebase_functions_1 = require("firebase-functions");
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
dayjs_1.default.tz.setDefault("America/Los_Angeles");
/**
 * Get Canvas assignments
 * @param {Page} page - The Puppeteer page.
 * @return {Promise<CanvasEvent[]>}
 */
async function getCanvasAssignments(page) {
    const quarter = await (0, quarters_1.getCurrent)();
    const startDate = quarter.firstDayOfQuarter;
    const endDate = quarter.lastDayOfSchedule;
    const coursesUrl = new URL("https://ucsb.instructure.com/api/v1/courses");
    coursesUrl.searchParams.append("enrollment_state", "active");
    coursesUrl.searchParams.append("include[]", "term");
    firebase_functions_1.logger.log("coursesUrl.href", coursesUrl.href);
    const courses = await page.evaluate(async (url) => {
        const coursesResponse = await fetch(url, {
            method: "GET",
        });
        if (!coursesResponse.ok) {
            const errorText = await coursesResponse.text();
            console.error("Failed to fetch courses:", errorText);
            throw new Error("Failed to fetch courses");
        }
        return await coursesResponse.json();
    }, coursesUrl.href);
    const currentCourses = [];
    for (const course of courses) {
        const quarterFirstDay = (0, dayjs_1.default)(quarter.firstDayOfClasses);
        let courseDate = null;
        if (course.term && course.term.name) {
            const courseTermName = course.term.name.toLowerCase();
            const quarterName = quarter.name.toLowerCase();
            if (courseTermName === quarterName) {
                firebase_functions_1.logger.log(`Including Course ID: ${course.id}, Name: ${course.name}, Reason: Term name matches`);
                currentCourses.push(course);
                continue;
            }
        }
        if (course.start_at) {
            courseDate = (0, dayjs_1.default)(course.start_at);
        }
        else if (course.created_at) {
            courseDate = (0, dayjs_1.default)(course.created_at);
        }
        else {
            firebase_functions_1.logger.log(`Excluding Course ID: ${course.id}, Name: ${course.name}, Reason: No start_at or created_at`);
            continue;
        }
        const diffDays = Math.abs(quarterFirstDay.diff(courseDate, "day"));
        if (diffDays <= 30) {
            firebase_functions_1.logger.log(`Including Course ID: ${course.id}, Name: ${course.name}, Reason: Date within threshold`);
            currentCourses.push(course);
        }
        else {
            // logger.log(`Excluding Course ID: ${
            //   course.id
            // }, Name: ${
            //   course.name
            // }, Reason: diffDays ${diffDays} > 30`);
        }
    }
    // Proceed with fetching events for current courses
    const eventsPromises = currentCourses.map(async (course, _index, _array) => {
        const courseId = course.id;
        const url = new URL("https://ucsb.instructure.com/api/v1/calendar_events");
        url.searchParams.append("type", "assignment");
        url.searchParams.append("start_date", startDate);
        url.searchParams.append("end_date", endDate);
        url.searchParams.append("context_codes[]", `course_${courseId}`);
        const events = await page.evaluate(async (url) => {
            const calendarEventsResponse = await fetch(url, {
                method: "GET",
            });
            if (!calendarEventsResponse.ok) {
                const errorText = await calendarEventsResponse.text();
                console.error(`Failed to fetch calendar events for course ${courseId}:`, errorText);
                throw new Error(`Failed to fetch calendar events for course ${courseId}`);
            }
            return await calendarEventsResponse.json();
        }, url.href);
        return { courseId, events };
    });
    return await Promise.all(eventsPromises);
}
exports.default = getCanvasAssignments;
//# sourceMappingURL=canvas-calendars.js.map