"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var ComplexFilterExpresion = /** @class */ (function () {
    function ComplexFilterExpresion(exp) {
        var _this = this;
        this.exp = exp;
        this.kind = 'expr';
        this.not = function () { return exports.mk_exp("not (" + _this.exp + ")"); };
        this.and = function (exp) { return exports.mk_exp(_this.getFilterExpresion() + " and " + exp.getFilterExpresion(true)); };
        this.or = function (exp) { return exports.mk_exp(_this.getFilterExpresion() + " or " + exp.getFilterExpresion(true)); };
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
exports.mk_exp = function (exp) { return new ComplexFilterExpresion(exp); };
var nullBuilder = {
    getPropName: function () { return 'null'; }
};
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
            return exports.mk_exp('(' + exps.join(') and (') + ')');
        };
        this.isSame = function (x, g) {
            if (typeof x === 'string') {
                return exports.mk_exp(_this.prefix + " eq " + x);
            }
            else if (typeof x === 'number') {
                return exports.mk_exp(g + "(" + _this.prefix + ") eq " + x);
            }
            else if (x instanceof Date) {
                if (g == null) {
                    return exports.mk_exp(_this.prefix + " eq " + x.toISOString());
                }
                else {
                    var o = _this.dateToObject(x);
                    return exports.mk_exp(g + "(" + _this.prefix + ") eq " + o[g]);
                }
            }
            else {
                return exports.mk_exp(g + "(" + _this.prefix + ") eq " + g + "(" + x.getPropName() + ")");
            }
        };
        this.isAfter = function (d) {
            if (typeof d === 'string')
                return exports.mk_exp(_this.prefix + " gt " + d);
            else if (d instanceof Date)
                return exports.mk_exp(_this.prefix + " gt " + d.toISOString());
            else
                return exports.mk_exp(_this.prefix + " gt " + d.getPropName());
        };
        this.isBefore = function (d) {
            if (typeof d === 'string')
                return exports.mk_exp(_this.prefix + " lt " + d);
            else if (d instanceof Date)
                return exports.mk_exp(_this.prefix + " lt " + d.toISOString());
            else
                return exports.mk_exp(_this.prefix + " gt " + d.getPropName());
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
        this.empty = function () { return exports.mk_exp("not " + _this.prefix + "/any()"); };
        this.notEmpty = function () { return exports.mk_exp(_this.prefix + "/any()"); };
        this.any = function (exp) {
            var key = utils_1.get_param_key(exp);
            var props = utils_1.get_property_keys(exp);
            if (props.length) {
                var builder = exp(utils_1.mk_builder(props, FilterBuilder));
                var expr = builder.getFilterExpresion();
                return exports.mk_exp(_this.prefix + "/any(" + key + ":" + key + "/" + expr + ")");
            }
            else {
                var builder = exp(new FilterBuilder(key));
                var expr = builder.getFilterExpresion();
                return exports.mk_exp(_this.prefix + "/any(" + key + ":" + expr + ")");
            }
        };
        this.all = function (exp) {
            var key = utils_1.get_param_key(exp);
            var keys = utils_1.get_property_keys(exp);
            if (keys.length) {
                var builder = exp(utils_1.mk_builder(keys, FilterBuilder));
                var expr = builder.getFilterExpresion();
                return exports.mk_exp(_this.prefix + "/all(" + key + ":" + key + "/" + expr + ")");
            }
            else {
                var builder = exp(new FilterBuilder(key));
                var expr = builder.getFilterExpresion();
                return exports.mk_exp(_this.prefix + "/all(" + key + ":" + expr + ")");
            }
        };
        ///////////////////////
        // FilterBuilderString
        /** @deprecated use `notEquals(null)` instead */
        this.notNull = function () { return exports.mk_exp(_this.prefix + " ne null"); };
        this.contains = function (s, opt) {
            if (opt && opt.caseInsensitive) {
                return exports.mk_exp("contains(tolower(" + _this.prefix + "), " + (typeof s == 'string'
                    ? "'" + s.toLocaleLowerCase() + "'"
                    : "tolower(" + s.getPropName() + ")") + ")");
            }
            if (s.getPropName) {
                return exports.mk_exp("contains(" + _this.prefix + ", " + s.getPropName() + ")");
            }
            return exports.mk_exp("contains(" + _this.prefix + ", " + (typeof s == 'string' ? "'" + s + "'" : s) + ")");
        };
        this.startsWith = function (s, opt) {
            if (opt && opt.caseInsensitive) {
                return exports.mk_exp("startswith(tolower(" + _this.prefix + "), " + (typeof s == 'string'
                    ? "'" + s.toLocaleLowerCase() + "'"
                    : "tolower(" + s.getPropName() + ")") + ")");
            }
            return exports.mk_exp("startswith(" + _this.prefix + ", " + (typeof s == 'string' ? "'" + s + "'" : s.getPropName()) + ")");
        };
        this.endsWith = function (s, opt) {
            if (opt && opt.caseInsensitive) {
                return exports.mk_exp("endswith(tolower(" + _this.prefix + "), " + (typeof s == 'string'
                    ? "'" + s.toLocaleLowerCase() + "'"
                    : "tolower(" + s.getPropName() + ")") + ")");
            }
            return exports.mk_exp("endswith(" + _this.prefix + ", " + (typeof s == 'string' ? "'" + s + "'" : s.getPropName()) + ")");
        };
        ///////////////////////
        // FilterBuilderNumber
        this.biggerThan = function (n) { return exports.mk_exp(_this.prefix + " gt " + (typeof n == 'number'
            ? n
            : n.getPropName())); };
        this.lessThan = function (n) { return exports.mk_exp(_this.prefix + " lt " + (typeof n == 'number'
            ? n
            : n.getPropName())); };
        ////////////////////////////////
        // FilterBuilder Generic Methods
        this.equals = function (x, o) {
            switch (typeof x) {
                case 'string':
                    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x)) { // is a Guid?
                        return exports.mk_exp(_this.prefix + " eq " + x); // no quote around ${x}
                    }
                    if (o && o.caseInsensitive) {
                        return exports.mk_exp("tolower(" + _this.prefix + ") eq '" + x.toLocaleLowerCase() + "'");
                    }
                    return exports.mk_exp(_this.prefix + " eq '" + x + "'");
                case 'number':
                    return exports.mk_exp(_this.prefix + " eq " + x);
                case 'boolean':
                    return exports.mk_exp(_this.prefix + " eq " + x);
                default:
                    if (o && x && o.caseInsensitive) {
                        return exports.mk_exp("tolower(" + _this.prefix + ") eq tolower(" + x.getPropName() + ")");
                    }
                    return exports.mk_exp(_this.prefix + " eq " + (x || nullBuilder).getPropName());
            }
        };
        this.notEquals = function (x, o) {
            switch (typeof x) {
                case 'string':
                    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x)) { // is a Guid?
                        return exports.mk_exp(_this.prefix + " ne " + x); // no quote around ${x}
                    }
                    if (o && o.caseInsensitive) {
                        return exports.mk_exp("tolower(" + _this.prefix + ") ne '" + x.toLocaleLowerCase() + "'");
                    }
                    return exports.mk_exp(_this.prefix + " ne '" + x + "'");
                case 'number':
                    return exports.mk_exp(_this.prefix + " ne " + x);
                case 'boolean':
                    return exports.mk_exp(_this.prefix + " ne " + x);
                default:
                    if (o && o.caseInsensitive) {
                        return exports.mk_exp("tolower(" + _this.prefix + ") ne tolower(" + x.getPropName() + ")");
                    }
                    return exports.mk_exp(_this.prefix + " ne " + (x || nullBuilder).getPropName());
            }
        };
        this.in = function (arr) {
            var list = arr
                .map(function (x) { return typeof x === 'string' ? "'" + x + "'" : x; })
                .join(',');
            return exports.mk_exp(_this.prefix + " in (" + list + ")");
        };
    }
    return FilterBuilder;
}());
exports.FilterBuilder = FilterBuilder;
//# sourceMappingURL=filter-builder.js.map