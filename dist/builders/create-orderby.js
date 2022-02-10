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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderby = void 0;
var create_query_1 = require("./create-query");
function makeOrderby(key) {
    if (key === void 0) { key = ''; }
    if (key[0] === '/') {
        key = key.slice(1);
    }
    var methods = {
        _key: key,
        asc: function () { return makeOrderby("".concat(key, " asc")); },
        desc: function () { return makeOrderby("".concat(key, " desc")); },
    };
    return new Proxy({}, {
        get: function (_, prop) {
            return methods[prop] || makeOrderby("".concat(key, "/").concat(String(prop)));
        },
    });
}
function createOrderby(descriptor) {
    return function (keyOrExp, order) {
        var expr = typeof keyOrExp === 'string'
            ? makeOrderby(keyOrExp)
            : keyOrExp(makeOrderby());
        if (order) {
            expr = expr[order]();
        }
        return (0, create_query_1.createQuery)(__assign(__assign({}, descriptor), { orderby: descriptor.orderby.concat(expr['_key']) }));
    };
}
exports.createOrderby = createOrderby;
//# sourceMappingURL=create-orderby.js.map