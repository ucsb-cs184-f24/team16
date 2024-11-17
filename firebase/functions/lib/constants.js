"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_DATA_DIRS = exports.Status = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const node_fs_1 = __importDefault(require("node:fs"));
var Status;
(function (Status) {
    Status[Status["OK"] = 0] = "OK";
    Status[Status["NOT_SIGNED_IN"] = 1] = "NOT_SIGNED_IN";
    Status[Status["NO_COOKIES"] = 2] = "NO_COOKIES";
    Status[Status["INTERNAL_SERVER_ERROR"] = 3] = "INTERNAL_SERVER_ERROR";
})(Status = exports.Status || (exports.Status = {}));
exports.USER_DATA_DIRS = node_path_1.default.join(node_os_1.default.tmpdir(), "user-data-dirs");
node_fs_1.default.mkdirSync(exports.USER_DATA_DIRS, { recursive: true });
//# sourceMappingURL=constants.js.map