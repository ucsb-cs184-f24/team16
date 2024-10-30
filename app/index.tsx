import {Alert, View} from 'react-native';
import Schedule from '@/components/Schedule';
import {useCanvasAuth} from '@/app/canvas-auth';
import {useUCSBAuth} from "@/app/ucsb-auth";
import {getCanvasEvents, getQuarter, getUCSBEvents, Quarter, UCSBEvents} from '@/helpers/api';
import {useState} from "react";

export default function Index() {
  const [quarter, setQuarter] = useState<Quarter | null>(null);
  getQuarter().then(result => {
    console.log("API Result:", result);
    setQuarter(result);
  }, error => Alert.alert("Error", error.message));

  // TODO: Define type for canvasResponse
  const [canvasEvents, setCanvasEvents] = useState<object | null>(null);
  useCanvasAuth("/", async headers => {
    try {
      setCanvasEvents(await getCanvasEvents(headers))
    } catch (e) {
      console.error(e);
      return false;
    }
  });

  const [UCSBEvents, setUCSBEvents] = useState<UCSBEvents | null>(null);
  useUCSBAuth("/", async headers => {
    try {
      setUCSBEvents(await getUCSBEvents(headers));
    } catch (e) {
      console.error(e);
      return false;
    }
  });

  return (
      <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
      >
        <Schedule
            quarter={quarter}
            canvasEvents={canvasEvents}
            ucsbEvents={UCSBEvents}
        />
      </View>
  );
}
