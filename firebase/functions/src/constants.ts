import path from "node:path";
import os from "node:os";
import fs from "node:fs";

export const USER_DATA_DIRS = path.join(os.tmpdir(), "user-data-dirs");

fs.mkdirSync(USER_DATA_DIRS, {recursive: true});

export const USER_AGENT = [
  "Mozilla/5.0",
  "(Macintosh; Intel Mac OS X 10_15_7)",
  "AppleWebKit/537.36",
  "(KHTML, like Gecko)",
  "Chrome/130.0.0.0",
  "Safari/537.36",
].join("");
