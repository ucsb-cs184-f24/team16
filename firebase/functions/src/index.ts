/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {https} from "firebase-functions";
import {
  type RequestData,
  type ResponseData,
  type Quarters,
  Status,
} from "./types";
import {getCurrent, getNext} from "./quarters";
import * as admin from "firebase-admin";

admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export * from "./calendars";

export const getQuarters =
    https.onCall<RequestData<null, Quarters>, Promise<ResponseData<Quarters>>>({
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

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
