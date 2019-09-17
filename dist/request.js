"use strict";
/**
 * BIG TODO: REFACTOR
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __importDefault(require("http"));
var debug_1 = __importDefault(require("debug"));
var parsers_1 = require("./parsers");
var d = debug_1.default('mtws:request');
function inherit(obj) {
    var _this = this;
    // @ts-ignore (as this can be `any`)
    Object.keys(obj).forEach(function (key) { return _this[key] = obj[key]; });
}
var Request = /** @class */ (function (_super) {
    __extends(Request, _super);
    function Request(request) {
        var _this = _super.call(this, request.req.connection) || this;
        _this.cookies = {};
        _this.payload = '';
        _this.req = request.req;
        _this.originalUrl = request.pathname;
        inherit.bind(_this)(request.req);
        if (request.req.headers.cookie)
            _this.cookies = parsers_1.parseCookies(request.req.headers.cookie);
        d("Request made to " + request.pathname);
        return _this;
    }
    Request.prototype.handleIncomingStream = function (type) {
        var _this = this;
        return new Promise(function (res) {
            var body = '';
            _this.req.on('data', function (data) {
                // kill early if we're getting too much info
                if (body.length > 1e6)
                    _this.req.connection.destroy();
                body += data;
            });
            _this.req.on('end', function () {
                _this.payload = parsers_1.parseData(body, type);
                res(_this);
            });
        });
    };
    return Request;
}(http_1.default.IncomingMessage));
exports.default = Request;
