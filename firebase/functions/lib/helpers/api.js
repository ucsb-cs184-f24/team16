"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCanvasAssignments = exports.getCanvasEvents = exports.getUCSBEvents = exports.getQuarter = void 0;
const jsdom_jscore_rn_1 = require("jsdom-jscore-rn");
require("core-js/actual/url");
require("core-js/actual/url-search-params");
const dayjs_1 = __importDefault(require("dayjs"));
const customParseFormat_1 = __importDefault(require("dayjs/plugin/customParseFormat"));
dayjs_1.default.extend(customParseFormat_1.default);
async function getQuarter() {
    const url = 'https://api-transformer.onrender.com//https://api.ucsb.edu/academics/quartercalendar/v1/quarters/current';
    const headers = {
        'accept': 'application/json',
        'ucsb-api-version': '1.0',
        'ucsb-api-key': '1M1qsvRB65v5n0CR9ihHJCsEJF2lCvZe'
    };
    const response = await fetch(url, { method: 'GET', headers: { headers: JSON.stringify(headers) } });
    if (!response.ok) {
        throw new Error('Failed to fetch quarter info');
    }
    return response.json();
}
exports.getQuarter = getQuarter;
const UCSBFinalDatePattern = /\w+, (?<MMMM>\w+) (?<D>\d+), (?<YYYY>\d+) (?<h1>\d+):(?<mm1>\d+) (?<A1>\w+) - (?<h2>\d+):(?<mm2>\d+) (?<A2>\w+)/;
async function getUCSBEvents(headers) {
    const response = await fetch("https://api-transformer.onrender.com//https://my.sa.ucsb.edu/gold/StudentSchedule.aspx", {
        "method": "GET",
        "headers": headers
    });
    const result = {
        courses: [],
        finals: []
    };
    const dom = (0, jsdom_jscore_rn_1.jsdom)(await response.text());
    // console.log("Dom", dom.title);
    const gridElement = dom.querySelector('#ctl00_pageContent_ScheduleGrid');
    if (gridElement) {
        const scheduleItemElements = gridElement.querySelectorAll('.scheduleItem:not(:last-child)');
        for (const scheduleItem of Array.from(scheduleItemElements)) {
            const course = {
                name: scheduleItem.querySelector('.courseTitle > span')?.textContent?.replaceAll(/\s+/g, " ").trim() ?? "",
                sessions: []
            };
            const sessionElements = scheduleItem.querySelectorAll('.session');
            for (const sessionItem of Array.from(sessionElements)) {
                const labelElements = sessionItem.querySelectorAll('label.visible-xs');
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
                        name: course.name, days, start, end, location, url, instructors
                    });
                }
            }
            result.courses.push(course);
        }
    }
    const finalElements = dom.querySelectorAll('.finalBlock:not(:last-child)');
    for (const element of Array.from(finalElements)) {
        const [nameElement, timeElement] = Array.from(element.querySelectorAll('div'));
        if (nameElement.textContent) {
            const match = timeElement.textContent?.match(UCSBFinalDatePattern);
            if (match?.groups) {
                const { MMMM, D, YYYY, h1, mm1, A1, h2, mm2, A2 } = match.groups;
                result.finals.push({
                    name: nameElement.textContent.replaceAll(/\s+/g, " ").trim(),
                    start: (0, dayjs_1.default)(`${MMMM} ${D}, ${YYYY} ${h1}:${mm1} ${A1}`, "MMMM D, YYYY h:mm A"),
                    end: (0, dayjs_1.default)(`${MMMM} ${D}, ${YYYY} ${h2}:${mm2} ${A2}`, "MMMM D, YYYY h:mm A")
                });
            }
        }
    }
    return result;
}
exports.getUCSBEvents = getUCSBEvents;
async function getCanvasEvents(headers) {
    const response = await fetch("https://ucsb.instructure.com/api/v1/users/self", {
        "method": "GET",
        "headers": headers
    });
    return response.json();
}
exports.getCanvasEvents = getCanvasEvents;
async function getCanvasAssignments(headers, quarter) {
    const startDate = quarter.firstDayOfQuarter;
    const endDate = quarter.lastDayOfSchedule;
    const coursesUrl = new URL("https://ucsb.instructure.com/api/v1/courses");
    coursesUrl.searchParams.append('enrollment_state', 'active');
    coursesUrl.searchParams.append('include[]', 'term');
    console.log("coursesUrl.href", coursesUrl.href);
    console.log("headers", headers);
    const coursesResponse = await fetch(coursesUrl.href, {
        method: "GET",
        headers: headers,
    });
    if (!coursesResponse.ok) {
        const errorText = await coursesResponse.text();
        console.error("Failed to fetch courses:", errorText);
        throw new Error("Failed to fetch courses");
    }
    const courses = await coursesResponse.json();
    const currentCourses = [];
    for (const course of courses) {
        const quarterFirstDay = (0, dayjs_1.default)(quarter.firstDayOfClasses);
        let courseDate = null;
        if (course.term && course.term.name) {
            const courseTermName = course.term.name.toLowerCase();
            const quarterName = quarter.name.toLowerCase();
            if (courseTermName === quarterName) {
                console.log(`Including Course ID: ${course.id}, Name: ${course.name}, Reason: Term name matches`);
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
            console.log(`Excluding Course ID: ${course.id}, Name: ${course.name}, Reason: No start_at or created_at`);
            continue;
        }
        const diffDays = Math.abs(quarterFirstDay.diff(courseDate, 'day'));
        if (diffDays <= 30) {
            console.log(`Including Course ID: ${course.id}, Name: ${course.name}, Reason: Date within threshold`);
            currentCourses.push(course);
        }
        else {
            //console.log(`Excluding Course ID: ${course.id}, Name: ${course.name}, Reason: diffDays ${diffDays} > 30`);
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
        const calendarEventsResponse = await fetch(url.href, {
            method: "GET",
            headers: headers,
        });
        if (!calendarEventsResponse.ok) {
            const errorText = await calendarEventsResponse.text();
            console.error(`Failed to fetch calendar events for course ${courseId}:`, errorText);
            throw new Error(`Failed to fetch calendar events for course ${courseId}`);
        }
        const events = await calendarEventsResponse.json();
        return { courseId, events };
    });
    const eventsByCourse = await Promise.all(eventsPromises);
    //console.log("Canvas Assignments:", JSON.stringify(eventsByCourse, null, 2));
    return eventsByCourse;
}
exports.getCanvasAssignments = getCanvasAssignments;
//# sourceMappingURL=api.js.map