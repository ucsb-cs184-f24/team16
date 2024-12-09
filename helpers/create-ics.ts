// import * as ics from "ics";
import type { CalendarsData, Quarters } from "@/types";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
// import duration from "dayjs/plugin/duration";
import ical, {
  ICalEventBusyStatus,
  ICalEventRepeatingFreq,
  ICalEventStatus,
  ICalWeekday,
} from "ical-generator";
import { getValue } from "@/helpers/storage";
import { TimelineEventProps } from "react-native-calendars";

dayjs.extend(customParseFormat);
// dayjs.extend(duration);

const UCSBDayToRRuleDay: Record<string, ICalWeekday> = {
  U: ICalWeekday.SU,
  M: ICalWeekday.MO,
  T: ICalWeekday.TU,
  W: ICalWeekday.WE,
  R: ICalWeekday.TH,
  F: ICalWeekday.FR,
  S: ICalWeekday.SA,
};

const UCSBDayToNumber: Record<string, number> = {
  U: 0,
  M: 1,
  T: 2,
  W: 3,
  R: 4,
  F: 5,
  S: 6,
};

// Helper function to validate dates
function isValidDate(date: dayjs.Dayjs): boolean {
  return date.isValid();
}

export default function createIcs(): string {
  const quarters = getValue<Quarters>("quarters");
  const calendars = getValue<CalendarsData>("calendars");
  const custom = getValue<TimelineEventProps[]>("custom events");
  const calendar = ical({
    name: "Calendar",
    timezone: "US/Pacific",
  });

  if (calendars) {
    if (quarters && calendars.ucsbEvents) {
      const first = dayjs(quarters.current.firstDayOfClasses);
      const last = dayjs(quarters.current.lastDayOfClasses);

      for (const course of calendars.ucsbEvents.courses) {
        for (const session of course.sessions) {
          const firstDay = Math.min(
            ...session.days.map((day) => UCSBDayToNumber[day])
          );
          let date = first;
          while (date.day() !== firstDay) {
            date = date.date(date.date() + 1);
          }
          const start = dayjs(
            `${date.format("YYYY-MM-DD")} ${session.start}`,
            "YYYY-MM-DD h:mm A"
          );
          const end = dayjs(
            `${date.format("YYYY-MM-DD")} ${session.end}`,
            "YYYY-MM-DD h:mm A"
          );

          // Skip event if dates are invalid
          if (!isValidDate(start) || !isValidDate(end)) {
            console.warn(`Invalid event skipped: ${session.name}`);
            continue;
          }

          calendar.createEvent({
            start: start.toDate(),
            end: end.toDate(),
            repeating: {
              freq: ICalEventRepeatingFreq.WEEKLY,
              startOfWeek: ICalWeekday.SU,
              byDay: session.days.map((day) => UCSBDayToRRuleDay[day]),
              interval: 1,
              until: last.toDate(),
            },
            summary: session.name,
            description: session.location,
            status: ICalEventStatus.CONFIRMED,
            busystatus: ICalEventBusyStatus.BUSY,
            categories: [
              {
                name: "UCSB Courses",
              },
            ],
          });
        }
      }

      for (const final of calendars.ucsbEvents.finals) {
        const start = dayjs(final.start);
        const end = dayjs(final.end);

        // Skip event if dates are invalid
        if (!isValidDate(start) || !isValidDate(end)) {
          console.warn(`Invalid final skipped: ${final.name}`);
          continue;
        }

        calendar.createEvent({
          start: start.toDate(),
          end: end.toDate(),
          summary: final.name,
          description: "",
          status: ICalEventStatus.CONFIRMED,
          busystatus: ICalEventBusyStatus.BUSY,
          categories: [
            {
              name: "UCSB Finals",
            },
          ],
        });
      }
    }

    if (calendars.canvasEvents) {
      for (const event of calendars.canvasEvents) {
        for (const assignment of event.events) {
          const start = dayjs(assignment.start_at);
          const end = dayjs(assignment.end_at);

          // Skip event if dates are invalid
          if (!isValidDate(start) || !isValidDate(end)) {
            console.warn(`Invalid canvas event skipped: ${assignment.title}`);
            continue;
          }

          calendar.createEvent({
            start: start.toDate(),
            end: end.toDate(),
            repeating: assignment.rrule,
            summary: assignment.title,
            description: assignment.description,
            status: ICalEventStatus.CONFIRMED,
            busystatus: ICalEventBusyStatus.FREE,
            categories: [
              {
                name: "Canvas Assignments",
              },
            ],
          });
        }
      }
    }

    if (calendars.gradescopeCourses) {
      for (const course of calendars.gradescopeCourses) {
        for (const assignment of course.assignments) {
          const start = dayjs(assignment.due, "YYYY-MM-DD HH-mm-ss ZZ");
          const end = start;

          // Skip event if dates are invalid
          if (!isValidDate(start)) {
            console.warn(`Invalid Gradescope assignment skipped: ${assignment.name}`);
            continue;
          }

          calendar.createEvent({
            start: start.toDate(),
            end: end.toDate(),
            summary: `${course.shortname} - ${assignment.name}`,
            description: assignment.href,
            status: ICalEventStatus.CONFIRMED,
            busystatus: ICalEventBusyStatus.FREE,
            categories: [
              {
                name: "Gradescope Assignments",
              },
              {
                name: course.name,
              },
            ],
          });
        }
      }
    }
  }

  if (custom) {
    for (const event of custom) {
      const start = dayjs(event.start, "YYYY-MM-DD HH:mm:ss");
      const end = dayjs(event.end, "YYYY-MM-DD HH:mm:ss");

      // Skip event if dates are invalid
      if (!isValidDate(start) || !isValidDate(end)) {
        console.warn(`Invalid custom event skipped: ${event.title}`);
        continue;
      }

      calendar.createEvent({
        start: start.toDate(),
        end: end.toDate(),
        summary: event.title,
        description: event.summary,
        status: ICalEventStatus.CONFIRMED,
        busystatus: ICalEventBusyStatus.FREE,
        categories: [
          {
            name: "Custom events",
          },
        ],
      });
    }
  }

  return calendar.toString();
}
