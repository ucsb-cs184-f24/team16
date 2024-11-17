import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {getCurrent} from "../quarters";
import {Page} from "puppeteer";
import {logger} from "firebase-functions";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("America/Los_Angeles");

interface CanvasCourse {
  id: number;
  sis_course_id: number | null;
  uuid: string;
  integration_id: number | null;
  sis_import_id: number;
  name: string;
  course_code: string;
  original_name: string;
  workflow_state: "unpublished" | "available" | "completed" | "deleted";
  account_id: number;
  root_account_id: number;
  enrollment_term_id: number;
  grading_periods: object[] | null;
  grading_standard_id: number;
  grade_passback_setting: string;
  created_at: string;
  start_at: string | null;
  end_at: string | null;
  locale: string;
  enrollments: object | null;
  total_students: number | null;
  calendar: {
    ics: string;
  } | null;
  default_view: string;
  syllabus_body: string;
  needs_grading_count: number | null;
  term: {
    name: string;
  } | null;
  course_progress: object | null;
  apply_assignment_group_weights: boolean;
  permissions: {
    create_discussion_topic: boolean;
    create_announcement: true;
  };
  is_public: boolean;
  is_public_to_auth_users: boolean;
  public_syllabus: boolean;
  public_syllabus_to_auth: boolean;
  public_description: string | null;
  storage_quota_mb: number;
  storage_quota_used_mb: number;
  hide_final_grades: boolean;
  license: string;
  allow_student_assignment_edits: boolean;
  allow_wiki_comments: boolean;
  allow_student_forum_attachments: boolean;
  open_enrollment: boolean;
  self_enrollment: boolean;
  restrict_enrollments_to_course_dates: boolean;
  course_format: string;
  access_restricted_by_date: boolean | null;
  time_zone: string;
  blueprint: boolean | null;
  blueprint_restrictions: {
    content: boolean;
    points: boolean;
    due_dates: boolean;
    availability_dates: boolean;
  } | null;
  blueprint_restrictions_by_object_type: {
    assignment: {
      content: boolean;
      points: boolean;
    },
    wiki_page: {
      content: boolean;
    }
  } | null;
  template: boolean;
}

interface CanvasAssignment {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  description: string;
  context_code: string;
  workflow_state: string;
  url: string;
  html_url: string;
  all_day_date: string;
  all_day: boolean;
  created_at: string;
  updated_at: string;
  assignment: object | null;
  assignment_overrides: object[] | null;
  important_dates: boolean;
  rrule: string;
  series_head: boolean | null;
  series_natural_language: string;
}

export interface CanvasEvent {
  courseId: number;
  events: CanvasAssignment[];
}

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
