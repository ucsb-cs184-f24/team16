import React, {PureComponent} from 'react';
import {
  ExpandableCalendar,
  TimelineEventProps,
  TimelineList,
  CalendarProvider,
  TimelineProps,
} from 'react-native-calendars';
import {Quarter, UCSBEvents, UCSBSession} from "@/helpers/api";
import dayjs from 'dayjs';

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
  canvasEvents: object | null; // TODO: Define a type
  ucsbEvents: UCSBEvents | null;
}

interface ScheduleState {
  currentDate: string;
  UCSBEventsByDate: Record<string, TimelineEventProps[]>;
  CanvasEventsByDate: Record<string, TimelineEventProps[]>
}

interface Marked {
  marked: boolean;
}

export default class Schedule extends PureComponent<ScheduleProps, ScheduleState> {
  state: ScheduleState = {
    currentDate: dayjs().format("YYYY-MM-DD"),
    UCSBEventsByDate: {},
    CanvasEventsByDate: {}
  };

  eventsByDate = new Proxy({} as Record<string, TimelineEventProps[]>, {
    has: (target: Record<string, TimelineEventProps[]>, p: string): boolean => {
      return target.hasOwnProperty(p) || this.state.UCSBEventsByDate.hasOwnProperty(p);
    },
    get: (target: Record<string, TimelineEventProps[]>, p: string, _receiver: any): TimelineEventProps[] | undefined => {
      if (target.hasOwnProperty(p) || this.state.UCSBEventsByDate.hasOwnProperty(p)) {
        return new Proxy([
          ...target[p] ?? [],
          ...this.state.UCSBEventsByDate[p] ?? []
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
      return [...Object.keys(target), ...Object.keys(this.state.UCSBEventsByDate)];
    }
  });

  componentDidMount() {
    this.processUCSBEvents();
  }

  componentDidUpdate(prevProps: ScheduleProps) {
    if (prevProps.ucsbEvents !== this.props.ucsbEvents) {
      this.processUCSBEvents();
    }
  }

  processUCSBEvents() {
    const { quarter, ucsbEvents } = this.props;
    if (!quarter || !ucsbEvents) return;

    this.setState({ UCSBEventsByDate: {} });

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

    const UCSBEventsByDate: Record<string, TimelineEventProps[]> = {};

    for (let date = dayjs(quarter.firstDayOfClasses); date.diff(end) < 0; date = date.date(date.date() + 1)) {
      const dateString = date.format("YYYY-MM-DD");
      UCSBEventsByDate[dateString] = UCSBSessionByDay[date.day()].map(session => ({
        start: dayjs(`${dateString} ${session.start}`, "YYYY-MM-DD h:mm A").format("YYYY-MM-DD HH:mm:ss"),
        end: dayjs(`${dateString} ${session.end}`, "YYYY-MM-DD h:mm A").format("YYYY-MM-DD HH:mm:ss"),
        title: session.name,
        summary: session.location,
        color: "#edf3fe"
      }));
    }

    for (const final of ucsbEvents.finals) {
      UCSBEventsByDate[final.start.format("YYYY-MM-DD")] = [{
        start: final.start.format("YYYY-MM-DD HH:mm:ss"),
        end: final.end.format("YYYY-MM-DD HH:mm:ss"),
        title: final.name,
        summary: "",
        color: "#2280bf"
      }];
    }

    console.log("UCSBEventsByDate", UCSBEventsByDate);

    this.setState({UCSBEventsByDate});
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
