import type {HttpsCallable} from "@firebase/functions";
import {type RequestData, type ResponseData, Status} from "@/types";
import {useEffect, useRef, useState} from "react";
import {Mutex} from "async-mutex";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

type Duration =
    | duration.Duration
    | duration.DurationUnitsObjectType
    | number
    | string
    | [number, duration.DurationUnitType];

function addDuration(date: dayjs.Dayjs, duration: Duration): dayjs.Dayjs {
  if (dayjs.isDuration(duration)) {
    return date.add(duration);
  } else if (duration instanceof Array) {
    return date.add(duration[0], duration[1]);
  } else if (typeof duration === "string") {
    return date.add(dayjs.duration(duration));
  } else if (typeof duration === "number") {
    return date.add(duration);
  } else {
    return date.add(dayjs.duration(duration));
  }
}

interface CacheParams {
  key: string;
  duration?: Duration;
}

async function firebaseFunctionHelper<Params = unknown, Data = unknown>(
    callable: HttpsCallable<RequestData<Params, Data>, ResponseData<Partial<Data>>>,
    requestData: RequestData<Params, Data>,
    onSuccess: (data: Partial<Data>) => void,
    onFail: () => void,
    release: () => void,
) {
  callable(requestData).then(async result => {
    switch (result.data.status) {
      case Status.OK:
        console.log("firebase", callable, "data", result.data.data);
        onSuccess(result.data.data);
        break;
      case Status.NOT_SIGNED_IN:
        console.error("firebase", callable, "not signed in");
        onFail();
        break;
      case Status.INTERNAL_SERVER_ERROR:
        console.error("firebase", callable, "error", result.data.error);
        onFail();
        break;
    }
    release();
  }, error => {
    console.error("firebase useFunction", callable, "error", JSON.stringify(error, null, 2));
    console.error(error?.stack);
    onFail();
    release();
  });
}

async function isCacheValid(cache: CacheParams): Promise<boolean> {
  if (cache.duration) {
    const ctimeStr = await AsyncStorage.getItem(`${cache}/ctime`);
    return !!ctimeStr && addDuration(dayjs(ctimeStr), cache.duration).diff(dayjs()) >= 0;
  } else {
    return true;
  }
}

export default function useFirebaseFunction<Params = unknown, Data = unknown>(
    {
      cache,
      caches,
      tries = 5,
      callable,
      params,
      condition = caches
          ? data => !data || !Array.every(Object.keys(caches), key => Object.hasOwn(data, key))
          : data => !data,
      onFail = () => {
      }
    }: {
      cache?: CacheParams;
      caches?: Record<keyof Data, CacheParams>;
      tries?: number;
      callable: HttpsCallable<RequestData<Params, Data>, ResponseData<Partial<Data>>>;
      params: Params | Promise<Params> | (() => Params | Promise<Params>),
      condition?: (data: Data | null) => boolean | Promise<boolean>,
      onFail?: () => void
    }): Data | null {
  const [data, setData] = useState<Data | null>(null);
  const mutexRef = useRef<Mutex | null>(null);
  const triesRef = useRef<number>(0);
  useEffect(() => {
    if (!mutexRef.current) {
      mutexRef.current = new Mutex();
    }
    mutexRef.current.acquire().then(async release => {
      if (triesRef.current < tries && await condition(data)) {
        if (cache) {
          if (await isCacheValid(cache)) {
            const cachedStr = await AsyncStorage.getItem(cache.key);
            const cached: Data | null = JSON.parse(cachedStr ?? "null");
            if (cached) {
              console.log("firebase function", callable, "loading cached", cached);
              setData(cached);
              release();
              return;
            }
          }
          const requestData: RequestData<Params, Data> = {
            params: await (params instanceof Function ? params() : params)
          };
          await firebaseFunctionHelper(callable, requestData, async data => {
            setData(data as Data);
            await AsyncStorage.multiSet([
              [cache.key, JSON.stringify(data)],
              [`${cache}/ctime`, dayjs().toISOString()]
            ]);
          }, () => {
            onFail();
            triesRef.current++;
          }, release);
        } else if (caches) {
          let data: Partial<Data> = {};
          const keys = (await Promise.all(Object.entries<CacheParams>(caches).map(async ([key, cache]) => {
            if (await isCacheValid(cache)) {
              const cachedStr = await AsyncStorage.getItem(cache.key);
              const cached: any | null = JSON.parse(cachedStr ?? "null");
              if (cached) {
                console.log("firebase function", callable, "loading cached", cached);
                Object.assign(data, {[key]: cached});
                return false;
              }
            }
            return key;
          }, []))).filter(key => typeof key === "string") as (keyof Data)[];
          if (keys.length > 0) {
            const requestData: RequestData<Params, Data> = {
              params: await (params instanceof Function ? params() : params),
              keys: keys
            };
            await firebaseFunctionHelper(callable, requestData, async newData => {
              setData(Object.assign(data, newData) as Data);
              const now = dayjs().toISOString();
              await AsyncStorage.multiSet(keys.flatMap(key => [
                [caches[key].key, JSON.stringify(data[key])],
                [`${caches[key].key}/ctime`, now]
              ]));
            }, () => {
              onFail();
              triesRef.current++;
            }, release);
          } else {
            setData(data as Data);
            release();
          }
        } else {
          const requestData: RequestData<Params, Data> = {
            params: await (params instanceof Function ? params() : params)
          };
          await firebaseFunctionHelper(callable, requestData, data => {
            setData(data as Data);
          }, () => {
            onFail();
            triesRef.current++;
          }, release);
        }
      } else {
        release();
      }
    });
  }, [cache, caches, callable, condition, data, onFail, params, tries]);
  return data;
}
