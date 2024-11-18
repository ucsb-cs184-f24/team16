import type {CalendarsData, Quarters, UCSBSession} from "@/types";
import dayjs from "dayjs";
import {TimelineEventProps} from "react-native-calendars";
import {MarkedDates} from "react-native-calendars/src/types";

const letterToDay: Record<string, number> = {
  U: 0,
  M: 1,
  T: 2,
  W: 3,
  R: 4,
  F: 5,
  S: 6
};

export function processCalendars(data: CalendarsData, quarters: Quarters): [Record<string, TimelineEventProps[]>, MarkedDates] {
  const marked: MarkedDates = {};
  const eventsByDate: Record<string, TimelineEventProps[]> = {};

  const UCSBSessionByDay: UCSBSession[][] = [[], [], [], [], [], [], []];

  for (const course of data.ucsbEvents.courses) {
    console.log("course", course);
    for (const session of course.sessions) {
      console.log("session", session);
      for (const day of session.days) {
        UCSBSessionByDay[letterToDay[day]].push(session);
      }
    }
  }

  console.log("UCSBSessionByDay", UCSBSessionByDay);

  let end = dayjs(quarters.current.lastDayOfClasses);
  end = end.date(end.date() + 1);

  for (let date = dayjs(quarters.current.firstDayOfClasses); date.diff(end) < 0; date = date.date(date.date() + 1)) {
    const dateString = date.format("YYYY-MM-DD");
    eventsByDate[dateString] = UCSBSessionByDay[date.day()].map(session => ({
      start: dayjs(`${dateString} ${session.start}`, "YYYY-MM-DD h:mm A").format("YYYY-MM-DD HH:mm:ss"),
      end: dayjs(`${dateString} ${session.end}`, "YYYY-MM-DD h:mm A").format("YYYY-MM-DD HH:mm:ss"),
      title: session.name,
      summary: session.location,
      color: "#edf3fe"
    }));
    marked[dateString] = {
      marked: eventsByDate[dateString].length > 0
    };
  }

  for (const final of data.ucsbEvents.finals) {
    const dateString = dayjs(final.start).format("YYYY-MM-DD");
    eventsByDate[dayjs(final.start).format("YYYY-MM-DD")] = [{
      start: dayjs(final.start).format("YYYY-MM-DD HH:mm:ss"),
      end: dayjs(final.end).format("YYYY-MM-DD HH:mm:ss"),
      title: final.name,
      summary: "",
      color: "#2280bf"
    }];
    marked[dateString] = {
      marked: true
    };
  }

  for (const course of data.canvasEvents) {
    for (const event of course.events) {
      console.log("Canvas event", event);
      let start = dayjs(event.start_at);
      let end = dayjs(event.end_at);
      end = end.hour(end.hour() + 1);
      const dateString1 = start.format("YYYY-MM-DD");
      const dateString2 = end.format("YYYY-MM-DD");
      marked[dateString1] = {
        marked: true
      };
      marked[dateString2] = {
        marked: true
      };
      const dateString3 = start.hour(start.hour() - 1).format("YYYY-MM-DD");
      const dateString4 = end.hour(end.hour() + 1).format("YYYY-MM-DD");
      if (!eventsByDate[dateString3]) {
        eventsByDate[dateString3] = [];
      }
      if (!eventsByDate[dateString4]) {
        eventsByDate[dateString4] = [];
      }

      const event2: TimelineEventProps = {
        start: start.format("YYYY-MM-DD HH:mm:ss"),
        end: end.format("YYYY-MM-DD HH:mm:ss"),
        title: event.title,
        summary: event.html_url,
        color: "#f3c09e"
      };
      eventsByDate[dateString3].push({
        ...event2,
        date: dateString3
      });
      if (dateString3 !== dateString4) {
        console.log("Duplicating event", event);
        eventsByDate[dateString4].push({
          ...event2,
          date: dateString4
        });
      }
    }
  }

  return [eventsByDate, marked];
}
