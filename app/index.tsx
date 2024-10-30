import {View} from 'react-native';
import Schedule from '@/components/Schedule';
import {useCanvasAuth} from '@/app/canvas-auth';
import {useUCSBAuth} from "@/app/ucsb-auth";
import {getCanvasEvents, getQuarter, getUCSBEvents, Quarter, UCSBEvents} from '@/helpers/api';
import {useRef, useState} from "react";
import {Mutex} from "async-mutex";

export default function Index() {
  const [quarter, setQuarter] = useState<Quarter | null>(null);
  const quarterSuccesRef = useRef<boolean>(false);
  const quarterMutexRef = useRef<Mutex | null>(null);
  if (!quarterMutexRef.current) {
    quarterMutexRef.current = new Mutex();
  }
  quarterMutexRef.current.acquire().then(async release => {
    if (!quarterSuccesRef.current) {
      try {
        const quarter = await getQuarter();
        console.log("Quarter API Result:", quarter);
        if (quarter) {
          setQuarter(quarter);
          quarterSuccesRef.current = true;
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
