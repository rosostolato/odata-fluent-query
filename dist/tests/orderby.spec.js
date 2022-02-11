"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
describe('testing ODataQuery orderby', function () {
    it('orderby', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.orderBy(function (q) { return q.mail; }).toString();
        var expected = '$orderby=mail';
        expect(actual).toBe(expected);
    });
    it('orderby alt', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.orderBy('mail').toString();
        var expected = '$orderby=mail';
        expect(actual).toBe(expected);
    });
    it('orderby asc', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.orderBy(function (q) { return q.mail.asc(); }).toString();
        var expected = '$orderby=mail asc';
        expect(actual).toBe(expected);
    });
    it('orderby asc alt', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.orderBy('mail', 'asc').toString();
        var expected = '$orderby=mail asc';
        expect(actual).toBe(expected);
    });
    it('orderby desc', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.orderBy(function (q) { return q.mail.desc(); }).toString();
        var expected = '$orderby=mail desc';
        expect(actual).toBe(expected);
    });
    it('orderby desc alt', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.orderBy('mail', 'desc').toString();
        var expected = '$orderby=mail desc';
        expect(actual).toBe(expected);
    });
    it('orderby nested', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.orderBy(function (q) { return q.address.street; }).toString();
        var expected = '$orderby=address/street';
        expect(actual).toBe(expected);
    });
    it('orderby nested array', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.orderBy(function (q) { return q.posts.id; }).toString();
        var expected = '$orderby=posts/id';
        expect(actual).toBe(expected);
    });
    it('orderby multiple', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .orderBy(function (q) { return q.address.street.asc(); })
            .orderBy(function (q) { return q.address2.street.desc(); })
            .toString();
        var expected = '$orderby=address/street asc, address2/street desc';
        expect(actual).toBe(expected);
    });
});
//# sourceMappingURL=orderby.spec.js.map