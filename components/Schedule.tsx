import {CanvasEvent} from "@/helpers/api";

import React, {Component} from 'react';
import {
  ExpandableCalendar,
  TimelineEventProps,
  TimelineList,
  CalendarProvider,
  TimelineProps,
} from 'react-native-calendars';
import {Quarter, UCSBEvents, UCSBSession} from "@/helpers/api";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const INITIAL_TIME = {hour: 9, minutes: 0};

const letterToDay: Record<string, number> = {
  U: 0,
  M: 1,
  T: 2,
  W: 3,
  R: 4,
  F: 5,
  S: 6
};

interface ScheduleProps {
  quarter: Quarter | null;
  canvasEvents: CanvasEvent[] | null;
  ucsbEvents: UCSBEvents | null;
}

interface ScheduleState {
  currentDate: string;
}

interface Marked {
  marked: boolean;
}

export default class Schedule extends Component<ScheduleProps, ScheduleState> {
  state: ScheduleState = {
    currentDate: dayjs().format("YYYY-MM-DD")
  };

  UCSBEventsByDate: Record<string, TimelineEventProps[]> = {};
  canvasEventsByDate: Record<string, TimelineEventProps[]> = {};

  eventsByDate = new Proxy({} as Record<string, TimelineEventProps[]>, {
    has: (target: Record<string, TimelineEventProps[]>, p: string): boolean => {
      return target.hasOwnProperty(p)
         || this.UCSBEventsByDate?.hasOwnProperty(p)
         || this.canvasEventsByDate?.hasOwnProperty(p);
    },
    get: (target: Record<string, TimelineEventProps[]>, p: string, _receiver: any): TimelineEventProps[] | undefined => {
      if (target.hasOwnProperty(p)
           || this.UCSBEventsByDate?.hasOwnProperty(p)
           || this.canvasEventsByDate?.hasOwnProperty(p)) {
        return new Proxy([
          ...target[p] ?? [],
          ...this.UCSBEventsByDate ? this.UCSBEventsByDate[p] ?? [] : [],
          ...this.canvasEventsByDate ? this.canvasEventsByDate[p] ?? [] : []
        ], {
          get: (target1: TimelineEventProps[], p1: string | symbol | number, _receiver1: any): any => {
            switch(p1) {
              case "push":
                return target[p].push.bind(target[p]);
              default:
                return target1[p1 as number];
            }
          }
        });
      } else {
        return undefined;
      }
    },
    set: (target: Record<string, TimelineEventProps[]>, p: string, newValue: TimelineEventProps[], _receiver: any): boolean => {
      target[p] = newValue;
      return true;
    },
    ownKeys: (target: Record<string, TimelineEventProps[]>): ArrayLike<string> => {
      return [...new Set([
        ...Object.keys(target),
        ...this.UCSBEventsByDate ? Object.keys(this.UCSBEventsByDate) : [],
        ...this.canvasEventsByDate ? Object.keys(this.canvasEventsByDate) : []
      ])];
    }
  });

  componentDidMount() {
    this.processUCSBEvents();
    this.processCanvasEvents();
    this.forceUpdate();
  }

  shouldComponentUpdate(nextProps: Readonly<ScheduleProps>, nextState: Readonly<ScheduleState>, nextContext: any): boolean {
    let updated = false;
    if (this.props.ucsbEvents !== nextProps.ucsbEvents) {
      updated ||= this.processUCSBEvents();
    }
    if (this.props.canvasEvents !== nextProps.canvasEvents) {
      updated ||= this.processCanvasEvents();
    }
    return updated;
  }

  processCanvasEvents(): boolean {
    const {canvasEvents} = this.props;
    if (!canvasEvents) return false;
    // this.setState({ canvasEventsByDate: {} });
    this.canvasEventsByDate = {};
    for (const course of canvasEvents) {
      for (const event of course.events) {
        console.log("Canvas event", event);
        let start = dayjs(event.start_at);
        let end = dayjs(event.end_at);
        const dateString = start.format("YYYY-MM-DD");
        if (!this.canvasEventsByDate[dateString]) {
          this.canvasEventsByDate[dateString] = [];
        }

    //test
        if (start.hour() === 23 && start.minute() === 59) {
          start = start.hour(0).minute(0);
          end = start.hour(1).minute(0);
        }
        this.canvasEventsByDate[dateString].push({
          start: start.format("YYYY-MM-DD HH:mm:ss"),
          end: end.format("YYYY-MM-DD HH:mm:ss"),
          title: event.title,
          summary: event.html_url,
          color: "#f3c09e"
        });
      }
    }
//     console.log("canvasEventsByDate", canvasEventsByDate);
    return true;
  }

