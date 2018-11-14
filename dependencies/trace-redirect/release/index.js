"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const get_header_1 = require("./get-header");
exports.default = (url) => __awaiter(this, void 0, void 0, function* () {
    let destination = url;
    while (true) {
        const header = yield get_header_1.default(destination);
        if (header.location) {
            destination = header.location;
        }
        else {
            break;
        }
    }
    return destination;
});
