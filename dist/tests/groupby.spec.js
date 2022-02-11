"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
describe('testing ODataQuery groupBy', function () {
    it('groupBy', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.groupBy(['mail']).toString();
        var expected = '$apply=groupby((mail))';
        expect(actual).toBe(expected);
    });
    it('groupBy multiple', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.groupBy(['mail', 'surname']).toString();
        var expected = '$apply=groupby((mail, surname))';
        expect(actual).toBe(expected);
    });
    it('groupBy aggregate', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .groupBy(['mail', 'surname'], function (a) { return a.countdistinct('id', 'all'); })
            .toString();
        var expected = '$apply=groupby((mail, surname), aggregate(id with countdistinct as all))';
        expect(actual).toBe(expected);
    });
    it('groupBy aggregate multiple', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .groupBy(['mail', 'surname'], function (a) {
            return a.countdistinct('id', 'all').max('phoneNumbers', 'test');
        })
            .toString();
        var expected = '$apply=groupby((mail, surname), aggregate(id with countdistinct as all, phoneNumbers with max as test))';
        expect(actual).toBe(expected);
    });
});
//# sourceMappingURL=groupby.spec.js.map