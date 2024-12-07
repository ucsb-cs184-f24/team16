import {useCallback, useEffect, useReducer} from "react";
import {addListener, getValue, loadValue, removeListener, setValue} from "@/helpers/storage";

export default function useValue<T>(
    key: string,
    persist: boolean = true
): [() => T | null, (value: T | null) => void] {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  useEffect(() => {
    const idPromise = loadValue<T>(key, persist).then(
        () => addListener<T>(key, forceUpdate)
    );
    return () => {
      idPromise.then(id => removeListener(key, id));
    };
  }, [key, persist]);
  const getter = useCallback(
      (defaultValue?: T) => getValue<T>(key, defaultValue),
      [key]
  );
  const setter = useCallback(
      (value: T | null) => setValue<T>(key, value, persist),
      [key, persist]
  );
  return [getter, setter];
}