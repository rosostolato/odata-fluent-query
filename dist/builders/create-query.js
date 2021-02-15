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
exports.createQuery = exports.createQueryDescriptor = void 0;
var create_filter_1 = require("./create-filter");
var create_groupby_1 = require("./create-groupby");
var create_orderby_1 = require("./create-orderby");
var create_select_1 = require("./create-select");
var query_builder_1 = require("./query-builder");
function createQueryDescriptor(key) {
    return {
        key: key,
        skip: undefined,
        take: undefined,
        count: false,
        strict: false,
        aggregator: undefined,
        filters: [],
        expands: [],
        orderby: [],
        groupby: [],
        select: [],
    };
}
exports.createQueryDescriptor = createQueryDescriptor;
function createQuery(descriptor) {
    return {
        _descriptor: descriptor,
        select: create_select_1.createSelect(descriptor),
        orderBy: create_orderby_1.createOrderby(descriptor),
        filter: create_filter_1.createFilter(descriptor),
        groupBy: create_groupby_1.createGroupby(descriptor),
        count: function () {
            return createQuery(__assign(__assign({}, descriptor), { count: true }));
        },
        paginate: function (sizeOrOptions, page) {
            var data;
            if (typeof sizeOrOptions === 'number') {
                data = {
                    page: page,
                    count: true,
                    pagesize: sizeOrOptions,
                };
            }
            else {
                data = sizeOrOptions;
                if (data.count === undefined) {
                    data.count = true;
                }
            }
            var queryDescriptor = __assign(__assign({}, descriptor), { take: data.pagesize, skip: data.pagesize * data.page, count: data.count });
            if (!queryDescriptor.skip) {
                queryDescriptor.skip = undefined;
            }
            return createQuery(queryDescriptor);
        },
        expand: function (key, query) {
            var expand = createQuery(createQueryDescriptor(key));
            var result = (query === null || query === void 0 ? void 0 : query(expand)) || expand;
            var newDescriptor = __assign(__assign({}, descriptor), { expands: descriptor.expands.concat(result._descriptor) });
            return createQuery(newDescriptor);
        },
        toString: function () {
            return query_builder_1.makeQuery(descriptor)
                .map(function (p) { return p.key + "=" + p.value; })
                .join('&');
        },
        toObject: function () {
            return query_builder_1.makeQuery(descriptor).reduce(function (obj, x) {
                obj[x.key] = x.value;
                return obj;
            }, {});
        },
    };
}
exports.createQuery = createQuery;
//# sourceMappingURL=create-query.js.map