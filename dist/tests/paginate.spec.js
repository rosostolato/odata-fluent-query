"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
describe('testing ODataQuery paginate', function () {
    it('paginate', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.paginate(10).toString();
        var expected = '$top=10&$count=true';
        expect(actual).toBe(expected);
    });
    it('paginate with skip', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.paginate(25, 5).toString();
        var expected = '$skip=125&$top=25&$count=true';
        expect(actual).toBe(expected);
    });
    it('paginate object', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.paginate({ pagesize: 10 }).toString();
        var expected = '$top=10&$count=true';
        expect(actual).toBe(expected);
    });
    it('paginate object with skip', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.paginate({ page: 5, pagesize: 25 }).toString();
        var expected = '$skip=125&$top=25&$count=true';
        expect(actual).toBe(expected);
    });
    it('paginate disable count', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .paginate({ page: 5, pagesize: 25, count: false })
            .toString();
        var expected = '$skip=125&$top=25';
        expect(actual).toBe(expected);
    });
});
//# sourceMappingURL=paginate.spec.js.map