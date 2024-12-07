import {StyleSheet, Text, View} from 'react-native';
import Schedule from '@/components/Schedule';
import SignIn from "@/components/SignIn";
import {useEffect, useState} from "react";
import type {TimelineEventProps} from "react-native-calendars";
import {processCalendars} from "@/helpers/calendars";
import type {MarkedDates} from "react-native-calendars/src/types";
import {Credentials} from "@/types/firebase";
import useValue from "@/hooks/useValue";
import useCalendars from "@/hooks/useCalendars";
import useQuarters from "@/hooks/useQuarters";

export default function Index() {
  const [getCredentials, setCredentials] = useValue<Credentials>("credentials");
  const calendars = useCalendars(getCredentials, setCredentials);
  const quarters = useQuarters();
  const [eventsByDate, setEventsByDate] = useState<Record<string, TimelineEventProps[]>>({});
  const [marked, setMarked] = useState<MarkedDates>({});
  useEffect(() => {
    if (calendars && quarters) {
      const [eventsByDate, marked] = processCalendars(calendars, quarters);
      setEventsByDate(eventsByDate);
      setMarked(marked);
    }
  }, [calendars, calendars?.gradescopeCourses, calendars?.canvasEvents, calendars?.ucsbEvents, quarters]);

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
