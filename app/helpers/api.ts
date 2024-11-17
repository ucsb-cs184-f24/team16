import {jsdom} from "jsdom-jscore-rn";
import "core-js/actual/url";
import "core-js/actual/url-search-params";
import dayjs, {Dayjs} from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export interface Quarter {
  "quarter": string;
  "qyy": string;
  "name": string;
  "category": string;
  "academicYear": string;
  "firstDayOfClasses": string;
  "lastDayOfClasses": string;
  "firstDayOfFinals": string;
  "lastDayOfFinals": string;
  "firstDayOfQuarter": string;
  "lastDayOfSchedule": string;
  "pass1Begin": string;
  "pass2Begin": string;
  "pass3Begin": string;
  "feeDeadline": string;
  "lastDayToAddUnderGrad": string;
  "lastDayToAddGrad": string;
  "lastDayThirdWeek": string;
}

export async function getQuarter(): Promise<Quarter> {
  const url = 'https://api-transformer.onrender.com//https://api.ucsb.edu/academics/quartercalendar/v1/quarters/current';
  const headers = {
    'accept': 'application/json',
    'ucsb-api-version': '1.0',
    'ucsb-api-key': '1M1qsvRB65v5n0CR9ihHJCsEJF2lCvZe'
  };

  const response = await fetch(url, {method: 'GET', headers: {headers: JSON.stringify(headers)}});
  if (!response.ok) {
    throw new Error('Failed to fetch quarter info');
  }
  return response.json();
}

export interface UCSBSession {
  name: string;
  days: string[];
  start: string;
  end: string;
  location: string;
  url: string;
  instructors: string[];
}

export interface UCSBCourse {
  name: string;
  sessions: UCSBSession[];
}

export interface UCSBFinal {
  name: string;
  start: Dayjs;
  end: Dayjs;
}

export interface UCSBEvents {
  courses: UCSBCourse[];
  finals: UCSBFinal[];
}

const UCSBFinalDatePattern = /\w+, (?<MMMM>\w+) (?<D>\d+), (?<YYYY>\d+) (?<h1>\d+):(?<mm1>\d+) (?<A1>\w+) - (?<h2>\d+):(?<mm2>\d+) (?<A2>\w+)/;

export async function getUCSBEvents(headers: HeadersInit): Promise<UCSBEvents> {
  const response = await fetch("https://api-transformer.onrender.com//https://my.sa.ucsb.edu/gold/StudentSchedule.aspx", {
    "method": "GET",
    "headers": headers
  });
  const result: UCSBEvents = {
    courses: [],
    finals: []
  };
  const dom = jsdom(await response.text());
  // console.log("Dom", dom.title);
  const gridElement = dom.querySelector('#ctl00_pageContent_ScheduleGrid');
  if (gridElement) {
    const scheduleItemElements = gridElement.querySelectorAll('.scheduleItem:not(:last-child)');
    for (const scheduleItem of Array.from(scheduleItemElements)) {
      const course: UCSBCourse = {
        name: scheduleItem.querySelector('.courseTitle > span')?.textContent?.replaceAll(/\s+/g, " ").trim() ?? "",
        sessions: []
      };
      const sessionElements = scheduleItem.querySelectorAll('.session');
      for (const sessionItem of Array.from(sessionElements)) {
        const labelElements = sessionItem.querySelectorAll('label.visible-xs');
        let days: string[] | null = null;
        let start: string | null = null;
        let end: string | null = null;
        let location: string | null = null;
        let url: string | null = null;
        let instructors: string[] | null = null;
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
                  url = (sibling as HTMLAnchorElement).href;
                }
                break;
              case "Instructor":
                instructors = [];
                for (let element: Element | null = sibling as Element; element; element = element.nextElementSibling) {
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
        const {MMMM, D, YYYY, h1, mm1, A1, h2, mm2, A2} = match.groups;
        result.finals.push({
          name: nameElement.textContent.replaceAll(/\s+/g, " ").trim(),
          start: dayjs(`${MMMM} ${D}, ${YYYY} ${h1}:${mm1} ${A1}`, "MMMM D, YYYY h:mm A"),
          end: dayjs(`${MMMM} ${D}, ${YYYY} ${h2}:${mm2} ${A2}`, "MMMM D, YYYY h:mm A")
        });
      }
    }
  }
  return result;
}

type CanvasEvents = object;

export async function getCanvasEvents(headers: HeadersInit): Promise<CanvasEvents> {
  const response = await fetch("https://ucsb.instructure.com/api/v1/users/self", {
    "method": "GET",
    "headers": headers
  });
  return response.json();
}

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
  grading_periods: any[] | null;
  grading_standard_id: number;
  grade_passback_setting: string;
  created_at: string;
  start_at: string | null;
  end_at: string | null;
  locale: string;
  enrollments: any | null;
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
  course_progress: any | null;
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
  assignment_overrides: any[] | null;
  important_dates: boolean;
  rrule: string;
  series_head: boolean | null;
  series_natural_language: string;
}

export interface CanvasEvent {
  courseId: number;
  events: CanvasAssignment[];
}

export async function getCanvasAssignments(headers: HeadersInit, quarter: Quarter): Promise<CanvasEvent[]> {
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

  const courses: CanvasCourse[] = await coursesResponse.json();

  const currentCourses: CanvasCourse[] = [];

  for (const course of courses) {
    const quarterFirstDay = dayjs(quarter.firstDayOfClasses);

    let courseDate: dayjs.Dayjs | null = null;

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
      courseDate = dayjs(course.start_at);
    } else if (course.created_at) {
      courseDate = dayjs(course.created_at);
    } else {
      console.log(`Excluding Course ID: ${course.id}, Name: ${course.name}, Reason: No start_at or created_at`);
      continue;
    }

    const diffDays = Math.abs(quarterFirstDay.diff(courseDate, 'day'));

    if (diffDays <= 30) {
      console.log(`Including Course ID: ${course.id}, Name: ${course.name}, Reason: Date within threshold`);
      currentCourses.push(course);
    } else {
      //console.log(`Excluding Course ID: ${course.id}, Name: ${course.name}, Reason: diffDays ${diffDays} > 30`);
    }
  }

  // Proceed with fetching events for current courses
  const eventsPromises = currentCourses.map<PromiseLike<CanvasEvent>>(async (course: CanvasCourse, _index: number, _array: CanvasCourse[]): Promise<CanvasEvent> => {
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

    const events: CanvasAssignment[] = await calendarEventsResponse.json();
    return {courseId, events};
  });

  const eventsByCourse = await Promise.all(eventsPromises);
  //console.log("Canvas Assignments:", JSON.stringify(eventsByCourse, null, 2));

  return eventsByCourse;
}

