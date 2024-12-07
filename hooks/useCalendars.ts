import {useFirebaseFunction2} from "@/hooks/useFirebaseFunction";
import {getCalendars} from "@/helpers/firebase";
import {Alert} from "react-native";
import type {CalendarsData, Credentials} from "@/types/firebase";

export default function useCalendars(
    getCredentials: () => Credentials | null,
    setCredentials: (credential: null) => void
): Partial<CalendarsData> | null {
  return useFirebaseFunction2({
    key: "calendars",
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
    params: getCredentials(),
    condition: calendars => !!getCredentials() && (
        !calendars?.gradescopeCourses || !calendars?.canvasEvents || !calendars?.ucsbEvents
    ),
    onFetch: (keys) => {
      if ("ucsbEvents" in keys) {
        Alert.alert("Courses need to update", "You may need to answer a Duo prompt.");
      }
    },
    onFail: () => setCredentials(null),
  });
}
