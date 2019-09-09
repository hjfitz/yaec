"use strict";
/**
 * BIG TODO: REFACTOR
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug_1 = __importDefault(require("debug"));
var querystring_1 = __importDefault(require("querystring"));
var d = debug_1.default('rqst');
function parseBoundary(type, body) {
    d('parsing form with boundary');
    var _a = type.split('='), delim = _a[1];
    d("delim: " + delim);
    var splitBody = body.split('\n').map(function (line) { return line.replace(/\r/g, ''); });
    var keySplit = [];
    var cur = [];
    for (var i = 0; i < splitBody.length; i += 1) {
        var line = splitBody[i];
        d(line);
        if (line.includes(delim)) {
            if (cur.length)
                keySplit.push(__spreadArrays(cur));
            cur.length = 0;
        }
        else {
            if (line.length)
                cur.push(line);
        }
    }
    var parsed = keySplit.map(function (pair) {
        var _a;
        var unparsedKey = pair[0], rest = pair.slice(1);
        var key = unparsedKey
            .replace('Content-Disposition: form-data name=', '')
            .replace(/"/g, '');
        return _a = {}, _a[key] = rest.join(), _a;
    }).reduce(function (acc, curr) { return Object.assign(acc, curr); }, {});
    return parsed;
}
exports.parseBoundary = parseBoundary;
var parseCookies = function (dough) { return dough.map(function (pair) {
    var _a;
    var _b = pair.split('='), key = _b[0], vals = _b.slice(1);
    return _a = {}, _a[key] = vals.join('='), _a;
})
    .reduce(function (acc, cur) { return Object.assign(acc, cur); }, {}); };
var Request = /** @class */ (function () {
    function Request(options) {
        this.pathname = options.pathname || 'unknown';
        this.url = options.pathname || 'unknown';
        this.headers = options.headers;
        this.method = options.method || 'unknown';
        this.code = options.statusCode || 200;
        this.query = options.query;
        this._req = options.req;
        if (Array.isArray(this.headers.cookie)) {
            this.cookies = parseCookies(this.headers.cookie);
        }
        else if (typeof this.headers.cookie === 'string') {
            this.cookies = parseCookies(this.headers.cookie.split(''));
        }
        else {
            this.cookies = {};
        }
        d("Request made to " + this.pathname);
    }
    Request.prototype.handleIncomingStream = function (type) {
        var _this = this;
        return new Promise(function (res) {
            var body = '';
            _this._req.on('data', function (data) {
                // kill early if we're getting too much info
                if (body.length > 1e6)
                    _this._req.connection.destroy();
                body += data;
            });
            _this._req.on('end', function () {
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
            this.payload = parseBoundary(type, body);
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
}());
exports.default = Request;
