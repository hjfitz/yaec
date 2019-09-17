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
var querystring_1 = __importDefault(require("querystring"));
var util_1 = require("./util");
var d = debug_1.default('mtws:request');
function inherit(obj) {
    var _this = this;
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
        // this.headers = request.req.headers
        // this.url = request.req.url
        // this.pathname = this.url
        // this.method = request.req.method
        if (request.req.headers.cookie)
            _this.cookies = util_1.parseCookies(request.req.headers.cookie);
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
                _this.parseData(body, type);
                res(_this);
            });
        });
    };
    Request.prototype.parseData = function (body, type) {
        if (!type)
            return;
        if (type === 'text/plain') {
            this.payload = body;
        }
        else if (type.indexOf('application/json') > -1) {
            try {
                d('parsing application/json');
                d(body);
                var parsed = JSON.parse(body);
                d('parse successful');
                this.payload = parsed;
            }
            catch (err) {
                d(err);
                d('Unable to parse body');
            }
        }
        else if (type.includes('boundary') || body.includes('Boundary')) {
            this.payload = util_1.parseBoundary(type, body);
        }
        else if (type === 'application/x-www-form-urlencoded') {
            d('parsing form x-www-formdata');
            d(body);
            d(querystring_1.default.parse(body));
            try {
                this.payload = JSON.parse(body);
            }
            catch (err) {
                d('err parsing with JSON.parse');
                var parsedForm = querystring_1.default.parse(body);
                d(typeof parsedForm);
                this.payload = parsedForm;
            }
        }
        else {
            d('unknown header!', type);
            d('defaulting parse! keeping raw data');
            this.payload = body || '';
        }
    };
    return Request;
}(http_1.default.IncomingMessage));
exports.default = Request;
