import {isCacheValid, useFirebaseFunction2} from "@/hooks/useFirebaseFunction";
import {getCalendars} from "@/helpers/firebase";
import type {CalendarsData, Credentials} from "@/types/firebase";
import {useState} from "react";

export default function useCalendars(
    getCredentials: () => Credentials | null,
    setCredentials: (credential: null) => void
): [Partial<CalendarsData> | null, any] {
  const [err, setErr] = useState<any>(null);
  const ucsbEventsCache = {
    key: "calendars.ucsbEvents",
    duration: {days: 14},
    nonce: getCredentials()?.username,
  };
  const canvasEventsCache = {
    key: "calendars.canvasEvents",
    duration: {hours: 1},
    nonce: getCredentials()?.username,
  };
  const gradescopeCoursesCache = {
    key: "calendars.gradescopeCourses",
    duration: {hours: 1},
    nonce: getCredentials()?.username,
  };
  return [
    useFirebaseFunction2({
    key: "calendars",
    caches: {
      ucsbEvents: ucsbEventsCache,
      canvasEvents: canvasEventsCache,
      gradescopeCourses: gradescopeCoursesCache,
    },
    callable: getCalendars,
    params: getCredentials(),
      async condition(calendars) {
        return !!getCredentials() && (
            !(calendars?.gradescopeCourses && await isCacheValid(gradescopeCoursesCache)) ||
            !(calendars?.canvasEvents && await isCacheValid(canvasEventsCache)) ||
            !(calendars?.ucsbEvents && await isCacheValid(ucsbEventsCache))
        )
      },
      onFetch(keys) {
        // if ("ucsbEvents" in keys) {
        //   Alert.alert("Courses need to update", "You may need to answer a Duo prompt.");
        // }
    },
      onFail(err) {
        setErr(err);
        setCredentials(null);
      },
    }),
    err
  ];
}
