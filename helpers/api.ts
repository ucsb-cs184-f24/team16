import {jsdom} from "jsdom-jscore-rn";

export interface Quarter {
  "quarter": string;
  "qyy": string;
  "name": string;
  "category": string;
  "academicYear": string;
  "firstDayOfClasses": string;
  "lastDayOfClasses": string;
  "firstDayOfFinals": string;
  "lastDayOfFinals": string;
  "firstDayOfQuarter": string;
  "lastDayOfSchedule": string;
  "pass1Begin": string;
  "pass2Begin": string;
  "pass3Begin": string;
  "feeDeadline": string;
  "lastDayToAddUnderGrad": string;
  "lastDayToAddGrad": string;
  "lastDayThirdWeek": string;
}

export async function getQuarter(): Promise<Quarter> {
  const url = 'https://api-transformer.onrender.com//https://api.ucsb.edu/academics/quartercalendar/v1/quarters/current';
  const headers = {
    'accept': 'application/json',
    'ucsb-api-version': '1.0',
    'ucsb-api-key': '1M1qsvRB65v5n0CR9ihHJCsEJF2lCvZe'
  };

  try {
    const response = await fetch(url, {method: 'GET', headers: {headers: JSON.stringify(headers)}});
    if (!response.ok) {
      throw new Error('Failed to fetch quarter info');
    }
    return response.json();
  } catch (error) {
    throw error;
  }
}


interface UCSBEvent {
  start: string | undefined;
  end: string | undefined;
  content: string | undefined;
  event: string | undefined;
}

export interface UCSBEvents {
  M: UCSBEvent[];
  T: UCSBEvent[];
  W: UCSBEvent[];
  R: UCSBEvent[];
  F: UCSBEvent[];
  S: UCSBEvent[];
  U: UCSBEvent[];
}

type UCSBDay = "M" | "T" | "W" | "R" | "F" | "S" | "U";
const UCSBDays: UCSBDay[] = ["M", "T", "W", "R", "F", "S", "U"];

export async function getUCSBEvents(headers: HeadersInit): Promise<UCSBEvents> {
  const response = await fetch("https://api-transformer.onrender.com//https://my.sa.ucsb.edu/gold/WeeklyStudentSchedule.aspx", {
    "method": "GET",
    "headers": headers
  });
  const dom = jsdom(await response.text());
  console.log("Dom", dom.title);
  const eventsElement = dom.querySelector('#pageContent_events');
  if (eventsElement) {
    const events: UCSBEvents = {
      M: [],
      T: [],
      W: [],
      R: [],
      F: [],
      S: [],
      U: []
    };
    for (const day of UCSBDays) {
      const eventGroup = eventsElement.querySelector(`#pageContent_eventsgroup${day}`);
      if (eventGroup) {
        const currentEvents = eventGroup.querySelectorAll('.single-event');
        events[day] = Array.from(currentEvents).map((eventElement: Element) => ({
          start: eventElement.attributes.getNamedItem('data-start')?.value,
          end: eventElement.attributes.getNamedItem('data-end')?.value,
          content: eventElement.attributes.getNamedItem('data-content')?.value,
          event: eventElement.attributes.getNamedItem('data-event')?.value
        }));
      }
    }
    return events;
  } else {
    throw new Error("Failed to get events element");
  }
}

type CanvasEvents = object;

export async function getCanvasEvents(headers: HeadersInit): Promise<CanvasEvents> {
  const response = await fetch("https://ucsb.instructure.com/api/v1/users/self", {
    "method": "GET",
    "headers": headers
  });
  return response.json();
}
