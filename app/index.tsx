import {View, Button, TouchableOpacity, StyleSheet} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Icon } from 'native-base';
import Schedule from '@/components/Schedule';
import {useCanvasAuth} from '@/app/canvas-auth';
import {useUCSBAuth} from "@/app/ucsb-auth";
import {getCanvasEvents, getQuarter, getUCSBEvents, Quarter, UCSBEvents} from '@/helpers/api';
import {useRef, useState} from "react";
import {Mutex} from "async-mutex";
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
        const quarter = await getQuarter();
        console.log("Quarter API Result:", quarter);
        if (quarter) {
          setQuarter(quarter);
          quarterSuccessRef.current = true;
        }
      } catch (e) {
        console.error(e);
      }
    }
    release();
  });

  // TODO: Define type for canvasEvents
  const [canvasEvents, setCanvasEvents] = useState<object | null>(null);
  useCanvasAuth("/", async headers => {
    try {
      const canvasEvents = await getCanvasEvents(headers);
      console.log("Canvas API Result:", canvasEvents);
      setCanvasEvents(canvasEvents);
    } catch (e) {
      console.error(e);
      return false;
    }
  });

  const [UCSBEvents, setUCSBEvents] = useState<UCSBEvents | null>(null);
  useUCSBAuth("/", async headers => {
    try {
      const UCSBEvents = await getUCSBEvents(headers);
      console.log("UCSB API Result:", UCSBEvents);
      setUCSBEvents(UCSBEvents);
    } catch (e) {
      console.error(e);
      return false;
    }
  });

  getQuarter().then(result => {
    console.log("API Result:", result)
    Alert.alert("API Result:", JSON.stringify(result, null, 2));
  }, error => {
    Alert.alert("Error", error.message);
    console.log("Error", error.message);
  });
//   try {
//         const result = await getQuarter();
//             console.log("API Result:", result)
//             Alert.alert("API Result:", JSON.stringify(result, null, 2));
//         } catch (error) {
//             Alert.alert("Error", error.message);
//             console.log("Error", error.message);
//   }

  return (
      <View style={styles.container} >

        <Button
                        title="Check My Quarter"
                        onPress={() => router.navigate('quarter-screen')}
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
