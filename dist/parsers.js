"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var d = debug_1.default('mtws:util');
function parseBoundary(type, body) {
    d('parsing form with boundary');
    var _a = type.split('='), delim = _a[1];
    d("delim: " + delim);
    var splitBody = body.split('\n').map(function (line) { return line.replace(/\r/g, ''); }).filter(Boolean);
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
function parseCookies(dough) {
    return dough.split('; ').map(function (pair) {
        var _a;
        var _b = pair.split('='), key = _b[0], vals = _b.slice(1);
        var val = vals.join('=');
        return _a = {}, _a[key] = val, _a;
    })
        .reduce(function (acc, cur) { return (__assign(__assign({}, acc), cur)); }, {});
}
exports.parseCookies = parseCookies;
function getBodyParser(type) {
    if (type.includes('application/json'))
        return function (tp, bd) { return JSON.parse(bd); };
    if (type.includes('boundary'))
        return function (tp, bd) { return parseBoundary(tp, bd); };
    if (type.includes('x-www-form-urlencoded'))
        return function (tp, bd) { return querystring_1.default.parse(bd); };
    return function (bd) { return bd; };
}
function parseData(body, type) {
    d('Parsing: ', { body: body });
    d('type: ', { type: type });
    var parser = getBodyParser(type);
    return parser(type, body);
}
exports.parseData = parseData;
