import type {JSDOM} from "jsdom";
import type {GradescopeAssignment} from "../types";

interface GradescopeCourseInfo {
  shortname: string;
  name: string;
  href: string;
}

/**
 * Get Gradescope courses
 * @param {JSDOM} jsdom - JSDOM object
 * @return {GradescopeCourseInfo[]}
 */
export function getGradescopeCourses(jsdom: JSDOM): GradescopeCourseInfo[] {
  const courseBoxes = jsdom.window.document.querySelector(
    ".courseList--coursesForTerm"
  )?.querySelectorAll<HTMLAnchorElement>("a.courseBox");
  if (courseBoxes) {
    return Array.from(courseBoxes).map((courseBox) => ({
      shortname: courseBox.querySelector(
        ".courseBox--shortname"
      )?.textContent ?? "",
      name: courseBox.querySelector(
        ".courseBox--name"
      )?.textContent ?? "",
      href: courseBox.href,
    }));
  } else {
    return [];
  }
}

/**
 * Get Gradescope assigmnents
 * @param {JSDOM} jsdom - JSDOM object
 * @return {GradescopeAssignment[]}
 */
export function getGradescopeAssignments(jsdom: JSDOM): GradescopeAssignment[] {
  const rows = jsdom.window.document.querySelectorAll(
    "table#assignments-student-table tbody tr"
  );
  if (rows) {
    return Array.from(rows).map((row) => {
      const a = row.querySelector<HTMLAnchorElement>("th a");
      return {
        name: a?.textContent ?? "",
        href: a?.href ?? "",
        released: row.querySelector<HTMLTimeElement>(
          ".progressBar--caption time[aria-label^=\"Released\"]"
        )?.dateTime,
        due: row.querySelector<HTMLTimeElement>(
          ".progressBar--caption time[aria-label^=\"Due\"]"
        )?.dateTime,
        late: row.querySelector<HTMLTimeElement>(
          ".progressBar--caption time[aria-label^=\"Late\"]"
        )?.dateTime,
      };
    });
  } else {
    return [];
  }
}
