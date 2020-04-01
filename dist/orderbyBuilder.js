"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OrderByBuilder = /** @class */ (function () {
    function OrderByBuilder(key) {
        var _this = this;
        this.key = key;
        this.get = function () { return _this.key; };
    }
    OrderByBuilder.prototype.asc = function () {
        return new OrderByBuilder(this.key + ' asc');
    };
    OrderByBuilder.prototype.desc = function () {
        return new OrderByBuilder(this.key + ' desc');
    };
    return OrderByBuilder;
}());
exports.OrderByBuilder = OrderByBuilder;
//# sourceMappingURL=orderbyBuilder.js.map