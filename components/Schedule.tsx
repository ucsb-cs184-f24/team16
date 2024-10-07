import {StyleSheet} from 'react-native';
import {PropsWithChildren, useState} from "react";

import {Calendar, dateFnsLocalizer, Event} from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import {addHours} from 'date-fns/addHours';
import {startOfHour} from 'date-fns/startOfHour';

import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  'en-US': enUS,
}
const endOfHour = (date: Date): Date => addHours(startOfHour(date), 1)
const now = new Date();
const start = endOfHour(now);
const end = addHours(start, 2);
// The types here are `object`. Strongly consider making them better as removing `locales` caused a fatal error
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type Props = PropsWithChildren<{
  events: Event[] | null;
}>;


export function Schedule(props: Props) {

  const [events, setEvents] = useState<Event[]>(props.events ?? [
    {
      title: 'Learn cool stuff',
      start,
      end,
    },
  ]);

  return (
      <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{height: 500}}
      />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
