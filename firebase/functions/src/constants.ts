import path from "node:path";
import os from "node:os";
import fs from "node:fs";

export interface Credentials {
  username: string;
  password: string;
}

export enum Status {
  OK,
  NOT_SIGNED_IN,
  NO_COOKIES,
  INTERNAL_SERVER_ERROR,
}

export type FunctionResponse<T> = {
  status: Status.OK;
  data: T;
} | {
  status: Exclude<Status, Status.OK>;
  error?: any;
}

export const USER_DATA_DIRS = path.join(os.tmpdir(), "user-data-dirs");

fs.mkdirSync(USER_DATA_DIRS, {recursive: true});
