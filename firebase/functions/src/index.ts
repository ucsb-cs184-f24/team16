/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onCall} from "firebase-functions/v2/https";
import {type FunctionResponse, Status} from "./constants";
import {getCurrent, getNext, type Quarter} from "./quarters";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export * from "./calendars";

export const getQuarters = onCall<void, Promise<FunctionResponse<{
  current: Quarter;
  next: Quarter;
}>>>(async () => {
  try {
    return {
      status: Status.OK,
      data: {
        current: await getCurrent(),
        next: await getNext(),
      },
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
