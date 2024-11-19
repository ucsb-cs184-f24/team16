import type {UCSBEvents} from "./ucsb";
import type {CanvasEvent} from "./canvas";
import type {GradescopeCourse} from "./gradescope";

export interface Credentials {
  username: string;
  password: string;
}

export enum Status {
  OK = "OK",
  NOT_SIGNED_IN = "NOT_SIGNED_IN",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

export interface RequestData<Params = unknown, Data = unknown> {
  params: Params;
  keys?: (keyof Data)[];
}

export type ResponseData<T> = {
  status: Status.OK;
  data: Partial<T>
} | {
  status: Exclude<Status, Status.OK>;
  error: unknown;
}

export interface CalendarsData {
  ucsbEvents: UCSBEvents;
  canvasEvents: CanvasEvent[];
  gradescopeCourses: GradescopeCourse[];
}
