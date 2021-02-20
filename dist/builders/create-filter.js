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
            return "(" + exp + ")";
        }
        else {
            return exp;
        }
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
    var arrFuncBuilder = function (method) { return function (exp) {
        var arg = getFuncArgs(exp)[0];
        var builder = exp(makeFilter(arg));
        var expr = builder._get();
        return makeExp(key + "/" + method + "(" + arg + ": " + expr + ")");
    }; };
    var strFuncBuilder = function (method) { return function (s, opt) {
        if (opt === null || opt === void 0 ? void 0 : opt.caseInsensitive) {
            return makeExp(method + "(tolower(" + key + "), " + (typeof s == 'string'
                ? "'" + s.toLocaleLowerCase() + "'"
                : "tolower(" + s._key + ")") + ")");
        }
        else if (s.getPropName) {
            return makeExp(method + "(" + key + ", " + s._key + ")");
        }
        else {
            return makeExp(method + "(" + key + ", " + (typeof s == 'string' ? "'" + s + "'" : s) + ")");
        }
    }; };
    var equalityBuilder = function (t) { return function (x, opt) {
        switch (typeof x) {
            case 'string':
                if (isGuid.test(x) && !(opt === null || opt === void 0 ? void 0 : opt.ignoreGuid)) {
                    return makeExp(key + " " + t + " " + x); // no quote around ${x}
                }
                else if (opt === null || opt === void 0 ? void 0 : opt.caseInsensitive) {
                    return makeExp("tolower(" + key + ") " + t + " '" + x.toLocaleLowerCase() + "'");
                }
                else {
                    return makeExp(key + " " + t + " '" + x + "'");
                }
            case 'number':
                return makeExp(key + " " + t + " " + x);
            case 'boolean':
                return makeExp(key + " " + t + " " + x);
            default:
                if (x && (opt === null || opt === void 0 ? void 0 : opt.caseInsensitive)) {
                    return makeExp("tolower(" + key + ") " + t + " tolower(" + x._key + ")");
                }
                else {
                    return makeExp(key + " " + t + " " + ((x === null || x === void 0 ? void 0 : x._key) || null));
                }
        }
    }; };
    var dateComparison = function (compare) { return function (d) {
        if (typeof d === 'string')
            return makeExp(key + " " + compare + " " + d);
        else if (d instanceof Date)
            return makeExp(key + " " + compare + " " + d.toISOString());
        else
            return makeExp(key + " " + compare + " " + d._key);
    }; };
    var numberComparison = function (compare) { return function (n) {
        return makeExp(key + " " + compare + " " + (typeof n == 'number' ? n : n._key));
    }; };
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
        isAfter: dateComparison('gt'),
        isBefore: dateComparison('lt'),
        isAfterOrEqual: dateComparison('ge'),
        isBeforeOrEqual: dateComparison('le'),
        ////////////////
        // FilterBuilderArray
        empty: function () { return makeExp("not " + key + "/any()"); },
        notEmpty: function () { return makeExp(key + "/any()"); },
        any: arrFuncBuilder('any'),
        all: arrFuncBuilder('all'),
        ///////////////////////
        // FilterBuilderString
        notNull: function () { return makeExp(key + " ne null"); },
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