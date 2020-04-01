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
var filterbuilder_1 = require("./filterbuilder");
var orderbyBuilder_1 = require("./orderbyBuilder");
var utils_1 = require("./utils");
/**
 * OData Query instance where T is the object that will be used on query
 */
var ODataQuery = /** @class */ (function () {
    function ODataQuery(key) {
        this.queryDescriptor = {
            key: key,
            skip: 'none',
            take: 'none',
            filters: [],
            expands: [],
            orderby: [],
            select: [],
            groupby: [],
            groupAgg: null,
            count: false
        };
    }
    /**
     * Adds a $select operator to the OData query.
     * There is only one instance of $select, if you call multiple times it will take the last one.
     *
     * @param keys the names of the properties you want to select.
     *
     * @example q.select('id', 'title').
     */
    ODataQuery.prototype.select = function () {
        var keys = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
        }
        this.queryDescriptor = __assign(__assign({}, this.queryDescriptor), { select: keys.map(String), expands: this.queryDescriptor.expands.filter(function (e) { return keys.some(function (k) { return e.key == String(k); }); }) });
        return this;
    };
    ODataQuery.prototype.filter = function (keyOrExp, exp) {
        var expr;
        if (typeof keyOrExp === 'string') {
            // run expression
            expr = exp(new filterbuilder_1.FilterBuilder(keyOrExp));
        }
        else {
            // set expression
            exp = keyOrExp;
            // read funciton string to retrieve keys
            var keys = utils_1.get_property_keys(exp);
            if (!keys || !keys.length) {
                throw new Error('Could not find property key.');
            }
            // run expression
            expr = exp(utils_1.mk_builder(keys, filterbuilder_1.FilterBuilder));
        }
        if (expr.kind == 'none') {
            return this;
        }
        // this.queryDescriptor = {
        //   ...this.queryDescriptor,
        //   filters: this.queryDescriptor.filters.push(expr.getFilterExpresion())
        // };
        this.queryDescriptor.filters.push(expr.getFilterExpresion());
        return this;
    };
    /**
     * Adds a $expand operator to the OData query.
     * Multiple calls to Expand will expand all the relations, e.g.: $expand=rel1(...),rel2(...).
     * The lambda in the second parameter allows you to build a complex inner query.
     *
     * @param key the name of the relation.
     * @param query a lambda expression that build the subquery from the querybuilder.
     *
     * @example q.exand('blogs', q => q.select('id', 'title')).
     */
    ODataQuery.prototype.expand = function (key, query) {
        var expand = new ODataQuery(String(key));
        if (query)
            expand = query(expand);
        // this.queryDescriptor = {
        //   ...this.queryDescriptor,
        //   expands: 
        // };
        this.queryDescriptor.expands.push(expand['queryDescriptor']);
        return this;
    };
    ODataQuery.prototype.orderBy = function (keyOrExp, order) {
        var orderby;
        if (typeof keyOrExp === 'string') {
            orderby = new orderbyBuilder_1.OrderByBuilder(keyOrExp);
            // run orderer
            if (order) {
                orderby = orderby[order]();
            }
            // get string
            orderby = orderby.get();
        }
        else {
            // read funciton string
            var keys = utils_1.get_property_keys(keyOrExp);
            if (!keys || !keys.length) {
                throw new Error('Could not find property key. Use the second overload of orderBy instead');
            }
            orderby = keyOrExp(utils_1.mk_builder(keys, orderbyBuilder_1.OrderByBuilder)).get();
        }
        this.queryDescriptor = __assign(__assign({}, this.queryDescriptor), { orderby: this.queryDescriptor.orderby.concat(orderby) });
        return this;
    };
    ODataQuery.prototype.paginate = function (options, page) {
        var data;
        if (typeof options === 'number') {
            data = {
                pagesize: options,
                page: page,
                count: true
            };
        }
        else {
            data = options;
            if (data.count === undefined) {
                data.count = true;
            }
        }
        this.queryDescriptor = __assign(__assign({}, this.queryDescriptor), { take: data.pagesize, skip: data.pagesize * data.page, count: data.count });
        if (!this.queryDescriptor.skip) {
            this.queryDescriptor.skip = 'none';
        }
        return this;
    };
    /**
     * set $count=true
     */
    ODataQuery.prototype.count = function () {
        this.queryDescriptor = __assign(__assign({}, this.queryDescriptor), { count: true });
        return this;
    };
    ODataQuery.prototype.groupBy = function (keys, aggregate) {
        this.queryDescriptor = __assign(__assign({}, this.queryDescriptor), { groupby: keys.map(String), groupAgg: aggregate });
        return this;
    };
    /**
     * exports query to string
     */
    ODataQuery.prototype.toString = function () {
        return utils_1.mk_query_string(this.queryDescriptor);
    };
    return ODataQuery;
}());
exports.ODataQuery = ODataQuery;
/**
 * OData Query instance where T is the object that will be used on query
 * @deprecated use 'ODataQuery' instead
 */
var OQuery = /** @class */ (function (_super) {
    __extends(OQuery, _super);
    function OQuery() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OQuery;
}(ODataQuery));
exports.OQuery = OQuery;
//# sourceMappingURL=odataquery.js.map