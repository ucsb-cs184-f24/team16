import {StyleSheet, Text, View} from 'react-native';
import Schedule from '@/components/Schedule';
import SignIn from "@/components/SignIn";
import {useEffect, useState} from "react";
import type {TimelineEventProps} from "react-native-calendars";
import {processCalendars} from "@/helpers/calendars";
import type {MarkedDates} from "react-native-calendars/src/types";
import type {Credentials} from "@/types/firebase";
import useValue from "@/hooks/useValue";
import useCalendars from "@/hooks/useCalendars";
import useQuarters from "@/hooks/useQuarters";

export default function Index() {
  const [getCredentials, setCredentials] = useValue<Credentials>("credentials");
  const coursesFilter = useValue<boolean>("courses filter")[0](true);
  const canvasFilter = useValue<boolean>("canvas filter")[0](true);
  const gradescopeFilter = useValue<boolean>("gradescope filter")[0](true);
  const customFilter = useValue<boolean>("custom filter")[0](true);
  const calendars = useCalendars(getCredentials, setCredentials);
  const customEvents = useValue<TimelineEventProps[]>("custom events")[0]([]);
  const quarters = useQuarters();
  const [eventsByDate, setEventsByDate] = useState<Record<string, TimelineEventProps[]>>({});
  const [marked, setMarked] = useState<MarkedDates>({});
  console.error(calendars?.ucsbEvents?.finals);
  useEffect(() => {
    if (calendars && quarters) {
      const [eventsByDate, marked] = processCalendars(calendars, quarters, customEvents, {
        courses: coursesFilter,
        canvas: canvasFilter,
        gradescope: gradescopeFilter,
        custom: customFilter,
      });
      setEventsByDate(eventsByDate);
      setMarked(marked);
    }
  }, /* eslint-disable react-hooks/exhaustive-deps */ [
    canvasFilter && calendars?.canvasEvents,
    coursesFilter && calendars?.ucsbEvents,
    gradescopeFilter && calendars?.gradescopeCourses,
    customFilter && customEvents,
    quarters,
  ] /* eslint-enable react-hooks/exhaustive-deps */);

  return getCredentials() ? (
      <View
          style={styles.container}>

        {calendars ? (
            <Schedule
                eventsByDate={eventsByDate}
                marked={marked}
            />
        ) : (
            <>
              <Text>Loading...</Text>
            </>
        )}

      </View>
  ) : (
      <SignIn/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});
