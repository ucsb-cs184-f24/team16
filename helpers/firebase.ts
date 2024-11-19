import {type FirebaseApp, type FirebaseOptions, initializeApp} from 'firebase/app';
// import {type Database, getDatabase} from "@firebase/database";
// import {type FirebaseStorage, getStorage} from "@firebase/storage";
// import {
//   type Auth,
//   initializeAuth,
//   inMemoryPersistence,
//   type Persistence,
// } from "firebase/auth";
// import {type Firestore, getFirestore} from "@firebase/firestore";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import {type Functions, getFunctions, httpsCallable} from "@firebase/functions";
import type {
  CalendarsData,
  Credentials,
  Quarters,
  RequestData,
  ResponseData,
} from "@/types";

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// class AsyncStoragePersistence {
//   static readonly type: "LOCAL" = "LOCAL";
//   readonly type: "LOCAL" = "LOCAL";
//
//   async _isAvailable() {
//     try {
//       if (!AsyncStorage) {
//         return false;
//       }
//       await AsyncStorage.setItem("__sak", "1");
//       await AsyncStorage.removeItem("__sak");
//       return true;
//     } catch {
//       return false;
//     }
//   }
//
//   _set(key: string, value: any): Promise<void> {
//     return AsyncStorage.setItem(key, JSON.stringify(value));
//   }
//
//   async _get(key: string): Promise<any> {
//     const json = await AsyncStorage.getItem(key);
//     return json ? JSON.parse(json) : null;
//   }
//
//   _remove(key: string): Promise<void> {
//     return AsyncStorage.removeItem(key);
//   }
//
//   _addListener(_key: string, _listener: string): void {
//     // Listeners are not supported for React Native storage.
//     return;
//   }
//
//   _removeListener(_key: string, _listener: string): void {
//     // Listeners are not supported for React Native storage.
//     return;
//   }
// }
//
// const asyncStoragePersistence = AsyncStoragePersistence as Persistence;

// Initialize Firebase
const firebase: FirebaseOptions = {
  apiKey: "AIzaSyDyvXDu-yjja7J9rqOIUofuBse6PDNuIhI",
  authDomain: "team16-441820.firebaseapp.com",
  databaseURL: "https://team16-441820-default-rtdb.firebaseio.com",
  projectId: "team16-441820",
  storageBucket: "team16-441820.firebasestorage.app",
  messagingSenderId: "118687664114",
  appId: "1:118687664114:web:7e6ca6149b1d56aedd0d6b",
  measurementId: "G-N3E4F919G4"
};

// Initialize Firebase
export const app: FirebaseApp = initializeApp(firebase);
// console.log("inMemoryPersistence", inMemoryPersistence.toString());
// console.log("typeof inMemoryPersistence", typeof inMemoryPersistence);
// export const auth: Auth = initializeAuth(app, {
//   persistence: [
//     asyncStoragePersistence,
//     inMemoryPersistence
//   ]
// });
// // export const analytics: Analytics = getAnalytics(app);
// export const database: Database = getDatabase(app);
// export const firestore: Firestore = getFirestore(app);
// export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);

export const getCalendars = httpsCallable<
    RequestData<Credentials | null, CalendarsData>,
    ResponseData<CalendarsData>
>(functions, "getCalendars");
export const getQuarters = httpsCallable<
    RequestData<null, Quarters>,
    ResponseData<Quarters>
>(functions, "getQuarters");

console.log("firebase initialized");

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
