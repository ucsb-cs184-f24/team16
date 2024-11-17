import path from "node:path";
import os from "node:os";
import fs from "node:fs";

export const USER_DATA_DIRS = path.join(os.tmpdir(), "user-data-dirs");

fs.mkdirSync(USER_DATA_DIRS, {recursive: true});
