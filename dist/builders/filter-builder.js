"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterBuilder = exports.ComplexFilterExpresion = exports.mk_builder = void 0;
// maker functions
var nullBuilder = {
    getPropName: function () { return 'null'; },
};
var mk_exp = function (exp) { return new ComplexFilterExpresion(exp); };
var get_param_key = function (exp) { var _a; return (_a = new RegExp(/(return *|=> *?)([a-zA-Z0-9_\$]+)/).exec(exp.toString())) === null || _a === void 0 ? void 0 : _a[2]; };
var get_property_keys = function (exp) {
    var funcStr = exp.toString();
    // key name used in expression
    var key = get_param_key(exp);
    var match;
    var keys = [];
    var regex = new RegExp(key + '\\s*(\\.[a-zA-Z_0-9\\$]+)+\\b(?!\\()');
    // gets all properties of the used key
    while ((match = regex.exec(funcStr))) {
        funcStr = funcStr.replace(regex, '');
        keys.push(match[0].slice(key === null || key === void 0 ? void 0 : key.length).trim().slice(1));
    }
    // return matched keys
    return keys;
};
function mk_builder(keys, builderType) {
    var set = function (obj, path, value) {
        if (Object(obj) !== obj)
            return obj;
        if (!Array.isArray(path))
            path = path.toString().match(/[^.[\]]+/g) || [];
        path
            .slice(0, -1)
            .reduce(function (a, c, i) {
            return Object(a[c]) === a[c]
                ? a[c]
                : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {});
        }, obj)[path[path.length - 1]] = value;
        return obj;
    };
    var builder = {};
    keys.forEach(function (k) { return set(builder, k, new builderType(k.split('.').join('/'))); });
    return builder;
}
exports.mk_builder = mk_builder;
// builders
var ComplexFilterExpresion = /** @class */ (function () {
    function ComplexFilterExpresion(exp) {
        var _this = this;
        this.exp = exp;
        this.kind = 'expr';
        this.not = function () { return mk_exp("not (" + _this.exp + ")"); };
        this.and = function (exp) {
            return mk_exp(_this.getFilterExpresion() + " and " + exp.getFilterExpresion(true));
        };
        this.or = function (exp) {
            return mk_exp(_this.getFilterExpresion() + " or " + exp.getFilterExpresion(true));
        };
    }
    ComplexFilterExpresion.prototype.getFilterExpresion = function (checkParetheses) {
        if (checkParetheses === void 0) { checkParetheses = false; }
        if (!checkParetheses)
            return this.exp;
        if (this.exp.indexOf(' or ') > -1 || this.exp.indexOf(' and ') > -1) {
            return "(" + this.exp + ")";
        }
        return this.exp;
    };
    return ComplexFilterExpresion;
}());
exports.ComplexFilterExpresion = ComplexFilterExpresion;
var FilterBuilder = /** @class */ (function () {
    function FilterBuilder(prefix) {
        var _this = this;
        this.prefix = prefix;
        this.getPropName = function () { return _this.prefix; };
        /////////////////////
        // FilterBuilderDate
        this.inTimeSpan = function (y, m, d, h, mm) {
            var exps = ["year(" + _this.prefix + ") eq " + y];
            if (m != undefined)
                exps.push("month(" + _this.prefix + ") eq " + m);
            if (d != undefined)
                exps.push("day(" + _this.prefix + ") eq " + d);
            if (h != undefined)
                exps.push("hour(" + _this.prefix + ") eq " + h);
            if (mm != undefined)
                exps.push("minute(" + _this.prefix + ") eq " + mm);
            return mk_exp('(' + exps.join(') and (') + ')');
        };
        this.isSame = function (x, g) {
            if (typeof x === 'string') {
                return mk_exp(_this.prefix + " eq " + x);
            }
            else if (typeof x === 'number') {
                return mk_exp(g + "(" + _this.prefix + ") eq " + x);
            }
            else if (x instanceof Date) {
                if (g == null) {
                    return mk_exp(_this.prefix + " eq " + x.toISOString());
                }
                else {
                    var o = _this.dateToObject(x);
                    return mk_exp(g + "(" + _this.prefix + ") eq " + o[g]);
                }
            }
            else {
                return mk_exp(g + "(" + _this.prefix + ") eq " + g + "(" + x.getPropName() + ")");
            }
        };
        this.isAfter = function (d) {
            if (typeof d === 'string')
                return mk_exp(_this.prefix + " gt " + d);
            else if (d instanceof Date)
                return mk_exp(_this.prefix + " gt " + d.toISOString());
            else
                return mk_exp(_this.prefix + " gt " + d.getPropName());
        };
        this.isBefore = function (d) {
            if (typeof d === 'string')
                return mk_exp(_this.prefix + " lt " + d);
            else if (d instanceof Date)
                return mk_exp(_this.prefix + " lt " + d.toISOString());
            else
                return mk_exp(_this.prefix + " gt " + d.getPropName());
        };
        this.dateToObject = function (d) {
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
        ////////////////
        // FilterBuilderArray
        this.empty = function () { return mk_exp("not " + _this.prefix + "/any()"); };
        this.notEmpty = function () { return mk_exp(_this.prefix + "/any()"); };
        this.any = function (exp) {
            var key = get_param_key(exp);
            var props = get_property_keys(exp);
            if (!key) {
                throw new Error('lambda key was not found!');
            }
            if (props.length) {
                var builder = exp(mk_builder(props, FilterBuilder));
                var expr = builder.getFilterExpresion();
                return mk_exp(_this.prefix + "/any(" + key + ":" + key + "/" + expr + ")");
            }
            else {
                var builder = exp(new FilterBuilder(key));
                var expr = builder.getFilterExpresion();
                return mk_exp(_this.prefix + "/any(" + key + ":" + expr + ")");
            }
        };
        this.all = function (exp) {
            var key = get_param_key(exp);
            var keys = get_property_keys(exp);
            if (!key) {
                throw new Error('lambda key was not found!');
            }
            if (keys.length) {
                var builder = exp(mk_builder(keys, FilterBuilder));
                var expr = builder.getFilterExpresion();
                return mk_exp(_this.prefix + "/all(" + key + ":" + key + "/" + expr + ")");
            }
            else {
                var builder = exp(new FilterBuilder(key));
                var expr = builder.getFilterExpresion();
                return mk_exp(_this.prefix + "/all(" + key + ":" + expr + ")");
            }
        };
        ///////////////////////
        // FilterBuilderString
        this.notNull = function () { return mk_exp(_this.prefix + " ne null"); };
        this.contains = function (s, opt) {
            if (opt && opt.caseInsensitive) {
                return mk_exp("contains(tolower(" + _this.prefix + "), " + (typeof s == 'string'
                    ? "'" + s.toLocaleLowerCase() + "'"
                    : "tolower(" + s.getPropName() + ")") + ")");
            }
            if (s.getPropName) {
                return mk_exp("contains(" + _this.prefix + ", " + s.getPropName() + ")");
            }
            return mk_exp("contains(" + _this.prefix + ", " + (typeof s == 'string' ? "'" + s + "'" : s) + ")");
        };
        this.startsWith = function (s, opt) {
            if (opt && opt.caseInsensitive) {
                return mk_exp("startswith(tolower(" + _this.prefix + "), " + (typeof s == 'string'
                    ? "'" + s.toLocaleLowerCase() + "'"
                    : "tolower(" + s.getPropName() + ")") + ")");
            }
            return mk_exp("startswith(" + _this.prefix + ", " + (typeof s == 'string' ? "'" + s + "'" : s.getPropName()) + ")");
        };
        this.endsWith = function (s, opt) {
            if (opt && opt.caseInsensitive) {
                return mk_exp("endswith(tolower(" + _this.prefix + "), " + (typeof s == 'string'
                    ? "'" + s.toLocaleLowerCase() + "'"
                    : "tolower(" + s.getPropName() + ")") + ")");
            }
            return mk_exp("endswith(" + _this.prefix + ", " + (typeof s == 'string' ? "'" + s + "'" : s.getPropName()) + ")");
        };
        ///////////////////////
        // FilterBuilderNumber
        this.biggerThan = function (n) {
            return mk_exp(_this.prefix + " gt " + (typeof n == 'number' ? n : n.getPropName()));
        };
        this.lessThan = function (n) {
            return mk_exp(_this.prefix + " lt " + (typeof n == 'number' ? n : n.getPropName()));
        };
        ////////////////////////////////
        // FilterBuilder Generic Methods
        this.equals = function (x, o) {
            switch (typeof x) {
                case 'string':
                    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x)) {
                        // is a Guid?
                        return mk_exp(_this.prefix + " eq " + x); // no quote around ${x}
                    }
                    if (o && o.caseInsensitive) {
                        return mk_exp("tolower(" + _this.prefix + ") eq '" + x.toLocaleLowerCase() + "'");
                    }
                    return mk_exp(_this.prefix + " eq '" + x + "'");
                case 'number':
                    return mk_exp(_this.prefix + " eq " + x);
                case 'boolean':
                    return mk_exp(_this.prefix + " eq " + x);
                default:
                    if (o && x && o.caseInsensitive) {
                        return mk_exp("tolower(" + _this.prefix + ") eq tolower(" + x.getPropName() + ")");
                    }
                    return mk_exp(_this.prefix + " eq " + (x || nullBuilder).getPropName());
            }
        };
        this.notEquals = function (x, o) {
            switch (typeof x) {
                case 'string':
                    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x)) {
                        // is a Guid?
                        return mk_exp(_this.prefix + " ne " + x); // no quote around ${x}
                    }
                    if (o && o.caseInsensitive) {
                        return mk_exp("tolower(" + _this.prefix + ") ne '" + x.toLocaleLowerCase() + "'");
                    }
                    return mk_exp(_this.prefix + " ne '" + x + "'");
                case 'number':
                    return mk_exp(_this.prefix + " ne " + x);
                case 'boolean':
                    return mk_exp(_this.prefix + " ne " + x);
                default:
                    if (o && o.caseInsensitive) {
                        return mk_exp("tolower(" + _this.prefix + ") ne tolower(" + x.getPropName() + ")");
                    }
                    return mk_exp(_this.prefix + " ne " + (x || nullBuilder).getPropName());
            }
        };
        this.in = function (arr) {
            var list = arr.map(function (x) { return (typeof x === 'string' ? "'" + x + "'" : x); }).join(',');
            return mk_exp(_this.prefix + " in (" + list + ")");
        };
    }
    return FilterBuilder;
}());
exports.FilterBuilder = FilterBuilder;
//# sourceMappingURL=filter-builder.js.map