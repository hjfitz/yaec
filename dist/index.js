"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var http_1 = __importDefault(require("http"));
var url_1 = require("url");
var querystring_1 = __importDefault(require("querystring"));
var debug_1 = __importDefault(require("debug"));
var request_1 = __importDefault(require("./request"));
var response_1 = __importDefault(require("./response"));
var d = debug_1.default('serv');
var matches = function (req, mw) {
    d('handling match');
    if (!mw)
        return false;
    d(req.url, mw.url);
    d(req.method, mw.method);
    var urlMatches = (req.url === mw.url);
    var methodMatches = (req.method === mw.method) || mw.method === '*';
    d(methodMatches && urlMatches);
    return methodMatches && urlMatches;
};
var notfound = function (req, res) { return res.sendStatus(404); };
// router can be a route as router.func should handle sub-routing
var Router = /** @class */ (function () {
    function Router(url, method) {
        var _this = this;
        this.routes = [];
        this.subroute = function (router) {
            _this.routes.push(router);
        };
        this.add = function (method, url, func) {
            if (func instanceof Router) {
                d('subrouting...');
                func.url = url;
                func.method = method;
                _this.subroute(func);
                return;
            }
            _this.routes.push({ method: method, url: url, func: func });
        };
        // if we're calling func, we're looking for a subrouter. handle this here
        this.func = this.handle;
        this.get = this.add.bind(this, 'GET');
        this.post = this.add.bind(this, 'POST');
        this.put = this.add.bind(this, 'PUT');
        this.path = this.add.bind(this, 'PATCH');
        this.delete = this.add.bind(this, 'DELETE');
        this.head = this.add.bind(this, 'HEAD');
        this.url = url || 'none';
        this.method = method || 'none';
    }
    Router.prototype.next = function (req, res, routes) {
        var _this = this;
        return function () {
            var r = new Router(_this.url, _this.method);
            r.routes = routes;
            r.handle(req, res);
        };
    };
    Router.prototype.handle = function (req, res) {
        // shallow clone current routes
        var cloned = __spreadArrays(this.routes);
        var cur = cloned.shift();
        // todo: use this.url to help match route
        while (cur && !matches(req, cur))
            cur = cloned.shift();
        if (!cur)
            notfound(req, res);
        else
            // todo: next()
            // let idx = this.routes.indexOf(cur)
            cur.func(req, res, this.next(req, res, cloned));
    };
    return Router;
}());
exports.Router = Router;
var Server = /** @class */ (function (_super) {
    __extends(Server, _super);
    function Server() {
        var _this = _super.call(this, '/', '*') || this;
        _this.listen = function (port, cb) {
            _this.server.listen(port, cb);
        };
        _this.listener = _this.listener.bind(_this);
        _this.server = http_1.default.createServer(_this.listener);
        return _this;
    }
    Server.prototype.listener = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var parsedReq, parsedRes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        d('===BEGINNING PARSE===');
                        return [4 /*yield*/, Server.parseRequest(req)];
                    case 1:
                        parsedReq = _a.sent();
                        parsedRes = new response_1.default(res, parsedReq);
                        d('attempting to handle');
                        this.handle(parsedReq, parsedRes);
                        d('===END PARSE===');
                        return [2 /*return*/];
                }
            });
        });
    };
    // todo: add stack to req
    Server.parseRequest = function (req) {
        // get what we're interested from the pure request
        var url = req.url, headers = req.headers, method = req.method, statusCode = req.statusCode;
        var _a = url_1.parse(url || ''), query = _a.query, pathname = _a.pathname;
        var pQuery = querystring_1.default.parse(query || '');
        d('beginning request parse');
        var parsedRequest = new request_1.default({ statusCode: statusCode, pathname: pathname, headers: headers, method: method, req: req, query: pQuery });
        // attempt to parse incoming data
        d("content type: " + headers['content-type']);
        if (!('content-type' in headers))
            return Promise.resolve(parsedRequest);
        d('parsing incoming stream...');
        // handleIncomingStream returns itself - resolve after handling
        return parsedRequest.handleIncomingStream(headers['content-type']);
    };
    return Server;
}(Router));
function createServer() {
    return new Server();
}
exports.default = createServer;
