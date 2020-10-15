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
exports.createSelect = void 0;
var create_query_1 = require("./create-query");
function makeSelect(key) {
    if (key === void 0) { key = ''; }
    return new Proxy({}, {
        get: function (_, prop) {
            if (prop === '_key')
                return key.slice(1);
            return makeSelect(key + "/" + String(prop));
        },
    });
}
function createSelect(descriptor) {
    return function () {
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        var _keys = keys
            .map(function (keyOrExp) {
            if (typeof keyOrExp === 'function') {
                var exp = keyOrExp(makeSelect());
                return exp._key;
            }
            else {
                return String(keyOrExp);
            }
        })
            .filter(function (k, i, arr) { return arr.indexOf(k) === i; }); // unique
        return create_query_1.createQuery(__assign(__assign({}, descriptor), { select: _keys, expands: descriptor.expands.filter(function (e) {
                return _keys.some(function (k) { return e.key == String(k); });
            }) }));
    };
}
exports.createSelect = createSelect;
//# sourceMappingURL=create-select.js.map