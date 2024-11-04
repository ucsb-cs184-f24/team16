import { View , Button, TouchableOpacity, StyleSheet} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Icon } from 'native-base';
import Schedule from '@/components/Schedule';

import { useCanvasAuth } from '@/app/canvas-auth';
import { useUCSBAuth } from "@/app/ucsb-auth";
import {
  CanvasEvent,
  CanvasAssignment,
  getCanvasAssignments,
  getCanvasEvents,
  getQuarter,
  getUCSBEvents,
  Quarter,
  UCSBEvents,
} from '@/helpers/api';
import { useEffect, useRef, useState } from "react";
import { Mutex } from "async-mutex";
import {router} from "expo-router"
import {quarter_screen} from "./quarter-screen"



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
  const [canvasHeaders, setCanvasHeaders] = useState<HeadersInit | null>(null);

  useCanvasAuth("/", async headers => {
//     setCanvasHeaders(headers);
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

//   useEffect(() => {
//     if (quarter && canvasHeaders) {
//       (async () => {
//         try {
//           const assignments = await getCanvasAssignments(canvasHeaders, quarter);
//           console.log("Canvas Assignments:", assignments);
//           setCanvasEvents(assignments);
//         } catch (e) {
//           console.error('Error fetching Canvas assignments:', e);
//         }
//       })();
//     } else {
//       if (!quarter) {
//         console.error("Quarter data not available yet.");
//       }
//     }
//   }, [quarter, canvasHeaders]);

  const [ucsbEvents, setUCSBEvents] = useState<UCSBEvents | null>(null);
  useUCSBAuth("/", async headers => {
    try {
      const events = await getUCSBEvents(headers);
      console.log("UCSB API Result:", events);
      setUCSBEvents(events);
    } catch (e) {
      console.error(e);
      return false;
    }
  });

//   getQuarter().then(result => {
//     console.log("API Result:", result)
//     Alert.alert("API Result:", JSON.stringify(result, null, 2));
//   }, error => {
//     Alert.alert("Error", error.message);
//     console.log("Error", error.message);
//   });
//   try {
//         const result = await getQuarter();
//             console.log("API Result:", result)
//             Alert.alert("API Result:", JSON.stringify(result, null, 2));
//         } catch (error) {
//             Alert.alert("Error", error.message);
//             console.log("Error", error.message);
//   }

  return (
    <View
      style={styles.container} >

        <Button

          title="Check My Quarter"
          onPress={() => router.push(
            `/quarter-screen?name=${encodeURIComponent(JSON.stringify(canvasEvents.short_name))}`
          )}
        />
      
        <Schedule
                    quarter={quarter}
                    canvasEvents={canvasEvents}
                    ucsbEvents={UCSBEvents}
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
