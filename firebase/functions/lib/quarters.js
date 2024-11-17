"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNext = exports.getCurrent = exports.getQuarters = void 0;
const async_mutex_1 = require("async-mutex");
const dayjs_1 = __importDefault(require("dayjs"));
const quartersMutex = new async_mutex_1.Mutex();
let quarters = null;
let current = null;
let next = null;
/**
 * Get all quarters
 * @return {Promise<Record<string, Quarter>>}
 */
async function getQuarters() {
    if (!quarters) {
        const release = await quartersMutex.acquire();
        try {
            if (!quarters) {
                const response = await fetch("https://api.ucsb.edu/academics/quartercalendar/v1/quarters", {
                    method: "GET",
                    headers: {
                        "accept": "application/json",
                        "ucsb-api-version": "1.0",
                        "ucsb-api-key": "1M1qsvRB65v5n0CR9ihHJCsEJF2lCvZe",
                    },
                });
                const quarterList = await response.json();
                const now = (0, dayjs_1.default)();
                quarters = quarterList.reduce((quarters, quarter) => {
                    quarters[quarter.quarter] = quarter;
                    if ((0, dayjs_1.default)(quarter.firstDayOfQuarter).diff(now) <= 0 &&
                        (0, dayjs_1.default)(quarter.lastDayOfSchedule).diff(now) >= 0) {
                        current = quarter;
                    }
                    return quarters;
                }, {});
                if (current) {
                    let quarter = parseInt(current.quarter);
                    quarter += quarter % 10 === 4 ? 7 : 1;
                    next = quarters[quarter];
                }
            }
        }
        finally {
            release();
        }
    }
    return quarters;
}
exports.getQuarters = getQuarters;
/**
 * Get current quarter
 * @return {Promise<Quarter>}
 */
async function getCurrent() {
    await getQuarters();
    if (!current) {
        throw new Error("Cannot find quarter");
    }
    return current;
}
exports.getCurrent = getCurrent;
/**
 * Get next quarter
 * @return {Promise<Quarter>}
 */
async function getNext() {
    await getQuarters();
    if (!next) {
        throw new Error("Cannot find quarter");
    }
    return next;
}
exports.getNext = getNext;
//# sourceMappingURL=quarters.js.map