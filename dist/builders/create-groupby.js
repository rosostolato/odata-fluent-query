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
exports.createGroupby = exports.groupbyBuilder = void 0;
var create_query_1 = require("./create-query");
function groupbyBuilder(aggregator) {
    if (aggregator === void 0) { aggregator = []; }
    var custom = function (prop, aggreg, as) {
        return groupbyBuilder(aggregator.concat("".concat(prop, " with ").concat(aggreg, " as ").concat(as)));
    };
    return {
        aggregator: aggregator,
        sum: function (prop, as) {
            return custom(prop, 'sum', as);
        },
        min: function (prop, as) {
            return custom(prop, 'min', as);
        },
        max: function (prop, as) {
            return custom(prop, 'max', as);
        },
        average: function (prop, as) {
            return custom(prop, 'average', as);
        },
        countdistinct: function (prop, as) {
            return custom(prop, 'countdistinct', as);
        },
        custom: custom,
    };
}
exports.groupbyBuilder = groupbyBuilder;
function createGroupby(descriptor) {
    return function (keys, aggregate) {
        var agg = groupbyBuilder();
        var result = (aggregate === null || aggregate === void 0 ? void 0 : aggregate(agg)) || agg;
        return (0, create_query_1.createQuery)(__assign(__assign({}, descriptor), { groupby: keys.map(String), aggregator: result.aggregator.join(', ') || null }));
    };
}
exports.createGroupby = createGroupby;
//# sourceMappingURL=create-groupby.js.map