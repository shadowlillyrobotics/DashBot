"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const https = require("https");
const URL = require("url");
function default_1(url) {
    return new Promise((resolve, reject) => {
        const parsedUrl = URL.parse(url);
        const options = {
            "headers": {
                "User-Agent": "track-redirect npm module"
            },
            "host": parsedUrl.hostname,
            "method": "HEAD",
            "path": parsedUrl.path
        };
        if (parsedUrl.port)
            options.port = Number(parsedUrl.port);
        const callback = (res) => {
            resolve(res.headers);
        };
        const req = parsedUrl.protocol === "http:"
            ? http.request(options, callback)
            : parsedUrl.protocol === "https:"
                ? https.request(options, callback)
                : null;
        if (req === null)
            reject("not-supported-protocol");
        req.end();
    });
}
exports.default = default_1;
