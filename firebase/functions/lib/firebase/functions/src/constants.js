"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_DATA_DIRS = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const node_fs_1 = __importDefault(require("node:fs"));
exports.USER_DATA_DIRS = node_path_1.default.join(node_os_1.default.tmpdir(), "user-data-dirs");
node_fs_1.default.mkdirSync(exports.USER_DATA_DIRS, { recursive: true });
//# sourceMappingURL=constants.js.map