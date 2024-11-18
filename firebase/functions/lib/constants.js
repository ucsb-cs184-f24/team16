"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_AGENT = exports.USER_DATA_DIRS = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const node_fs_1 = __importDefault(require("node:fs"));
exports.USER_DATA_DIRS = node_path_1.default.join(node_os_1.default.tmpdir(), "user-data-dirs");
node_fs_1.default.mkdirSync(exports.USER_DATA_DIRS, { recursive: true });
exports.USER_AGENT = [
    "Mozilla/5.0",
    "(Macintosh; Intel Mac OS X 10_15_7)",
    "AppleWebKit/537.36",
    "(KHTML, like Gecko)",
    "Chrome/130.0.0.0",
    "Safari/537.36",
].join("");
//# sourceMappingURL=constants.js.map