  processUCSBEvents(): boolean {
    const { quarter, ucsbEvents } = this.props;
    if (!quarter || !ucsbEvents) return false;

    const UCSBSessionByDay: UCSBSession[][] = [[], [], [], [], [], [], []];

    for (const course of ucsbEvents.courses) {
      console.log("course hoho", course);
      for (const session of course.sessions) {
        console.log("session hoho", session);
        for (const day of session.days) {
          UCSBSessionByDay[letterToDay[day]].push(session);
        }
      }
    }

    console.log("UCSBSessionByDay", UCSBSessionByDay);

    let end = dayjs(quarter.lastDayOfClasses);
    end = end.date(end.date() + 1);

    this.UCSBEventsByDate = {};

    for (let date = dayjs(quarter.firstDayOfClasses); date.diff(end) < 0; date = date.date(date.date() + 1)) {
      const dateString = date.format("YYYY-MM-DD");
      this.UCSBEventsByDate[dateString] = UCSBSessionByDay[date.day()].map(session => ({
        start: dayjs(`${dateString} ${session.start}`, "YYYY-MM-DD h:mm A").format("YYYY-MM-DD HH:mm:ss"),
        end: dayjs(`${dateString} ${session.end}`, "YYYY-MM-DD h:mm A").format("YYYY-MM-DD HH:mm:ss"),
        title: session.name,
        summary: session.location,
        color: "#edf3fe"
      }));
    }

    for (const final of ucsbEvents.finals) {
      this.UCSBEventsByDate[final.start.format("YYYY-MM-DD")] = [{
        start: final.start.format("YYYY-MM-DD HH:mm:ss"),
        end: final.end.format("YYYY-MM-DD HH:mm:ss"),
        title: final.name,
        summary: "",
        color: "#2280bf"
      }];
    }

    console.log("UCSBEventsByDate", this.UCSBEventsByDate);

    return true;
  }

  marked = new Proxy({} as Record<string, Marked>, {
    has: (target: Record<string, Marked>, p: string): boolean => {
      return target.hasOwnProperty(p) || this.eventsByDate.hasOwnProperty(p);
    },
    get: (target: Record<string, Marked>, p: string, _receiver: any): Marked | undefined => {
      if (target.hasOwnProperty(p)) {
        return target[p];
      } else if (this.eventsByDate[p]?.length) {
        return {
          marked: true
        };
      } else {
        return undefined;
      }
    },
    set: (target: Record<string, Marked>, p: string, newValue: Marked, _receiver: any): boolean => {
      target[p] = newValue;
      return true;
    },
    ownKeys: (target: Record<string, Marked>): ArrayLike<string> => {
      return [...Object.keys(target), ...Object.keys(this.eventsByDate)];
    }
  });

  onDateChanged = (date: string, source: string) => {
    console.log('TimelineCalendarScreen onDateChanged: ', date, source);
    this.setState({currentDate: date});
  };

  onMonthChange = (month: any, updateSource: any) => {
    console.log('TimelineCalendarScreen onMonthChange: ', month, updateSource);
  };

  private timelineProps: Partial<TimelineProps> = {
    format24h: true,
    unavailableHours: [{start: 0, end: 6}, {start: 22, end: 24}],
    overlapEventsSpacing: 8,
    rightEdgeSpacing: 24,
  };

  render() {
    const { currentDate } = this.state;

    console.log("Derived eventsByDate:", this.eventsByDate);


    return (
        <CalendarProvider
            date={currentDate}
            onDateChanged={this.onDateChanged}
            onMonthChange={this.onMonthChange}
            showTodayButton
            disabledOpacity={0.6}
        >
          <ExpandableCalendar
              firstDay={0}
              leftArrowImageSource={require('../img/previous.png')}
              rightArrowImageSource={require('../img/next.png')}
              markedDates={this.marked}
          />
          <TimelineList
              events={this.eventsByDate}
              timelineProps={this.timelineProps}
              showNowIndicator
              scrollToNow
              initialTime={INITIAL_TIME}
          />
        </CalendarProvider>
    );
  }
}
