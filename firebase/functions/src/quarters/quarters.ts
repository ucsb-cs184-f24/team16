import {Mutex} from "async-mutex";
import dayjs from "dayjs";
import type {Quarter} from "../types";

const quartersMutex = new Mutex();
let quarters: Record<string, Quarter> | null = null;
let current: Quarter | null = null;
let next: Quarter | null = null;

/**
 * Get all quarters
 * @return {Promise<Record<string, Quarter>>}
 */
export async function loadQuarters(): Promise<Record<string, Quarter>> {
  if (!quarters) {
    const release = await quartersMutex.acquire();
    try {
      if (!quarters) {
        const response = await fetch(
          "https://api.ucsb.edu/academics/quartercalendar/v1/quarters",
          {
            method: "GET",
            headers: {
              "accept": "application/json",
              "ucsb-api-version": "1.0",
              "ucsb-api-key": "1M1qsvRB65v5n0CR9ihHJCsEJF2lCvZe",
            },
          }
        );
        const quarterList = await response.json() as Quarter[];
        const now = dayjs();
        quarters = quarterList.reduce<Record<string, Quarter>>(
          (quarters, quarter) => {
            quarters[quarter.quarter] = quarter;
            if (dayjs(quarter.firstDayOfQuarter).diff(now) <= 0 &&
                  dayjs(quarter.lastDayOfSchedule).diff(now) >= 0) {
              current = quarter;
            }
            return quarters;
          },
          {}
        );
        if (current) {
          let quarter = parseInt(current.quarter);
          quarter += quarter % 10 === 4 ? 7 : 1;
          next = quarters[quarter];
        }
      }
    } finally {
      release();
    }
  }
  return quarters;
}

/**
 * Get current quarter
 * @return {Promise<Quarter>}
 */
export async function getCurrent(): Promise<Quarter> {
  await loadQuarters();
  if (!current) {
    throw new Error("Cannot find quarter");
  }
  return current;
}

/**
 * Get next quarter
 * @return {Promise<Quarter>}
 */
export async function getNext(): Promise<Quarter> {
  await loadQuarters();
  if (!next) {
    throw new Error("Cannot find quarter");
  }
  return next;
}
