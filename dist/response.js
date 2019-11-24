"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug_1 = __importDefault(require("debug"));
var d = debug_1.default('mtws:response');
var Response = /** @class */ (function () {
    function Response(res, req) {
        this.code = 200;
        this.encoding = 'utf8';
        this.type = 'text/plain';
        this.hRes = res;
        this.hReq = req;
        // default to plaintext response
        this.hRes.setHeader('content-type', 'text/plain');
        this.hRes.setHeader('Set-Cookie', ['server=mtws']);
    }
    Response.prototype.send = function (payload) {
        var _this = this;
        d("sending " + this.type + "; data: " + payload);
        this.hRes.writeHead(this.code, { 'Content-Type': this.type });
        this.hRes.write(payload, this.encoding, function () {
            _this.hRes.end('');
            _this.hReq.req.connection.destroy();
        });
    };
    Response.prototype.json = function (payload) {
        this.type = 'application/json';
        this.send(JSON.stringify(payload));
    };
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
