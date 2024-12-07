import {useCallback, useRef, useState} from "react";
import {
  CalendarProvider,
  ExpandableCalendar,
  type TimelineEventProps,
  TimelineList,
  type TimelineProps,
} from "react-native-calendars";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {router} from "expo-router";
import {MarkedDates} from "react-native-calendars/src/types";


dayjs.extend(customParseFormat);

interface ScheduleProps {
  eventsByDate: Record<string, TimelineEventProps[]>;
  marked: MarkedDates;
}

export default function Schedule({eventsByDate, marked}: ScheduleProps) {
  const [currentDate, setCurrentDate] = useState<string>(dayjs().format("YYYY-MM-DD"));

  const onDateChanged = useCallback((date: string, source: string) => {
    console.log('TimelineCalendarScreen onDateChanged: ', date, source);
    setCurrentDate(date);
  }, []);

  const onMonthChange = useCallback((month: any, updateSource: any) => {
    console.log('TimelineCalendarScreen onMonthChange: ', month, updateSource);
  }, []);

  const timelinePropsRef = useRef<Partial<TimelineProps>>({
    format24h: true,
    unavailableHours: [{start: 0, end: 8}, {start: 20, end: 24}],
    overlapEventsSpacing: 8,
    rightEdgeSpacing: 24,
    start: -1,
    end: 25,
    onEventPress(event: TimelineEventProps): void {
      if (event) {
        console.log("Pressed the event ")
        router.navigate({
          pathname: "/event-info", params: {
            id: event.id ?? "",
            title: event.title,
            start: event.start,
            end: event.end,
            summary: event.summary ?? ""
          }
        });
      }
    }
  });

  return (
      <CalendarProvider
          date={currentDate}
          onDateChanged={onDateChanged}
          onMonthChange={onMonthChange}
          showTodayButton
          disabledOpacity={0.6}
      >
        <ExpandableCalendar
            firstDay={0}
            leftArrowImageSource={require('../img/previous.png')}
            rightArrowImageSource={require('../img/next.png')}
            markedDates={marked}
        />
        <TimelineList
            events={eventsByDate}
            timelineProps={timelinePropsRef.current}
            showNowIndicator
            scrollToNow
        />
      </CalendarProvider>
  );
}
