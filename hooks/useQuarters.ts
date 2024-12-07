import {useFirebaseFunction} from "@/hooks/useFirebaseFunction";
import {getQuarters} from "@/helpers/firebase";
import type {Quarters} from "@/types/quarters";

export default function useQuarters(): Quarters | null {
  return useFirebaseFunction({
    key: "quarters",
    cache: {
      key: "quarters",
      duration: {days: 1}
    },
    callable: getQuarters,
    params: null,
  });
}
