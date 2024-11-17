import {type JSDOM} from "jsdom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("America/Los_Angeles");

interface UCSBSession {
  name: string;
  days: string[];
  start: string;
  end: string;
  location: string;
  url: string;
  instructors: string[];
}

interface UCSBCourse {
  name: string;
  sessions: UCSBSession[];
}

interface UCSBFinal {
  name: string;
  start: string;
  end: string;
}

export interface UCSBEvents {
  courses: UCSBCourse[];
  finals: UCSBFinal[];
}

const UCSBFinalDatePattern = new RegExp([
  /\w+, (?<MMMM>\w+) (?<D>\d+), (?<YYYY>\d+) /,
  /(?<h1>\d+):(?<mm1>\d+) (?<A1>\w+) - (?<h2>\d+):(?<mm2>\d+) (?<A2>\w+)/,
].map((r) => r.source).join(""));

/**
 * Get UCSB Events
 * @param {JSDOM} jsdom - JSDOM object
 * @return {UCSBEvents}
 */
export default function getUCSBEvents(jsdom: JSDOM): UCSBEvents {
  const result: UCSBEvents = {
    courses: [],
    finals: [],
  };
  const gridElement =
      jsdom.window.document.querySelector("#ctl00_pageContent_ScheduleGrid");
  if (gridElement) {
    const scheduleItemElements =
        gridElement.querySelectorAll(".scheduleItem:not(:last-child)");
    for (const scheduleItem of Array.from(scheduleItemElements)) {
      const course: UCSBCourse = {
        name: scheduleItem.querySelector(".courseTitle > span")
          ?.textContent?.replaceAll(/\s+/g, " ").trim() ?? "",
        sessions: [],
      };
      const sessionElements = scheduleItem.querySelectorAll(".session");
      for (const sessionItem of Array.from(sessionElements)) {
        const labelElements = sessionItem.querySelectorAll("label.visible-xs");
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
              for (let element: Element | null = sibling as Element;
                element;
                element = element.nextElementSibling) {
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
  const finalElements =
      jsdom.window.document.querySelectorAll(".finalBlock:not(:last-child)");
  for (const element of Array.from(finalElements)) {
    const [nameElement, timeElement] =
        Array.from(element.querySelectorAll("div"));
    if (nameElement.textContent) {
      const match = timeElement.textContent?.match(UCSBFinalDatePattern);
      if (match?.groups) {
        const {MMMM, D, YYYY, h1, mm1, A1, h2, mm2, A2} = match.groups;
        result.finals.push({
          name: nameElement.textContent.replaceAll(/\s+/g, " ").trim(),
          start: dayjs(
            `${MMMM} ${D}, ${YYYY} ${h1}:${mm1} ${A1}`,
            "MMMM D, YYYY h:mm A"
          ).toISOString(),
          end: dayjs(
            `${MMMM} ${D}, ${YYYY} ${h2}:${mm2} ${A2}`,
            "MMMM D, YYYY h:mm A"
          ).toISOString(),
        });
      }
    }
  }
  return result;
}
