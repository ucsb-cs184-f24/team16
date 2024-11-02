import groupBy from 'lodash/groupBy';
import filter from 'lodash/filter';
import find from 'lodash/find';

import React, {Component} from 'react';
import {Alert} from 'react-native';
import {
  ExpandableCalendar,
  TimelineEventProps,
  TimelineList,
  CalendarProvider,
  TimelineProps,
  CalendarUtils
} from 'react-native-calendars';
import {Quarter, UCSBEvents} from "@/helpers/api";
import { keys } from 'lodash';

const EVENT_COLOR = '#e6add8';
const today = new Date();
const getDate = (offset = 0) => CalendarUtils.getCalendarDateString(new Date().setDate(today.getDate() + offset));

const timelineEvents: TimelineEventProps[] = [
  {
    start: `${getDate(-1)} 09:20:00`,
    end: `${getDate(-1)} 12:00:00`,
    title: 'Merge Request to React Native Calendars',
    summary: 'Merge Timeline Calendar to React Native Calendars'
  },
  {
    start: `${getDate()} 01:15:00`,
    end: `${getDate()} 02:30:00`,
    title: 'Meeting A',
    summary: 'Summary for meeting A',
    color: EVENT_COLOR
  },
  {
    start: `${getDate()} 01:30:00`,
    end: `${getDate()} 02:30:00`,
    title: 'Meeting B',
    summary: 'Summary for meeting B',
    color: EVENT_COLOR
  },
  {
    start: `${getDate()} 01:45:00`,
    end: `${getDate()} 02:45:00`,
    title: 'Meeting C',
    summary: 'Summary for meeting C',
    color: EVENT_COLOR
  },
  {
    start: `${getDate()} 02:40:00`,
    end: `${getDate()} 03:10:00`,
    title: 'Meeting D',
    summary: 'Summary for meeting D',
    color: EVENT_COLOR
  },
  {
    start: `${getDate()} 02:50:00`,
    end: `${getDate()} 03:20:00`,
    title: 'Meeting E',
    summary: 'Summary for meeting E',
    color: EVENT_COLOR
  },
  {
    start: `${getDate()} 04:30:00`,
    end: `${getDate()} 05:30:00`,
    title: 'Meeting F',
    summary: 'Summary for meeting F',
    color: EVENT_COLOR
  },
  {
    start: `${getDate(1)} 00:30:00`,
    end: `${getDate(1)} 01:30:00`,
    title: 'Visit Grand Mother',
    summary: 'Visit Grand Mother and bring some fruits.',
    color: 'lightblue'
  },
  {
    start: `${getDate(1)} 02:30:00`,
    end: `${getDate(1)} 03:20:00`,
    title: 'Meeting with Prof. Behjet Zuhaira',
    summary: 'Meeting with Prof. Behjet at 130 in her office.',
    color: EVENT_COLOR
  },
  {
    start: `${getDate(1)} 04:10:00`,
    end: `${getDate(1)} 04:40:00`,
    title: 'Tea Time with Dr. Hasan',
    summary: 'Tea Time with Dr. Hasan, Talk about Project'
  },
  {
    start: `${getDate(1)} 01:05:00`,
    end: `${getDate(1)} 01:35:00`,
    title: 'Dr. Mariana Joseph',
    summary: '3412 Piedmont Rd NE, GA 3032'
  },
  {
    start: `${getDate(1)} 14:30:00`,
    end: `${getDate(1)} 16:30:00`,
    title: 'Meeting Some Friends in ARMED',
    summary: 'Arsalan, Hasnaat, Talha, Waleed, Bilal',
    color: 'pink'
  },
  {
    start: `${getDate(2)} 01:40:00`,
    end: `${getDate(2)} 02:25:00`,
    title: 'Meet Sir Khurram Iqbal',
    summary: 'Computer Science Dept. Comsats Islamabad',
    color: 'orange'
  },
  {
    start: `${getDate(2)} 04:10:00`,
    end: `${getDate(2)} 04:40:00`,
    title: 'Tea Time with Colleagues',
    summary: 'WeRplay'
  },
  {
    start: `${getDate(2)} 00:45:00`,
    end: `${getDate(2)} 01:45:00`,
    title: 'Lets Play Apex Legends',
    summary: 'with Boys at Work'
  },
  {
    start: `${getDate(2)} 11:30:00`,
    end: `${getDate(2)} 12:30:00`,
    title: 'Dr. Mariana Joseph',
    summary: '3412 Piedmont Rd NE, GA 3032'
  },
  {
    start: `${getDate(4)} 12:10:00`,
    end: `${getDate(4)} 13:45:00`,
    title: 'Merge Request to React Native Calendars',
    summary: 'Merge Timeline Calendar to React Native Calendars'
  }
];

