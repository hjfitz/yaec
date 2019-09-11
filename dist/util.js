"use strict";
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
exports.parseCookies = function (dough) { return dough.split('').map(function (pair) {
    var _a;
    var _b = pair.split('='), key = _b[0], vals = _b.slice(1);
    return _a = {}, _a[key] = vals.join('='), _a;
})
    .reduce(function (acc, cur) { return Object.assign(acc, cur); }, {}); };
