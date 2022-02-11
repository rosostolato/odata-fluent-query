"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
describe('testing odataQuery select', function () {
    it('select one', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.select('id').toString();
        var expected = '$select=id';
        expect(actual).toBe(expected);
    });
    it('select multiple', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.select('id', 'mail', 'surname').toString();
        var expected = '$select=id,mail,surname';
        expect(actual).toBe(expected);
    });
    it('select with expression', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .select(function (x) { return x.id; }, function (x) { return x.address.street; })
            .toString();
        var expected = '$select=id,address/street';
        expect(actual).toBe(expected);
    });
    it('select mixed', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .select('id', function (x) { return x.givenName; }, 'accountEnabled')
            .toString();
        var expected = '$select=id,givenName,accountEnabled';
        expect(actual).toBe(expected);
    });
    it('select optional', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .select(function (x) { return x.givenName; }, function (x) { return x.surname; })
            .toString();
        var expected = '$select=givenName,surname';
        expect(actual).toBe(expected);
    });
});
//# sourceMappingURL=select.spec.js.map