"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
describe('testing ODataQuery expand', function () {
    // one2one relation
    it('expand', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.expand('address').toString();
        var expected = '$expand=address';
        expect(actual).toBe(expected);
    });
    it('expand and select', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.expand('address', function (q) { return q.select('code'); }).toString();
        var expected = '$expand=address($select=code)';
        expect(actual).toBe(expected);
    });
    it('expand and select optional', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.expand('address2', function (q) { return q.select('code'); }).toString();
        var expected = '$expand=address2($select=code)';
        expect(actual).toBe(expected);
    });
    it('expand twice', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .expand('address', function (q) { return q.expand('user', function (q) { return q.select('id'); }); })
            .toString();
        var expected = '$expand=address($expand=user($select=id))';
        expect(actual).toBe(expected);
    });
    // one2many relation
    it('expand and filter', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .expand('posts', function (e) { return e.filter(function (q) { return q.content.startsWith('test'); }); })
            .toString();
        var expected = "$expand=posts($filter=startswith(content, 'test'))";
        expect(actual).toBe(expected);
    });
    it('expand and filter composed', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .expand('posts', function (e) {
            return e.filter(function (q) { return q.content.startsWith('test').or(q.id.biggerThan(5)); });
        })
            .toString();
        var expected = "$expand=posts($filter=startswith(content, 'test') or id gt 5)";
        expect(actual).toBe(expected);
    });
    it('expand and filter composed multiline', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .expand('posts', function (e) {
            return e
                .filter(function (q) { return q.content.startsWith('test').or(q.id.biggerThan(5)); })
                .filter(function (q) { return q.id.lessThan(10); });
        })
            .toString();
        var expected = "$expand=posts($filter=(startswith(content, 'test') or id gt 5) and id lt 10)";
        expect(actual).toBe(expected);
    });
    it('expand and orderby', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .expand('posts', function (e) { return e.orderBy(function (q) { return q.id.desc(); }); })
            .toString();
        var expected = '$expand=posts($orderby=id desc)';
        expect(actual).toBe(expected);
    });
    it('expand and paginate', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.expand('posts', function (e) { return e.paginate(0); }).toString();
        var expected = '$expand=posts($top=0;$count=true)';
        expect(actual).toBe(expected);
    });
    it('expand and paginate object', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .expand('posts', function (e) {
            return e.paginate({
                page: 5,
                pagesize: 10,
                count: false,
            });
        })
            .toString();
        var expected = '$expand=posts($skip=50;$top=10)';
        expect(actual).toBe(expected);
    });
});
//# sourceMappingURL=expand.spec.js.map