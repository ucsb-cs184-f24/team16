import type {UCSBEvents} from "./ucsb";
import type {CanvasEvent} from "./canvas";

export interface Credentials {
  username: string;
  password: string;
}

export enum Status {
  OK = "OK",
  NOT_SIGNED_IN = "NOT_SIGNED_IN",
  NO_COOKIES = "NO_COOKIES",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

export interface FunctionResponse<T, S extends Status = Status> {
  status: S;
  data: S extends Status.OK ? T : never;
  error: S extends Status.OK ? never : any;
}

export interface CalendarsData {
  ucsbEvents: UCSBEvents;
  canvasEvents: CanvasEvent[];
}
