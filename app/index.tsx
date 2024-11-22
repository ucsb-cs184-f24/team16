import {Button, StyleSheet, View, Text, Alert} from 'react-native';
import Schedule from '@/components/Schedule';
import {router} from "expo-router";
import {getCalendars, getQuarters} from "@/helpers/firebase";
import {useFirebaseFunction, useFirebaseFunction2} from "@/hooks/useFirebaseFunction";
import SignIn from "@/components/SignIn";
import useCredentials from "@/hooks/useCredentials";
import {useEffect, useState} from "react";
import type {TimelineEventProps} from "react-native-calendars";
import {processCalendars} from "@/helpers/calendars";
import type {MarkedDates} from "react-native-calendars/src/types";

export default function Index() {
  const [credentials, setCredentials] = useCredentials();
  const calendars = useFirebaseFunction2({
    caches: {
      ucsbEvents: {
        key: "calendars.ucsbEvents",
        duration: {days: 14},
      },
      canvasEvents: {
        key: "calendars.canvasEvents",
        duration: {hours: 1},
      },
      gradescopeCourses: {
        key: "calendars.gradescopeCourses",
        duration: {hours: 1},
      }
    },
    callable: getCalendars,
    params: credentials,
    condition: calendars => !!credentials && (
        !calendars?.gradescopeCourses || !calendars?.canvasEvents || !calendars?.ucsbEvents
    ),
    onFetch: (keys) => {
      if ("ucsbEvents" in keys) {
        Alert.alert("Courses need to update", "You may need to answer a Duo prompt.");
      }
    },
    onFail: () => setCredentials(null),
  });
  const quarters = useFirebaseFunction({
    cache: {
      key: "quarters",
      duration: {days: 1}
    },
    callable: getQuarters,
    params: null,
  });

  const [eventsByDate, setEventsByDate] = useState<Record<string, TimelineEventProps[]>>({});
  const [marked, setMarked] = useState<MarkedDates>({});
  useEffect(() => {
    if (calendars && quarters) {
      const [eventsByDate, marked] = processCalendars(calendars, quarters);
      setEventsByDate(eventsByDate);
      setMarked(marked);
    }
  }, [calendars, calendars?.gradescopeCourses, calendars?.canvasEvents, calendars?.ucsbEvents, quarters]);

  return credentials ? (
      <View
          style={styles.container}>

        <Button
            title="Check My Quarter"
            onPress={() => router.navigate('/quarter-screen')}
        />
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
      <SignIn callback={setCredentials} />
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
