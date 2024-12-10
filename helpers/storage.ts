import AsyncStorage from "@react-native-async-storage/async-storage";
import {Mutex} from "async-mutex";

type Listener<T> = (newValue: T, originalValue: T) => any;

interface StorageEntry<T> {
  value: T | null;
  listeners: Record<string, Listener<T>>;
}

// if (!("_storage" in global)) {
//   Object.assign(global, {_storage: {}});
// }
//
// if (!("_storage_mutexes" in global)) {
//   Object.assign(global, {_storage_mutexes: {}});
// }
//
// const storage = (global as Record<string, any>)._storage as Record<string, StorageEntry<any>>;
// const mutexes = (global as Record<string, any>)._storage_mutexes as Record<string, Mutex>;

const storage: Record<string, StorageEntry<any>> = {};
const mutexes: Record<string, Mutex> = {};

function getMutex(key: string): Mutex {
  return mutexes[key] ??= new Mutex();
}

export async function loadValue<T>(key: string, persist: boolean = true): Promise<T | null> {
  const release = await getMutex(key).acquire();
  try {
    if (!(key in storage)) {
      const result = persist ? await AsyncStorage.getItem(key) : null;
      if (result) {
        const value: T | null = JSON.parse(result);
        storage[key] = {value, listeners: {}};
        return value;
      } else {
        return null;
      }
    } else {
      return storage[key].value;
    }
  } finally {
    release();
  }
}

export function getValue<T>(key: string, defaultValue: T): T;
export function getValue<T>(key: string, defaultValue?: null): T | null;
export function getValue<T>(key: string, defaultValue?: T | null): T | null;
export function getValue<T>(
    key: string, defaultValue: T | null = null
): T | null {
  if (key in storage) {
    return storage[key].value;
  } else {
    return defaultValue;
  }
}

export function setValue<T>(key: string, value: T | null, persist: boolean = true): boolean {
  if (!(key in storage)) {
    storage[key] = {value, listeners: {}};
    if (persist) {
      getMutex(key).acquire().then(
        release => AsyncStorage.setItem(key, JSON.stringify(value)).then(release, release)
      );
    }
    return true;
  } else {
    const oldValue = storage[key].value;
    storage[key].value = value;
    if (persist) {
      getMutex(key).acquire().then(
          release => AsyncStorage.setItem(key, JSON.stringify(value)).then(release, release)
      );
    }
    for (const listener of Object.values(storage[key].listeners)) {
      listener(value, oldValue);
    }
    return false;
  }
}

export function addListener<T>(key: string, listener: Listener<T>): string {
  const id = Math.random().toString(36).substring(2);
  if (!(key in storage)) {
    storage[key] = {value: null, listeners: {}};
  }
  storage[key].listeners[id] = listener;
  return id;
}

export function removeListener(key: string, id: string): void {
  if (key in storage) {
    delete storage[key].listeners[id];
  }
}