const INITIAL_TIME = {hour: 9, minutes: 0};
const EVENTS: TimelineEventProps[] = timelineEvents;



interface ScheduleProps {
  quarter: Quarter | null;
  canvasEvents: object | null; // TODO: Define a type
  ucsbEvents: UCSBEvents | null;
}

interface ScheduleState {
  currentDate: string;
  events: TimelineEventProps[];
  eventsByDate: Record<string, TimelineEventProps[]>;
}

export default class Schedule extends Component<ScheduleProps, ScheduleState> {
  state = {
    currentDate: getDate(),
    events: EVENTS,
    eventsByDate: groupBy(EVENTS, e => CalendarUtils.getCalendarDateString(e.start)) as {
      [key: string]: TimelineEventProps[];
    }
  };

  componentDidMount() {
    this.processUCSBEvents();
  }

  componentDidUpdate(prevProps: ScheduleProps) {
    if (prevProps.ucsbEvents !== this.props.ucsbEvents) {
      this.processUCSBEvents();
    }
  }

  convert(time: string): string {
    const timeRegex = /^(\d{1,2}):(\d{2})\s?(AM|PM)$/i;
    const match = time.match(timeRegex);
  
    if (!match) {
      throw new Error("Invalid time format");
    }
  
    let [ , hours, minutes, period ] = match;
    let hoursNumber = parseInt(hours);
  
    if (period.toUpperCase() === 'PM' && hoursNumber !== 12) {
      hoursNumber += 12;
    } else if (period.toUpperCase() === 'AM' && hoursNumber === 12) {
      hoursNumber = 0;
    }
  
    return `${hoursNumber.toString().padStart(2, '0')}:${minutes}:00`;
  }

   processUCSBEvents() {
    const { ucsbEvents } = this.props;
    if (!ucsbEvents) return;

    this.setState({ eventsByDate: {} });

    const transformedEvents: TimelineEventProps[] = [];

    Object.keys(ucsbEvents).forEach(day => {
      const events = ucsbEvents[day as keyof UCSBEvents];
      // console.log(`Events for ${day}:`, events);
      events.forEach(event => {
        if (event.start && event.end) {
          const startFormatted = `${getDate(0)} ${this.convert(event.start)}`;
          const endFormatted = `${getDate(0)} ${this.convert(event.end)}`;

          transformedEvents.push({
            start: startFormatted, 
            end: endFormatted,
            title: event.content || 'No Title',
            summary: event.event || '',
            color: EVENT_COLOR
          });
        }
      });
    });

    const eventsByDate = groupBy(transformedEvents, e => CalendarUtils.getCalendarDateString(e.start.split(' ')[0]));
    // console.log("Processed UCSB Events:", eventsByDate);
    this.setState({ eventsByDate });



    // const eventsByDate = transformedEvents;
    // console.log("Processed UCSB Events:", eventsByDate);
    
    // this.setState({ eventsByDate });

    // this.setState({ events: transformedEvents });
  }

