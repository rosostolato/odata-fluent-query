"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GroupbyBuilder = /** @class */ (function () {
    function GroupbyBuilder() {
        this.groupAgg = [];
    }
    GroupbyBuilder.prototype.sum = function (prop, as) {
        return this.custom(prop, 'sum', as);
    };
    GroupbyBuilder.prototype.min = function (prop, as) {
        return this.custom(prop, 'min', as);
    };
    GroupbyBuilder.prototype.max = function (prop, as) {
        return this.custom(prop, 'max', as);
    };
    GroupbyBuilder.prototype.average = function (prop, as) {
        return this.custom(prop, 'average', as);
    };
    GroupbyBuilder.prototype.countdistinct = function (prop, as) {
        return this.custom(prop, 'countdistinct', as);
    };
    GroupbyBuilder.prototype.custom = function (prop, aggregator, as) {
        var agg = prop + " with " + aggregator + " as " + as;
        this.groupAgg.push(agg);
        return this;
    };
    return GroupbyBuilder;
}());
exports.GroupbyBuilder = GroupbyBuilder;
//# sourceMappingURL=groupby-builder.js.map