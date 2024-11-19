import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {getCurrent} from "../quarters";
import {logger} from "firebase-functions";
import type {
  CanvasAssignment,
  CanvasCourse,
  CanvasEvent,
} from "../types";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("America/Los_Angeles");

/**
 * Get Canvas assignments
 * @param {string} userAgent - The user agent.
 * @param {string} cookieStr - The cookie string.
 * @return {Promise<CanvasEvent[]>}
 */
export default async function getCanvasAssignments(
  userAgent: string,
  cookieStr: string,
): Promise<CanvasEvent[]> {
  const quarter = await getCurrent();
  const startDate = quarter.firstDayOfQuarter;
  const endDate = quarter.lastDayOfSchedule;

  const coursesUrl = new URL("https://ucsb.instructure.com/api/v1/courses");
  coursesUrl.searchParams.append("enrollment_state", "active");
  coursesUrl.searchParams.append("include[]", "term");

  logger.log("coursesUrl.href", coursesUrl.href);

  const coursesResponse = await fetch(coursesUrl, {
    method: "GET",
    headers: {
      "accept": "application/json",
      "cookie": cookieStr,
      "user-agent": userAgent,
    },
  });

  if (!coursesResponse.ok) {
    const errorText = await coursesResponse.text();
    logger.error("Failed to fetch courses:", errorText);
    throw new Error("Failed to fetch courses");
  }

  const courses = await coursesResponse.json() as CanvasCourse[];

  const currentCourses: CanvasCourse[] = [];

  for (const course of courses) {
    const quarterFirstDay = dayjs(quarter.firstDayOfClasses);

    let courseDate: dayjs.Dayjs | null = null;

    if (course.term && course.term.name) {
      const courseTermName = course.term.name.toLowerCase();
      const quarterName = quarter.name.toLowerCase();

      if (courseTermName === quarterName) {
        logger.log(`Including Course ID: ${
          course.id
        }, Name: ${
          course.name
        }, Reason: Term name matches`);
        currentCourses.push(course);
        continue;
      }
    }

    if (course.start_at) {
      courseDate = dayjs(course.start_at);
    } else if (course.created_at) {
      courseDate = dayjs(course.created_at);
    } else {
      logger.log(`Excluding Course ID: ${
        course.id
      }, Name: ${
        course.name
      }, Reason: No start_at or created_at`);
      continue;
    }

    const diffDays = Math.abs(quarterFirstDay.diff(courseDate, "day"));

    if (diffDays <= 30) {
      logger.log(`Including Course ID: ${
        course.id
      }, Name: ${
        course.name
      }, Reason: Date within threshold`);
      currentCourses.push(course);
    } else {
      // logger.log(`Excluding Course ID: ${
      //   course.id
      // }, Name: ${
      //   course.name
      // }, Reason: diffDays ${diffDays} > 30`);
    }
  }

  // Proceed with fetching events for current courses
  const url = new URL("https://ucsb.instructure.com/api/v1/calendar_events");
  url.searchParams.append("type", "assignment");
  url.searchParams.append("start_date", startDate);
  url.searchParams.append("end_date", endDate);
  for (const course of currentCourses) {
    url.searchParams.append("context_codes[]", `course_${course.id}`);
  }
  const calendarEventsResponse = await fetch(url, {
    method: "GET",
    headers: {
      "accept": "application/json",
      "cookie": cookieStr,
      "user-agent": userAgent,
    },
  });

  if (!calendarEventsResponse.ok) {
    const errorText = await calendarEventsResponse.text();
    console.error("Failed to fetch calendar events:", errorText);
    throw new Error("Failed to fetch calendar events");
  }

  const events = await calendarEventsResponse.json() as CanvasAssignment[];

  const eventsByContextCode: Record<string, CanvasAssignment[]> = {};
  for (const event of events) {
    if (!eventsByContextCode[event.context_code]) {
      eventsByContextCode[event.context_code] = [event];
    } else {
      eventsByContextCode[event.context_code].push(event);
    }
  }

  return Object.entries(eventsByContextCode).map(([contextCode, events]) => ({
    courseId: parseInt(contextCode.substring("course_".length)),
    events: events,
  }));
}
