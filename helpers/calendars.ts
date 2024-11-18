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

export function processCalendars(data: CalendarsData, quarters: Quarters): Record<string, TimelineEventProps[]> {
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
  }

  for (const final of data.ucsbEvents.finals) {
    eventsByDate[dayjs(final.start).format("YYYY-MM-DD")] = [{
      start: dayjs(final.start).format("YYYY-MM-DD HH:mm:ss"),
      end: dayjs(final.end).format("YYYY-MM-DD HH:mm:ss"),
      title: final.name,
      summary: "",
      color: "#2280bf"
    }];
  }

  for (const course of data.canvasEvents) {
    for (const event of course.events) {
      console.log("Canvas event", event);
      let start = dayjs(event.start_at);
      let end = dayjs(event.end_at);
      end = end.hour(end.hour() + 1);
      const dateString1 = start.hour(start.hour()).format("YYYY-MM-DD");
      const dateString2 = end.hour(end.hour()).format("YYYY-MM-DD");
      if (!eventsByDate[dateString1]) {
        eventsByDate[dateString1] = [];
      }
      if (!eventsByDate[dateString2]) {
        eventsByDate[dateString2] = [];
      }

      eventsByDate[dateString1].push({
        date: dateString1,
        start: start.format("YYYY-MM-DD HH:mm:ss"),
        end: end.format("YYYY-MM-DD HH:mm:ss"),
        title: event.title,
        summary: event.html_url,
        color: "#f3c09e"
      });
      if (dateString1 !== dateString2) {
        console.log("Duplicating event", {
          date: dateString2,
          start: start.format("YYYY-MM-DD HH:mm:ss"),
          end: end.format("YYYY-MM-DD HH:mm:ss"),
          title: event.title,
          summary: event.html_url,
          color: "#f3c09e"
        });
        eventsByDate[dateString2].push({
          date: dateString2,
          start: start.format("YYYY-MM-DD HH:mm:ss"),
          end: end.format("YYYY-MM-DD HH:mm:ss"),
          title: event.title,
          summary: event.html_url,
          color: "#f3c09e"
        });
      }
    }
  }

  return eventsByDate;
}
