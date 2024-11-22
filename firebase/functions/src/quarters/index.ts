import {https} from "firebase-functions";
import {
  type Quarters,
  type RequestData,
  type ResponseData,
  Status,
} from "../types";
import {getCurrent, getNext} from "./quarters";

export const getQuarters =
    https.onCall<
      RequestData<null, Quarters>,
      Promise<ResponseData<Partial<Quarters>>>
    >({
      memory: "256MiB",
      timeoutSeconds: 10,
    }, async ({data: {keys}}) => {
      try {
        const data: Partial<Quarters> = {};
        keys ??= ["current", "next"];
        await Promise.all(keys.map(async (key) => {
          switch (key) {
          case "current":
            data.current = await getCurrent();
            break;
          case "next":
            data.next = await getNext();
            break;
          }
        }));
        return {
          status: Status.OK,
          data,
        };
      } catch (error) {
        console.error(error);
        return {
          status: Status.INTERNAL_SERVER_ERROR,
          error: error,
        };
      }
    });

export {getCurrent, getNext};
