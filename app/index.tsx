import {Button, StyleSheet, View} from 'react-native';
import Schedule from '@/components/Schedule';
import {useCanvasAuth} from '@/app/canvas-auth';
import {useUCSBAuth} from "@/app/ucsb-auth";
import {
  CanvasEvent,
  getCanvasAssignments,
  getQuarter,
  getUCSBEvents,
  Quarter,
  UCSBEvents,
} from '@/helpers/api';
import {useRef, useState} from "react";
import {Mutex} from "async-mutex";
import {router} from "expo-router"

export default function Index() {
  const [quarter, setQuarter] = useState<Quarter | null>(null);
  const quarterSuccessRef = useRef<boolean>(false);
  const quarterMutexRef = useRef<Mutex | null>(null);
  if (!quarterMutexRef.current) {
    quarterMutexRef.current = new Mutex();
  }
  quarterMutexRef.current.acquire().then(async release => {
    if (!quarterSuccessRef.current) {
      try {
        const quarterData = await getQuarter();
        console.log("Quarter API Result:", quarterData);
        if (quarterData) {
          setQuarter(quarterData);
          quarterSuccessRef.current = true;
        }
      } catch (e) {
        console.error(e);
      }
    }
    release();
  });

  const [canvasEvents, setCanvasEvents] = useState<CanvasEvent[] | null>(null);

  useCanvasAuth("/", async headers => {
    if (quarter) {
      try {
        const assignments = await getCanvasAssignments(headers, quarter);
        console.log("Canvas Assignments:", assignments);
        setCanvasEvents(assignments);
      } catch (e) {
        console.error(e);
        return false;
      }
    } else {
      return false;
    }
  });

  const [ucsbEvents, setUCSBEvents] = useState<UCSBEvents | null>(null);
  useUCSBAuth("/", async headers => {
    try {
      const events = await getUCSBEvents(headers);
      console.log("UCSB API Result:", JSON.stringify(events, null, 2));
      setUCSBEvents(events);
    } catch (e) {
      console.error(e);
      return false;
    }
  });

  return (
      <View
          style={styles.container}>

        <Button
            title="Check My Quarter"
            onPress={() => router.navigate('/quarter-screen')}
        />
        <Schedule
            quarter={quarter}
            canvasEvents={canvasEvents}
            ucsbEvents={ucsbEvents}
        />

      </View>
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
