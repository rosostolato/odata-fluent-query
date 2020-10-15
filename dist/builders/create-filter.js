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
exports.createFilter = exports.makeExp = exports.getFuncArgs = void 0;
var create_query_1 = require("./create-query");
function getFuncArgs(func) {
    return (func + '')
        .replace(/[/][/].*$/gm, '') // strip single-line comments
        .replace(/\s+/g, '') // strip white space
        .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments
        .split('){', 1)[0]
        .replace(/^[^(]*[(]/, '') // extract the parameters
        .replace(/=[^,]+/g, '') // strip any ES6 defaults
        .split(',')
        .filter(Boolean); // split & filter [""]
}
exports.getFuncArgs = getFuncArgs;
function makeExp(exp) {
    var _get = function (checkParetheses) {
        if (checkParetheses === void 0) { checkParetheses = false; }
        if (!checkParetheses)
            return exp;
        if (exp.indexOf(' or ') > -1 || exp.indexOf(' and ') > -1) {
            return "(" + exp + ")";
        }
        return exp;
    };
    return {
        _get: _get,
        not: function () { return makeExp("not (" + exp + ")"); },
        and: function (exp) { return makeExp(_get() + " and " + exp._get(true)); },
        or: function (exp) { return makeExp(_get() + " or " + exp._get(true)); },
    };
}
exports.makeExp = makeExp;
function filterBuilder(key) {
    var isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    var arrFuncBuilder = function (method, exp) {
        var arg = getFuncArgs(exp)[0];
        var builder = exp(makeFilter(arg));
        var expr = builder._get();
        return makeExp(key + "/" + method + "(" + arg + ": " + expr + ")");
    };
    var strFuncBuilder = function (method, s, opt) {
        if (opt === null || opt === void 0 ? void 0 : opt.caseInsensitive) {
            return makeExp(method + "(tolower(" + key + "), " + (typeof s == 'string'
                ? "'" + s.toLocaleLowerCase() + "'"
                : "tolower(" + s._key + ")") + ")");
        }
        if (s.getPropName) {
            return makeExp(method + "(" + key + ", " + s._key + ")");
        }
        return makeExp(method + "(" + key + ", " + (typeof s == 'string' ? "'" + s + "'" : s) + ")");
    };
    var equalityBuilder = function (t, x, opt) {
        switch (typeof x) {
            case 'string':
                if (isGuid.test(x)) {
                    return makeExp(key + " " + t + " " + x); // no quote around ${x}
                }
                if (opt === null || opt === void 0 ? void 0 : opt.caseInsensitive) {
                    return makeExp("tolower(" + key + ") " + t + " '" + x.toLocaleLowerCase() + "'");
                }
                return makeExp(key + " " + t + " '" + x + "'");
            case 'number':
                return makeExp(key + " " + t + " " + x);
            case 'boolean':
                return makeExp(key + " " + t + " " + x);
            default:
                if (x && (opt === null || opt === void 0 ? void 0 : opt.caseInsensitive)) {
                    return makeExp("tolower(" + key + ") " + t + " tolower(" + x._key + ")");
                }
                return makeExp(key + " " + t + " " + ((x === null || x === void 0 ? void 0 : x._key) || null));
        }
    };
    var dateToObject = function (d) {
        if (typeof d === 'string') {
            d = new Date(d);
        }
        return {
            year: d.getFullYear(),
            month: d.getMonth(),
            day: d.getFullYear(),
            hour: d.getFullYear(),
            minute: d.getFullYear(),
            second: d.getFullYear(),
        };
    };
    return {
        _key: key,
        /////////////////////
        // FilterBuilderDate
        inTimeSpan: function (y, m, d, h, mm) {
            var exps = ["year(" + key + ") eq " + y];
            if (m != undefined)
                exps.push("month(" + key + ") eq " + m);
            if (d != undefined)
                exps.push("day(" + key + ") eq " + d);
            if (h != undefined)
                exps.push("hour(" + key + ") eq " + h);
            if (mm != undefined)
                exps.push("minute(" + key + ") eq " + mm);
            return makeExp('(' + exps.join(') and (') + ')');
        },
        isSame: function (x, g) {
            if (typeof x === 'string') {
                return makeExp(key + " eq " + x);
            }
            else if (typeof x === 'number') {
                return makeExp(g + "(" + key + ") eq " + x);
            }
            else if (x instanceof Date) {
                if (g == null) {
                    return makeExp(key + " eq " + x.toISOString());
                }
                else {
                    var o = dateToObject(x);
                    return makeExp(g + "(" + key + ") eq " + o[g]);
                }
            }
            else {
                return makeExp(g + "(" + key + ") eq " + g + "(" + x._key + ")");
            }
        },
        isAfter: function (d) {
            if (typeof d === 'string')
                return makeExp(key + " gt " + d);
            else if (d instanceof Date)
                return makeExp(key + " gt " + d.toISOString());
            else
                return makeExp(key + " gt " + d._key);
        },
        isBefore: function (d) {
            if (typeof d === 'string')
                return makeExp(key + " lt " + d);
            else if (d instanceof Date)
                return makeExp(key + " lt " + d.toISOString());
            else
                return makeExp(key + " gt " + d._key);
        },
        ////////////////
        // FilterBuilderArray
        empty: function () { return makeExp("not " + key + "/any()"); },
        notEmpty: function () { return makeExp(key + "/any()"); },
        any: function (exp) { return arrFuncBuilder('any', exp); },
        all: function (exp) { return arrFuncBuilder('all', exp); },
        ///////////////////////
        // FilterBuilderString
        notNull: function () { return makeExp(key + " ne null"); },
        contains: function (s, opt) {
            return strFuncBuilder('contains', s, opt);
        },
        startsWith: function (s, opt) {
            return strFuncBuilder('startswith', s, opt);
        },
        endsWith: function (s, opt) {
            return strFuncBuilder('endswith', s, opt);
        },
        ///////////////////////
        // FilterBuilderNumber
        biggerThan: function (n) {
            return makeExp(key + " gt " + (typeof n == 'number' ? n : n._key));
        },
        lessThan: function (n) {
            return makeExp(key + " lt " + (typeof n == 'number' ? n : n._key));
        },
        ////////////////////////////////
        // FilterBuilder Generic Methods
        equals: function (x, opt) { return equalityBuilder('eq', x, opt); },
        notEquals: function (x, opt) { return equalityBuilder('ne', x, opt); },
        in: function (arr) {
            var list = arr
                .map(function (x) { return (typeof x === 'string' ? "'" + x + "'" : x); })
                .join(',');
            return makeExp(key + " in (" + list + ")");
        },
    };
}
function makeFilter(prefix) {
    if (prefix === void 0) { prefix = ''; }
    return new Proxy({}, {
        get: function (_, prop) {
            var methods = filterBuilder(prefix);
            var key = prefix ? prefix + "/" + String(prop) : String(prop);
            return (methods === null || methods === void 0 ? void 0 : methods[prop]) ? methods[prop] : makeFilter(String(key));
        },
    });
}
function createFilter(descriptor) {
    return function (keyOrExp, exp) {
        var expr = typeof keyOrExp === 'string'
            ? exp(filterBuilder(keyOrExp))
            : keyOrExp(makeFilter());
        return create_query_1.createQuery(__assign(__assign({}, descriptor), { filters: descriptor.filters.concat(expr._get()) }));
    };
}
exports.createFilter = createFilter;
//# sourceMappingURL=create-filter.js.map