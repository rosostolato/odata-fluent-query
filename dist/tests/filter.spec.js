"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("../src");
// string
describe('testodataQuery filter by string', function () {
    it('contains', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.mail.contains('test'); }).toString();
        var expected = "$filter=contains(mail, 'test')";
        expect(actual).toBe(expected);
    });
    it('contains caseInsensitive', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.mail.contains('test', { caseInsensitive: true }); })
            .toString();
        var expected = "$filter=contains(tolower(mail), 'test')";
        expect(actual).toBe(expected);
    });
    it('endsWith', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.mail.endsWith('test'); }).toString();
        var expected = "$filter=endswith(mail, 'test')";
        expect(actual).toBe(expected);
    });
    it('endsWith caseInsensitive', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.mail.endsWith('test', { caseInsensitive: true }); })
            .toString();
        var expected = "$filter=endswith(tolower(mail), 'test')";
        expect(actual).toBe(expected);
    });
    it('equals', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.mail.equals('test'); }).toString();
        var expected = "$filter=mail eq 'test'";
        expect(actual).toBe(expected);
    });
    it('equals caseInsensitive', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.mail.equals('test', { caseInsensitive: true }); })
            .toString();
        var expected = "$filter=tolower(mail) eq 'test'";
        expect(actual).toBe(expected);
    });
    it('notEquals', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.mail.notEquals('test'); }).toString();
        var expected = "$filter=mail ne 'test'";
        expect(actual).toBe(expected);
    });
    it('not equals caseInsensitive', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.mail.notEquals('test', { caseInsensitive: true }); })
            .toString();
        var expected = "$filter=tolower(mail) ne 'test'";
        expect(actual).toBe(expected);
    });
    it('equals null', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.mail.equals(null); }).toString();
        var expected = '$filter=mail eq null';
        expect(actual).toBe(expected);
    });
    it('notEquals null', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.mail.notEquals(null); }).toString();
        var expected = '$filter=mail ne null';
        expect(actual).toBe(expected);
    });
    it('startsWith', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.mail.startsWith('test'); }).toString();
        var expected = "$filter=startswith(mail, 'test')";
        expect(actual).toBe(expected);
    });
    it('startsWith caseInsensitive', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.mail.startsWith('test', { caseInsensitive: true }); })
            .toString();
        var expected = "$filter=startswith(tolower(mail), 'test')";
        expect(actual).toBe(expected);
    });
    it('string in array', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.givenName.in(['foo', 'bar']); }).toString();
        var expected = "$filter=givenName in ('foo','bar')";
        expect(actual).toBe(expected);
    });
});
// guid
describe('testodataQuery filter by guid', function () {
    it('equals', function () {
        var query = (0, src_1.odataQuery)();
        var guid = '003b63b4-e0b0-40db-8d5f-fb388bf0eabc';
        var actual = query.filter(function (q) { return q.mail.equals(guid); }).toString();
        var expected = '$filter=mail eq ' + guid;
        expect(actual).toBe(expected);
    });
    it('notEquals', function () {
        var query = (0, src_1.odataQuery)();
        var guid = '003b63b4-e0b0-40db-8d5f-fb388bf0eabc';
        var actual = query.filter(function (q) { return q.mail.notEquals(guid); }).toString();
        var expected = '$filter=mail ne ' + guid;
        expect(actual).toBe(expected);
    });
    it('guid as string', function () {
        var query = (0, src_1.odataQuery)();
        var guid = '003b63b4-e0b0-40db-8d5f-fb388bf0eabc';
        var actual = query
            .filter(function (q) { return q.mail.equals(guid, { ignoreGuid: true }); })
            .toString();
        var expected = "$filter=mail eq '".concat(guid, "'");
        expect(actual).toBe(expected);
    });
});
// number
describe('testodataQuery filter by number', function () {
    it('biggerThan', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.id.biggerThan(5); }).toString();
        var expected = '$filter=id gt 5';
        expect(actual).toBe(expected);
    });
    it('lessThan', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.id.lessThan(5); }).toString();
        var expected = '$filter=id lt 5';
        expect(actual).toBe(expected);
    });
    it('biggerOrEqualThan', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.id.biggerOrEqualThan(5); }).toString();
        var expected = '$filter=id ge 5';
        expect(actual).toBe(expected);
    });
    it('lessOrEqualThan', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.id.lessOrEqualThan(5); }).toString();
        var expected = '$filter=id le 5';
        expect(actual).toBe(expected);
    });
    it('equals', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.id.equals(5); }).toString();
        var expected = '$filter=id eq 5';
        expect(actual).toBe(expected);
    });
    it('notEquals', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.id.notEquals(5); }).toString();
        var expected = '$filter=id ne 5';
        expect(actual).toBe(expected);
    });
    it('eq null', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.id.equals(null); }).toString();
        var expected = '$filter=id eq null';
        expect(actual).toBe(expected);
    });
    it('not eq null', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.id.notEquals(null); }).toString();
        var expected = '$filter=id ne null';
        expect(actual).toBe(expected);
    });
    it('number in array', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.id.in([5, 10]); }).toString();
        var expected = '$filter=id in (5,10)';
        expect(actual).toBe(expected);
    });
});
// boolean
describe('testodataQuery filter by boolean', function () {
    it('equals', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.accountEnabled.equals(true); }).toString();
        var expected = '$filter=accountEnabled eq true';
        expect(actual).toBe(expected);
    });
    it('notEquals', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.accountEnabled.notEquals(true); })
            .toString();
        var expected = '$filter=accountEnabled ne true';
        expect(actual).toBe(expected);
    });
});
// Date
describe('testodataQuery filter by Date', function () {
    it('inTimeSpan', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.createDate.inTimeSpan(2020); }).toString();
        var expected = '$filter=(year(createDate) eq 2020)';
        expect(actual).toBe(expected);
    });
    it('inTimeSpan full date', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.createDate.inTimeSpan(2020, 10, 14, 6, 30); })
            .toString();
        var expected = '$filter=(year(createDate) eq 2020) and (month(createDate) eq 10) and (day(createDate) eq 14) and (hour(createDate) eq 6) and (minute(createDate) eq 30)';
        expect(actual).toBe(expected);
    });
    it('isAfter', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.createDate.isAfter(new Date(2020, 0)); })
            .toString();
        var expected = '$filter=createDate gt 2020-01-01T';
        expect(actual.indexOf(expected)).toBeGreaterThan(-1);
    });
    it('isBefore', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.createDate.isBefore(new Date(2020, 0)); })
            .toString();
        var expected = '$filter=createDate lt 2020-01-01T';
        expect(actual.indexOf(expected)).toBeGreaterThan(-1);
    });
    it('isAfterOrEqual', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.createDate.isAfterOrEqual(new Date(2020, 0)); })
            .toString();
        var expected = '$filter=createDate ge 2020-01-01T';
        expect(actual.indexOf(expected)).toBeGreaterThan(-1);
    });
    it('isBeforeOrEqual', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.createDate.isBeforeOrEqual(new Date(2020, 0)); })
            .toString();
        var expected = '$filter=createDate le 2020-01-01T';
        expect(actual.indexOf(expected)).toBeGreaterThan(-1);
    });
    it('isSame', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.createDate.isSame(new Date(2020, 0)); })
            .toString();
        var expected = '$filter=createDate eq 2020-01-01T';
        expect(actual.indexOf(expected)).toBeGreaterThan(-1);
    });
});
// object
describe('testodataQuery filter by object', function () {
    it('filter by nested property', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.address.code.biggerThan(5); }).toString();
        var expected = '$filter=address/code gt 5';
        expect(actual).toBe(expected);
    });
    it('filter by nested property deep', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.address.user.id.biggerThan(5); }).toString();
        var expected = '$filter=address/user/id gt 5';
        expect(actual).toBe(expected);
    });
});
// object
describe('testodataQuery filter by array', function () {
    it('filter by empty array', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.phoneNumbers.empty(); }).toString();
        var expected = '$filter=not phoneNumbers/any()';
        expect(actual).toBe(expected);
    });
    it('filter by not empty array', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.phoneNumbers.notEmpty(); }).toString();
        var expected = '$filter=phoneNumbers/any()';
        expect(actual).toBe(expected);
    });
    it('filter by not empty related array', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.posts.notEmpty(); }).toString();
        var expected = '$filter=posts/any()';
        expect(actual).toBe(expected);
    });
    it('filter by any', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.phoneNumbers.any(function (x) { return x.equals('test'); }); })
            .toString();
        var expected = "$filter=phoneNumbers/any(x: x eq 'test')";
        expect(actual).toBe(expected);
    });
    it('filter by any nested', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.posts.any(function (p) { return p.comments.any(function (c) { return c.equals(null); }); }); })
            .toString();
        var expected = '$filter=posts/any(p: p/comments/any(c: c eq null))';
        expect(actual).toBe(expected);
    });
    it('filter by all', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.phoneNumbers.all(function (x) { return x.equals('test'); }); })
            .toString();
        var expected = "$filter=phoneNumbers/all(x: x eq 'test')";
        expect(actual).toBe(expected);
    });
    it('filter by all nested', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.posts.all(function (p) { return p.comments.all(function (c) { return c.notEquals(null); }); }); })
            .toString();
        var expected = '$filter=posts/all(p: p/comments/all(c: c ne null))';
        expect(actual).toBe(expected);
    });
});
// by another key
describe('testodataQuery filter by another key', function () {
    it('string', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.givenName.contains(q.surname); }).toString();
        var expected = '$filter=contains(givenName, surname)';
        expect(actual).toBe(expected);
    });
    it('number', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter(function (q) { return q.id.equals(q.id); }).toString();
        var expected = '$filter=id eq id';
        expect(actual).toBe(expected);
    });
    it('boolean', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.accountEnabled.notEquals(q.accountEnabled); })
            .toString();
        var expected = '$filter=accountEnabled ne accountEnabled';
        expect(actual).toBe(expected);
    });
    it('Date', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.createDate.isSame(q.createDate, 'day'); })
            .toString();
        var expected = '$filter=day(createDate) eq day(createDate)';
        expect(actual).toBe(expected);
    });
});
// composed
describe('testodataQuery filter composed', function () {
    it('and [inline]', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) {
            return q.mail
                .startsWith('a')
                .and(q.mail.contains('o'))
                .and(q.mail.endsWith('z'));
        })
            .toString();
        var expected = "$filter=startswith(mail, 'a') and contains(mail, 'o') and endswith(mail, 'z')";
        expect(actual).toBe(expected);
    });
    it('and [multilines]', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.mail.startsWith('a'); })
            .filter(function (q) { return q.mail.contains('o'); })
            .filter(function (q) { return q.mail.endsWith('z'); })
            .toString();
        var expected = "$filter=startswith(mail, 'a') and contains(mail, 'o') and endswith(mail, 'z')";
        expect(actual).toBe(expected);
    });
    it('or', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) {
            return q.mail.startsWith('a').or(q.mail.contains('o')).or(q.mail.endsWith('z'));
        })
            .toString();
        var expected = "$filter=startswith(mail, 'a') or contains(mail, 'o') or endswith(mail, 'z')";
        expect(actual).toBe(expected);
    });
    it('or with and [inline]', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) {
            return q.givenName
                .startsWith('search')
                .and(q.surname.startsWith('search').or(q.mail.startsWith('search')));
        })
            .toString();
        var expected = "$filter=startswith(givenName, 'search') and (startswith(surname, 'search') or startswith(mail, 'search'))";
        expect(actual).toBe(expected);
    });
    it('or with and [multilines]', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) {
            return q.givenName
                .startsWith('search')
                .or(q.surname.startsWith('search'))
                .or(q.mail.startsWith('search'));
        })
            .filter(function (q) { return q.accountEnabled.equals(true); })
            .toString();
        var expected = "$filter=(startswith(givenName, 'search') or startswith(surname, 'search') or startswith(mail, 'search')) and accountEnabled eq true";
        expect(actual).toBe(expected);
    });
    it('not', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter(function (q) { return q.mail.startsWith('a').or(q.mail.startsWith('b')).not(); })
            .toString();
        var expected = "$filter=not (startswith(mail, 'a') or startswith(mail, 'b'))";
        expect(actual).toBe(expected);
    });
});
// alt
describe('testodataQuery filter alt', function () {
    it('alt', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query.filter('mail', function (q) { return q.startsWith('test'); }).toString();
        var expected = "$filter=startswith(mail, 'test')";
        expect(actual).toBe(expected);
    });
    it('alt or', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter('mail', function (q) { return q.startsWith('test').or(q.startsWith('ok')); })
            .toString();
        var expected = "$filter=startswith(mail, 'test') or startswith(mail, 'ok')";
        expect(actual).toBe(expected);
    });
    it('alt and', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter('mail', function (q) { return q.startsWith('test').and(q.endsWith('.com')); })
            .toString();
        var expected = "$filter=startswith(mail, 'test') and endswith(mail, '.com')";
        expect(actual).toBe(expected);
    });
    it('alt and [multilines]', function () {
        var query = (0, src_1.odataQuery)();
        var actual = query
            .filter('mail', function (q) { return q.startsWith('test'); })
            .filter('givenName', function (q) { return q.startsWith('test'); })
            .toString();
        var expected = "$filter=startswith(mail, 'test') and startswith(givenName, 'test')";
        expect(actual).toBe(expected);
    });
});
//# sourceMappingURL=filter.spec.js.map