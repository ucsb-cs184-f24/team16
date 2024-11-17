import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {getCurrent} from "../quarters";
import {Page} from "puppeteer";
import {logger} from "firebase-functions";
import type {
  CanvasAssignment,
  CanvasCourse,
  CanvasEvent,
} from "../../../../types";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("America/Los_Angeles");

/**
 * Get Canvas assignments
 * @param {Page} page - The Puppeteer page.
 * @return {Promise<CanvasEvent[]>}
 */
export default async function getCanvasAssignments(page: Page):
    Promise<CanvasEvent[]> {
  const quarter = await getCurrent();
  const startDate = quarter.firstDayOfQuarter;
  const endDate = quarter.lastDayOfSchedule;

  const coursesUrl = new URL("https://ucsb.instructure.com/api/v1/courses");
  coursesUrl.searchParams.append("enrollment_state", "active");
  coursesUrl.searchParams.append("include[]", "term");

  logger.log("coursesUrl.href", coursesUrl.href);

  const courses = await page.evaluate(async (url) => {
    const coursesResponse = await fetch(url, {
      method: "GET",
    });

    if (!coursesResponse.ok) {
      const errorText = await coursesResponse.text();
      console.error("Failed to fetch courses:", errorText);
      throw new Error("Failed to fetch courses");
    }

    return await coursesResponse.json() as CanvasCourse[];
  }, coursesUrl.href);

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
  const eventsPromises = currentCourses.map<PromiseLike<CanvasEvent>>(
    async (course: CanvasCourse, _index: number, _array: CanvasCourse[]):
      Promise<CanvasEvent> => {
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
          console.error(`Failed to fetch calendar events for course ${
            courseId
          }:`, errorText);
          throw new Error(`Failed to fetch calendar events for course ${
            courseId
          }`);
        }

        return await calendarEventsResponse.json() as CanvasAssignment[];
      }, url.href);

      return {courseId, events};
    });

  return await Promise.all(eventsPromises);
}
