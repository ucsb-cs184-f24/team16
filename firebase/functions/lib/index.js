"use strict";
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuarters = void 0;
const https_1 = require("firebase-functions/v2/https");
const constants_1 = require("./constants");
const quarters_1 = require("./quarters");
// Start writing functions
// https://firebase.google.com/docs/functions/typescript
__exportStar(require("./calendars"), exports);
exports.getQuarters = (0, https_1.onCall)(async () => {
    try {
        return {
            status: constants_1.Status.OK,
            data: {
                current: await (0, quarters_1.getCurrent)(),
                next: await (0, quarters_1.getNext)(),
            },
        };
    }
    catch (error) {
        console.error(error);
        return {
            status: constants_1.Status.INTERNAL_SERVER_ERROR,
            error: error,
        };
    }
});
// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
//# sourceMappingURL=index.js.map