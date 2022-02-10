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
exports.createFilter = exports.makeExp = exports.dateToObject = exports.getFuncArgs = void 0;
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
function dateToObject(d) {
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
}
exports.dateToObject = dateToObject;
function makeExp(exp) {
    var _get = function (checkParetheses) {
        if (checkParetheses === void 0) { checkParetheses = false; }
        if (!checkParetheses) {
            return exp;
        }
        else if (exp.indexOf(' or ') > -1 || exp.indexOf(' and ') > -1) {
            return "(".concat(exp, ")");
        }
        else {
            return exp;
        }
    };
    return {
        _get: _get,
        not: function () { return makeExp("not (".concat(exp, ")")); },
        and: function (exp) { return makeExp("".concat(_get(), " and ").concat(exp._get(true))); },
        or: function (exp) { return makeExp("".concat(_get(), " or ").concat(exp._get(true))); },
    };
}
exports.makeExp = makeExp;
function filterBuilder(key) {
    var isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    var arrFuncBuilder = function (method) { return function (exp) {
        var arg = getFuncArgs(exp)[0];
        var builder = exp(makeFilter(arg));
        var expr = builder._get();
        return makeExp("".concat(key, "/").concat(method, "(").concat(arg, ": ").concat(expr, ")"));
    }; };
    var strFuncBuilder = function (method) { return function (s, opt) {
        if (opt === null || opt === void 0 ? void 0 : opt.caseInsensitive) {
            return makeExp("".concat(method, "(tolower(").concat(key, "), ").concat(typeof s == 'string'
                ? "'".concat(s.toLocaleLowerCase(), "'")
                : "tolower(".concat(s._key, ")"), ")"));
        }
        else if (s.getPropName) {
            return makeExp("".concat(method, "(").concat(key, ", ").concat(s._key, ")"));
        }
        else {
            return makeExp("".concat(method, "(").concat(key, ", ").concat(typeof s == 'string' ? "'".concat(s, "'") : s, ")"));
        }
    }; };
    var equalityBuilder = function (t) { return function (x, opt) {
        switch (typeof x) {
            case 'string':
                if (isGuid.test(x) && !(opt === null || opt === void 0 ? void 0 : opt.ignoreGuid)) {
                    return makeExp("".concat(key, " ").concat(t, " ").concat(x)); // no quote around ${x}
                }
                else if (opt === null || opt === void 0 ? void 0 : opt.caseInsensitive) {
                    return makeExp("tolower(".concat(key, ") ").concat(t, " '").concat(x.toLocaleLowerCase(), "'"));
                }
                else {
                    return makeExp("".concat(key, " ").concat(t, " '").concat(x, "'"));
                }
            case 'number':
                return makeExp("".concat(key, " ").concat(t, " ").concat(x));
            case 'boolean':
                return makeExp("".concat(key, " ").concat(t, " ").concat(x));
            default:
                if (x && (opt === null || opt === void 0 ? void 0 : opt.caseInsensitive)) {
                    return makeExp("tolower(".concat(key, ") ").concat(t, " tolower(").concat(x._key, ")"));
                }
                else {
                    return makeExp("".concat(key, " ").concat(t, " ").concat((x === null || x === void 0 ? void 0 : x._key) || null));
                }
        }
    }; };
    var dateComparison = function (compare) { return function (d) {
        if (typeof d === 'string')
            return makeExp("".concat(key, " ").concat(compare, " ").concat(d));
        else if (d instanceof Date)
            return makeExp("".concat(key, " ").concat(compare, " ").concat(d.toISOString()));
        else
            return makeExp("".concat(key, " ").concat(compare, " ").concat(d._key));
    }; };
    var numberComparison = function (compare) { return function (n) {
        return makeExp("".concat(key, " ").concat(compare, " ").concat(typeof n == 'number' ? n : n._key));
    }; };
    return {
        _key: key,
        /////////////////////
        // FilterBuilderDate
        inTimeSpan: function (y, m, d, h, mm) {
            var exps = ["year(".concat(key, ") eq ").concat(y)];
            if (m != undefined)
                exps.push("month(".concat(key, ") eq ").concat(m));
            if (d != undefined)
                exps.push("day(".concat(key, ") eq ").concat(d));
            if (h != undefined)
                exps.push("hour(".concat(key, ") eq ").concat(h));
            if (mm != undefined)
                exps.push("minute(".concat(key, ") eq ").concat(mm));
            return makeExp('(' + exps.join(') and (') + ')');
        },
        isSame: function (x, g) {
            if (typeof x === 'string') {
                return makeExp("".concat(key, " eq ").concat(x));
            }
            else if (typeof x === 'number') {
                return makeExp("".concat(g, "(").concat(key, ") eq ").concat(x));
            }
            else if (x instanceof Date) {
                if (g == null) {
                    return makeExp("".concat(key, " eq ").concat(x.toISOString()));
                }
                else {
                    var o = dateToObject(x);
                    return makeExp("".concat(g, "(").concat(key, ") eq ").concat(o[g]));
                }
            }
            else {
                return makeExp("".concat(g, "(").concat(key, ") eq ").concat(g, "(").concat(x._key, ")"));
            }
        },
        isAfter: dateComparison('gt'),
        isBefore: dateComparison('lt'),
        isAfterOrEqual: dateComparison('ge'),
        isBeforeOrEqual: dateComparison('le'),
        ////////////////
        // FilterBuilderArray
        empty: function () { return makeExp("not ".concat(key, "/any()")); },
        notEmpty: function () { return makeExp("".concat(key, "/any()")); },
        any: arrFuncBuilder('any'),
        all: arrFuncBuilder('all'),
        ///////////////////////
        // FilterBuilderString
        notNull: function () { return makeExp("".concat(key, " ne null")); },
        contains: strFuncBuilder('contains'),
        startsWith: strFuncBuilder('startswith'),
        endsWith: strFuncBuilder('endswith'),
        ///////////////////////
        // FilterBuilderNumber
        biggerThan: numberComparison('gt'),
        lessThan: numberComparison('lt'),
        biggerOrEqualThan: numberComparison('ge'),
        lessOrEqualThan: numberComparison('le'),
        ////////////////////////////////
        // FilterBuilder Generic Methods
        equals: equalityBuilder('eq'),
        notEquals: equalityBuilder('ne'),
        in: function (arr) {
            var list = arr
                .map(function (x) { return (typeof x === 'string' ? "'".concat(x, "'") : x); })
                .join(',');
            return makeExp("".concat(key, " in (").concat(list, ")"));
        },
    };
}
function makeFilter(prefix) {
    if (prefix === void 0) { prefix = ''; }
    return new Proxy({}, {
        get: function (_, prop) {
            var methods = filterBuilder(prefix);
            var key = prefix ? "".concat(prefix, "/").concat(String(prop)) : String(prop);
            return (methods === null || methods === void 0 ? void 0 : methods[prop]) ? methods[prop] : makeFilter(String(key));
        },
    });
}
function createFilter(descriptor) {
    return function (keyOrExp, exp) {
        var expr = typeof keyOrExp === 'string'
            ? exp(filterBuilder(keyOrExp))
            : keyOrExp(makeFilter());
        return (0, create_query_1.createQuery)(__assign(__assign({}, descriptor), { filters: descriptor.filters.concat(expr._get()) }));
    };
}
exports.createFilter = createFilter;
//# sourceMappingURL=create-filter.js.map