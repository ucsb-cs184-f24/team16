import {jsdom} from "jsdom-jscore-rn";
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

  try {
    const response = await fetch(url, {method: 'GET', headers: {headers: JSON.stringify(headers)}});
    if (!response.ok) {
      throw new Error('Failed to fetch quarter info');
    }
    return response.json();
  } catch (error) {
    throw error;
  }
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

const UCSBFinalDatePattern = /\w+, (?<MMM>\w+) (?<D>\d+), (?<YYYY>\d+) (?<h1>\d+):(?<mm1>\d+) (?<A1>\w+) - (?<h2>\d+):(?<mm2>\d+) (?<A2>\w+)/;

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
        const {MMM, D, YYYY, h1, mm1, A1, h2, mm2, A2} = match.groups;
        result.finals.push({
          name: nameElement.textContent.replaceAll(/\s+/g, " ").trim(),
          start: dayjs(`${MMM} ${D}, ${YYYY} ${h1}:${mm1} ${A1}`, "MMM D, YYYY h:mm A"),
          end: dayjs(`${MMM} ${D}, ${YYYY} ${h2}:${mm2} ${A2}`, "MMM D, YYYY h:mm A")
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

export async function getCanvasAssignments(headers: HeadersInit, quarter: Quarter): Promise<any> {
  const startDate = quarter.firstDayOfQuarter;
  const endDate = quarter.lastDayOfSchedule;

  const coursesResponse = await fetch("https://ucsb.instructure.com/api/v1/courses", {
    method: "GET",
    headers: headers,
  });

  //console.log('Fetching courses with headers:', headers);
  console.log('Courses Response Status:', coursesResponse.status);

  if (!coursesResponse.ok) {
    const errorText = await coursesResponse.text();
    console.error("Failed to fetch courses:", errorText);
    throw new Error("Failed to fetch courses");
  }

  const courses = await coursesResponse.json();
  console.log('Fetched courses:', courses);

  const eventsPromises = courses.map(async (course: any) => {
    const courseId = course.id;

    const calendarEventsResponse = await fetch(
      `https://ucsb.instructure.com/api/v1/calendar_events?type=assignment&start_date=${startDate}&end_date=${endDate}&context_codes[]=course_${courseId}`,
      {
        method: "GET",
        headers: headers,
      }
    );

    console.log(`Fetching calendar events for course ${courseId}`);
    //console.log(`Fetching calendar events for course ${courseId} with URL:`, calendarEventsResponse.url);
    console.log('Calendar Events Response Status:', calendarEventsResponse.status);

    if (!calendarEventsResponse.ok) {
      const errorText = await calendarEventsResponse.text();
      console.error(`Failed to fetch calendar events for course ${courseId}:`, errorText);
      throw new Error(`Failed to fetch calendar events for course ${courseId}`);
    }

    const events = await calendarEventsResponse.json();
    console.log(`Events for course ${courseId}:`, events);
    return { courseId, events };
  });

  const eventsByCourse = await Promise.all(eventsPromises);

  return eventsByCourse;
}

