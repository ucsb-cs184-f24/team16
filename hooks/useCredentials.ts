import {type Dispatch, type SetStateAction, useEffect, useState} from "react";
import type {Credentials} from "@/firebase/functions/src/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function useCredentials(): [Credentials | null, Dispatch<SetStateAction<Credentials | null>>] {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  useEffect(() => {
    AsyncStorage.getItem("credentials").then(credentialsStr => {
      if (credentialsStr) {
        setCredentials(JSON.parse(credentialsStr));
      }
    });
  }, []);
  return [credentials, setCredentials];
}
