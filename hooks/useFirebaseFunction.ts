import type {HttpsCallable} from "@firebase/functions";
import {type FunctionResponse, Status} from "@/firebase/functions/src/types";
import {useRef, useState} from "react";
import {Mutex} from "async-mutex";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

export default function useFirebaseFunction<RequestData = unknown, Data = unknown>(
    {
      cache,
      duration,
      callable,
      requestData,
      condition = (data) => !data,
      onFail = () => {}
    }: {
  cache?: string;
  duration?: duration.Duration | duration.DurationUnitsObjectType | number | string | [number, duration.DurationUnitType];
  callable: HttpsCallable<RequestData, FunctionResponse<Data>>;
  requestData: RequestData | Promise<RequestData> | (() => RequestData | Promise<RequestData>);
  condition?: (data: Data | null) => boolean | Promise<boolean>,
  onFail?: () => any
}): Data | null {
  const [data, setData] = useState<Data | null>(null);
  const blockedRef = useRef<boolean>(false);
  const mutexRef = useRef<Mutex | null>(null);
  if (!mutexRef.current) {
    mutexRef.current = new Mutex();
  }
  mutexRef.current.acquire().then(async release => {
    if (await condition(data)) {
      if (cache) {
        let valid = false;
        if (duration) {
          const ctimeStr = await AsyncStorage.getItem(`${cache}/ctime`);
          if (ctimeStr) {
            const ctime = dayjs(ctimeStr);
            let etime: dayjs.Dayjs;
            if (dayjs.isDuration(duration)) {
              etime = ctime.add(duration);
            } else if (duration instanceof Array) {
              etime = ctime.add(duration[0], duration[1]);
            } else if (typeof duration === "string") {
              etime = ctime.add(dayjs.duration(duration));
            } else if (typeof duration === "number") {
              etime = ctime.add(duration);
            } else {
              etime = ctime.add(dayjs.duration(duration));
            }
            valid = etime.diff(dayjs()) >= 0;
          }
        } else {
          valid = true;
        }
        if (valid) {
          const cachedStr = await AsyncStorage.getItem(cache);
          const cached: Data | null = JSON.parse(cachedStr ?? "null");
          if (cached) {
            console.log("firebase function loading cached", cached);
            setData(cached);
            release();
            return;
          }
        }
      }
      callable(await (requestData instanceof Function ? requestData() : requestData)).then(async result => {
        switch (result.data.status) {
          case Status.OK:
            console.log("firebase function data", result.data.data);
            setData(result.data.data);
            if (cache) {
              await AsyncStorage.multiSet(Object.entries({
                [cache]: JSON.stringify(result.data.data),
                [`${cache}/ctime`]: dayjs().toISOString(),
              }));
            }
            break;
          case Status.NOT_SIGNED_IN:
            onFail();
            break;
          case Status.INTERNAL_SERVER_ERROR:
            blockedRef.current = true;
            console.error("firebase function error", result.data.error);
            onFail();
            break;
        }
        release();
      }, error => {
        console.error("useFunction error", JSON.stringify(error, null, 2));
        console.error(error?.stack);
        release();
      });
    } else {
      release();
    }
  });
  return data;
}
