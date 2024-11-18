import {Button, StyleSheet, View} from 'react-native';
import Schedule from '@/components/Schedule';
import {router} from "expo-router";
import {getCalendars, getQuarters} from "@/helpers/firebase";
import useFirebaseFunction from "@/hooks/useFirebaseFunction";
import SignIn from "@/components/SignIn";
import useCredentials from "@/hooks/useCredentials";
import {useEffect, useState} from "react";
import type {TimelineEventProps} from "react-native-calendars";
import {processCalendars} from "@/helpers/calendars";

export default function Index() {
  const [credentials, setCredentials] = useCredentials();
  const calendars = useFirebaseFunction({
    cache: "calendars",
    duration: {days: 1},
    callable: getCalendars,
    requestData: credentials,
    condition: calendars => !!credentials && !calendars,
    onFail: () => setCredentials(null),
  });
  const quarters = useFirebaseFunction({
    cache: "quarters",
    duration: {days: 1},
    callable: getQuarters,
    requestData: null,
  });

  const [eventsByDate, setEventsByDate] = useState<Record<string, TimelineEventProps[]>>({});
  useEffect(() => {
    if (calendars && quarters) {
      const eventsByDate = processCalendars(calendars, quarters);
      setEventsByDate(eventsByDate);
    }
  }, [calendars, quarters]);

  return credentials ? (
      <View
          style={styles.container}>

        <Button
            title="Check My Quarter"
            onPress={() => router.navigate('/quarter-screen')}
        />
        <Schedule
            eventsByDate={eventsByDate}
        />

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
