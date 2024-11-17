/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onCall} from "firebase-functions/v2/https";
import {type FunctionResponse, type Quarters, Status} from "./types";
import {getCurrent, getNext} from "./quarters";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export * from "./calendars";

export const getQuarters =
    onCall<void, Promise<FunctionResponse<Quarters>>>(async () => {
      try {
        return {
          status: Status.OK,
          data: {
            current: await getCurrent(),
            next: await getNext(),
          },
        } as FunctionResponse<Quarters>;
      } catch (error) {
        console.error(error);
        return {
          status: Status.INTERNAL_SERVER_ERROR,
          error: error,
        } as FunctionResponse<Quarters>;
      }
    });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
