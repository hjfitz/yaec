"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug_1 = __importDefault(require("debug"));
var d = debug_1.default('resp');
var Response = /** @class */ (function () {
    function Response(res, req) {
        var _this = this;
        this.json = function (payload) { return _this.send(JSON.stringify(payload), 'application/json'); };
        this.hRes = res;
        this.hReq = req;
        // default to plaintext response
        this.hRes.setHeader('content-type', 'text/plain');
        this.hRes.setHeader('Set-Cookie', ['set-by=ts-server']);
    }
    /**
     * Send some data, and once it's flushed - end the connection
     * @param payload a string of data to send
     * @param encoding encoding to use
     */
    Response.prototype.send = function (payload, type, encoding, code) {
        var _this = this;
        if (type === void 0) { type = 'text/plain'; }
        if (encoding === void 0) { encoding = 'utf8'; }
        if (code === void 0) { code = 200; }
        d("sending " + type + "; data: " + payload);
        this.hRes.writeHead(code, { 'Content-Type': type });
        this.hRes.write(payload, encoding, function () {
            _this.hRes.end('\n');
            _this.hReq._req.connection.destroy();
        });
    };
    /**
     * Set a message and code, and end the connection
     * @param code HTTP code to send
     * @param message Message to optionally send
     */
    Response.prototype.sendStatus = function (code, message) {
        if (message)
            this.hRes.statusMessage = message;
        d("Setting code to " + code);
        this.hRes.statusCode = code;
        this.hRes.end();
    };
    return Response;
}());
exports.default = Response;