  marked = {
    [`${getDate(-1)}`]: {marked: true},
    [`${getDate()}`]: {marked: true},
    [`${getDate(1)}`]: {marked: true},
    [`${getDate(2)}`]: {marked: true},
    [`${getDate(4)}`]: {marked: true}
  };

  onDateChanged = (date: string, source: string) => {
    console.log('TimelineCalendarScreen onDateChanged: ', date, source);
    this.setState({currentDate: date});
  };

  onMonthChange = (month: any, updateSource: any) => {
    console.log('TimelineCalendarScreen onMonthChange: ', month, updateSource);
  };

  createNewEvent: TimelineProps['onBackgroundLongPress'] = (timeString, timeObject) => {
    const {eventsByDate} = this.state;
    const hourString = `${(timeObject.hour + 1).toString().padStart(2, '0')}`;
    const minutesString = `${timeObject.minutes.toString().padStart(2, '0')}`;

    const newEvent = {
      id: 'draft',
      start: `${timeString}`,
      end: `${timeObject.date} ${hourString}:${minutesString}:00`,
      title: 'New Event',
      color: 'white'
    };

    if (timeObject.date) {
      if (eventsByDate[timeObject.date]) {
        eventsByDate[timeObject.date] = [...eventsByDate[timeObject.date], newEvent];
        this.setState({eventsByDate});
      } else {
        eventsByDate[timeObject.date] = [newEvent];
        this.setState({eventsByDate: {...eventsByDate}});
      }
    }
  };

  approveNewEvent: TimelineProps['onBackgroundLongPressOut'] = (_timeString, timeObject) => {
    const {eventsByDate} = this.state;

    Alert.prompt('New Event', 'Enter event title', [
      {
        text: 'Cancel',
        onPress: () => {
          if (timeObject.date) {
            eventsByDate[timeObject.date] = filter(eventsByDate[timeObject.date], e => e.id !== 'draft');

            this.setState({
              eventsByDate
            });
          }
        }
      },
      {
        text: 'Create',
        onPress: eventTitle => {
          if (timeObject.date) {
            const draftEvent = find(eventsByDate[timeObject.date], {id: 'draft'});
            if (draftEvent) {
              draftEvent.id = undefined;
              draftEvent.title = eventTitle ?? 'New Event';
              draftEvent.color = 'lightgreen';
              eventsByDate[timeObject.date] = [...eventsByDate[timeObject.date]];

              this.setState({
                eventsByDate
              });
            }
          }
        }
      }
    ]);
  };

  

  private timelineProps: Partial<TimelineProps> = {
    format24h: true,
    onBackgroundLongPress: this.createNewEvent,
    onBackgroundLongPressOut: this.approveNewEvent,
    // scrollToFirst: true,
    // start: 0,
    // end: 24,
    unavailableHours: [{start: 0, end: 6}, {start: 22, end: 24}],
    overlapEventsSpacing: 8,
    rightEdgeSpacing: 24,
  };

  render() {
    const { quarter, canvasEvents, ucsbEvents } = this.props;
    const { currentDate, eventsByDate } = this.state;

  // Run processUCSBEvents and capture the output
    // const eventsByDate = this.processUCSBEvents();
    console.log("Derived eventsByDate:", eventsByDate);


    return (
        <CalendarProvider
            date={currentDate}
            onDateChanged={this.onDateChanged}
            onMonthChange={this.onMonthChange}
            showTodayButton
            disabledOpacity={0.6}
            // numberOfDays={3}
        >
          <ExpandableCalendar
              firstDay={1}
              leftArrowImageSource={require('../img/previous.png')}
              rightArrowImageSource={require('../img/next.png')}
              markedDates={this.marked}
          />
          <TimelineList
              events={eventsByDate}
              timelineProps={this.timelineProps}
              showNowIndicator
              // scrollToNow
              scrollToFirst
              initialTime={INITIAL_TIME}
          />

        </CalendarProvider>
    );
  }
}