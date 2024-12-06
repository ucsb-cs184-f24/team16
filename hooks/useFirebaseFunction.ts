import type {HttpsCallable} from "@firebase/functions";
import {type RequestData, type ResponseData, Status} from "@/types";
import {useCallback, useEffect, useRef} from "react";
import {Mutex} from "async-mutex";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import useValue from "@/hooks/useValue";

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

async function firebaseFunctionHelper<Params = unknown, Data = unknown, T extends Partial<Data> = Data>(
    callable: HttpsCallable<RequestData<Params, Data>, ResponseData<T>>,
    requestData: RequestData<Params, Data>,
    onSuccess: (data: T) => void,
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
    return !!ctimeStr && addDuration(dayjs.unix(parseInt(ctimeStr)), cache.duration).diff(dayjs()) >= 0;
  } else {
    return true;
  }
}

export function useFirebaseFunction<Params = unknown, Data = unknown>(
    {
      key,
      cache,
      tries = 5,
      callable,
      params,
      condition = (data: Data | null) => !data,
      onFetch = () => {},
      onFail = () => {}
    }: {
      key: string;
      cache?: CacheParams;
      tries?: number;
      callable: HttpsCallable<RequestData<Params, Data>, ResponseData<Data>>;
      params: Params | Promise<Params> | (() => Params | Promise<Params>),
      condition?: (data: Data | null) => boolean | Promise<boolean>,
      onFetch?: () => void,
      onFail?: () => void
    }): Data | null {
  const [getData, setData] = useValue<Data>(key, false);
  const data = getData();
  const mutexRef = useRef<Mutex | null>(null);
  const triesRef = useRef<number>(0);
  const callback = useCallback(() => {
    if (!mutexRef.current) {
      mutexRef.current = new Mutex();
    }
    mutexRef.current.acquire().then(async release => {
      if (triesRef.current < tries && await condition(getData())) {
        if (cache) {
          const cachedStr = await AsyncStorage.getItem(cache.key);
          const cached: Data | null = JSON.parse(cachedStr ?? "null");
          if (cached) {
            console.log("firebase function", callable, "loading cached", cached);
            setData(cached);
            if (await isCacheValid(cache)) {
              console.log("firebase function", callable, "cache is valid");
              release();
              return;
            } else {
              console.log("firebase function", callable, "cache is invalid");
            }
          }
          const requestData: RequestData<Params, Data> = {
            params: await (params instanceof Function ? params() : params)
          };
          onFetch();
          await firebaseFunctionHelper(callable, requestData, async data => {
            setData(data);
            await AsyncStorage.multiSet([
              [cache.key, JSON.stringify(data)],
              [`${cache}/ctime`, dayjs().unix().toString()]
            ]);
          }, () => {
            onFail();
            triesRef.current++;
          }, release);
        } else {
          const requestData: RequestData<Params, Data> = {
            params: await (params instanceof Function ? params() : params)
          };
          onFetch();
          await firebaseFunctionHelper(callable, requestData, data => {
            setData(data);
          }, () => {
            onFail();
            triesRef.current++;
          }, release);
        }
      } else {
        release();
      }
    });
  }, [cache, callable, condition, getData, onFail, onFetch, params, setData, tries]);
  useEffect(() => {
    callback();
  }, [callback, data]);
  return data;
}

export function useFirebaseFunction2<Params = unknown, Data = unknown>(
    {
      key,
      caches,
      tries = 5,
      callable,
      params,
      condition = (data: Partial<Data> | null) => !data || !Array.every(Object.keys(caches), key => Object.hasOwn(data, key)),
      onFetch = () => {},
      onFail = () => {}
    }: {
      key: string;
      caches: Record<keyof Data, CacheParams>;
      tries?: number;
      callable: HttpsCallable<RequestData<Params, Data>, ResponseData<Partial<Data>>>;
      params: Params | Promise<Params> | (() => Params | Promise<Params>),
      condition?: (data: Partial<Data> | null) => boolean | Promise<boolean>,
      onFetch?: (keys: (keyof Data)[]) => void
      onFail?: () => void
    }): Partial<Data> | null {
  const [getData, setData] = useValue<Partial<Data>>(key, false);
  const data = getData();
  const mutexRef = useRef<Mutex | null>(null);
  const triesRef = useRef<number>(0);
  const callback = useCallback(() => {
    if (!mutexRef.current) {
      mutexRef.current = new Mutex();
    }
    mutexRef.current.acquire().then(async release => {
      if (triesRef.current < tries && await condition(getData())) {
        let data: Partial<Data> = {};
        const keys = (await Promise.all(Object.entries<CacheParams>(caches).map(async ([key, cache]) => {
          const cachedStr = await AsyncStorage.getItem(cache.key);
          const cached: any | null = JSON.parse(cachedStr ?? "null");
          if (cached) {
            console.log("firebase function", callable, "loading cached", cached, "for", key);
            Object.assign(data, {[key]: cached});
            if (await isCacheValid(cache)) {
              console.log("firebase function", callable, "cache is valid", cached, "for", key);
              return false;
            } else {
              console.log("firebase function", callable, "cache is invalid");
            }
          }
          return key;
        }, []))).filter(key => typeof key === "string") as (keyof Data)[];
        if (Object.keys(data).length) {
          setData(data);
        }
        if (keys.length > 0) {
          const requestData: RequestData<Params, Data> = {
            params: await (params instanceof Function ? params() : params),
            keys: keys
          };
          onFetch(keys);
          await firebaseFunctionHelper(callable, requestData, async newData => {
            setData(Object.assign(data, newData));
            const now = dayjs().unix().toString();
            await AsyncStorage.multiSet(keys.flatMap(key => [
              [caches[key].key, JSON.stringify(data[key])],
              [`${caches[key].key}/ctime`, now]
            ]));
          }, () => {
            onFail();
            triesRef.current++;
          }, release);
        }
      } else {
        release();
      }
    });
  }, [caches, callable, condition, getData, onFail, onFetch, params, setData, tries]);
  useEffect(() => {
    callback();
  }, [callback, data]);
  return data;
}
