import { ODataQuery } from '../src/odata-query';
import { User } from '../models';

describe('testing ODataQuery select', () => {
  test('select one', () => {
    const query = new ODataQuery<User>();
    const actual = query.select('id').toString();
    const expected = '$select=id';
    expect(actual).toBe(expected);
  });

  test('select multiple', () => {
    const query = new ODataQuery<User>();
    const actual = query.select('id', 'mail', 'surname').toString();
    const expected = '$select=id,mail,surname';
    expect(actual).toBe(expected);
  });
});

describe('testing ODataQuery count', () => {
  test('count', () => {
    const query = new ODataQuery<User>();
    const actual = query.count().toString();
    const expected = '$count=true';
    expect(actual).toBe(expected);
  });

  test('count on expand', () => {
    const query = new ODataQuery<User>();
    const actual = query.expand('posts', (q) => q.count()).toString();
    const expected = '$expand=posts($count=true)';
    expect(actual).toBe(expected);
  });
});

describe('testing ODataQuery orderby', () => {
  test('orderby', () => {
    const query = new ODataQuery<User>();
    const actual = query.orderBy((q) => q.mail).toString();
    const expected = '$orderby=mail';
    expect(actual).toBe(expected);
  });

  test('orderby alt', () => {
    const query = new ODataQuery<User>();
    const actual = query.orderBy('mail').toString();
    const expected = '$orderby=mail';
    expect(actual).toBe(expected);
  });

  test('orderby asc', () => {
    const query = new ODataQuery<User>();
    const actual = query.orderBy((q) => q.mail.asc()).toString();
    const expected = '$orderby=mail asc';
    expect(actual).toBe(expected);
  });

  test('orderby asc alt', () => {
    const query = new ODataQuery<User>();
    const actual = query.orderBy('mail', 'asc').toString();
    const expected = '$orderby=mail asc';
    expect(actual).toBe(expected);
  });

  test('orderby desc', () => {
    const query = new ODataQuery<User>();
    const actual = query.orderBy((q) => q.mail.desc()).toString();
    const expected = '$orderby=mail desc';
    expect(actual).toBe(expected);
  });

  test('orderby desc alt', () => {
    const query = new ODataQuery<User>();
    const actual = query.orderBy('mail', 'desc').toString();
    const expected = '$orderby=mail desc';
    expect(actual).toBe(expected);
  });

  test('orderby nested', () => {
    const query = new ODataQuery<User>();
    const actual = query.orderBy((q) => q.address.street).toString();
    const expected = '$orderby=address/street';
    expect(actual).toBe(expected);
  });

  test('orderby nested array', () => {
    const query = new ODataQuery<User>();
    const actual = query.orderBy((q) => q.posts.id).toString();
    const expected = '$orderby=posts/id';
    expect(actual).toBe(expected);
  });
});

describe('testing ODataQuery paginate', () => {
  test('paginate', () => {
    const query = new ODataQuery<User>();
    const actual = query.paginate(10).toString();
    const expected = '$top=10&$count=true';
    expect(actual).toBe(expected);
  });

  test('paginate with skip', () => {
    const query = new ODataQuery<User>();
    const actual = query.paginate(25, 5).toString();
    const expected = '$skip=125&$top=25&$count=true';
    expect(actual).toBe(expected);
  });

  test('paginate object', () => {
    const query = new ODataQuery<User>();
    const actual = query.paginate({ pagesize: 10 }).toString();
    const expected = '$top=10&$count=true';
    expect(actual).toBe(expected);
  });

  test('paginate object with skip', () => {
    const query = new ODataQuery<User>();
    const actual = query.paginate({ page: 5, pagesize: 25 }).toString();
    const expected = '$skip=125&$top=25&$count=true';
    expect(actual).toBe(expected);
  });

  test('paginate disable count', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .paginate({ page: 5, pagesize: 25, count: false })
      .toString();
    const expected = '$skip=125&$top=25';
    expect(actual).toBe(expected);
  });
});

// string
describe('testing ODataQuery filter by string', () => {
  test('contains', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.mail.contains('test')).toString();
    const expected = "$filter=contains(mail, 'test')";
    expect(actual).toBe(expected);
  });

  test('contains caseInsensitive', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.mail.contains('test', { caseInsensitive: true }))
      .toString();
    const expected = "$filter=contains(tolower(mail), 'test')";
    expect(actual).toBe(expected);
  });

  test('endsWith', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.mail.endsWith('test')).toString();
    const expected = "$filter=endswith(mail, 'test')";
    expect(actual).toBe(expected);
  });

  test('endsWith caseInsensitive', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.mail.endsWith('test', { caseInsensitive: true }))
      .toString();
    const expected = "$filter=endswith(tolower(mail), 'test')";
    expect(actual).toBe(expected);
  });

  test('equals', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.mail.equals('test')).toString();
    const expected = "$filter=mail eq 'test'";
    expect(actual).toBe(expected);
  });

  test('equals caseInsensitive', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.mail.equals('test', { caseInsensitive: true }))
      .toString();
    const expected = "$filter=tolower(mail) eq 'test'";
    expect(actual).toBe(expected);
  });

  test('notEquals', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.mail.notEquals('test')).toString();
    const expected = "$filter=mail ne 'test'";
    expect(actual).toBe(expected);
  });

  test('not equals caseInsensitive', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.mail.notEquals('test', { caseInsensitive: true }))
      .toString();
    const expected = "$filter=tolower(mail) ne 'test'";
    expect(actual).toBe(expected);
  });

  test('equals null', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.mail.equals(null)).toString();
    const expected = '$filter=mail eq null';
    expect(actual).toBe(expected);
  });

  test('notEquals null', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.mail.notEquals(null)).toString();
    const expected = '$filter=mail ne null';
    expect(actual).toBe(expected);
  });

  test('startsWith', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.mail.startsWith('test')).toString();
    const expected = "$filter=startswith(mail, 'test')";
    expect(actual).toBe(expected);
  });

  test('startsWith caseInsensitive', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.mail.startsWith('test', { caseInsensitive: true }))
      .toString();
    const expected = "$filter=startswith(tolower(mail), 'test')";
    expect(actual).toBe(expected);
  });

  test('string in array', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.givenName.in(['foo', 'bar']))
      .toString();
    const expected = "$filter=givenName in ('foo','bar')";
    expect(actual).toBe(expected);
  });
});

// guid
describe('testing ODataQuery filter by guid', () => {
  test('equals', () => {
    const query = new ODataQuery<User>();
    const guid = '003b63b4-e0b0-40db-8d5f-fb388bf0eabc';
    const actual = query.filter((q) => q.mail.equals(guid)).toString();
    const expected = '$filter=mail eq ' + guid;
    expect(actual).toBe(expected);
  });

  test('notEquals', () => {
    const query = new ODataQuery<User>();
    const guid = '003b63b4-e0b0-40db-8d5f-fb388bf0eabc';
    const actual = query.filter((q) => q.mail.notEquals(guid)).toString();
    const expected = '$filter=mail ne ' + guid;
    expect(actual).toBe(expected);
  });
});

// number
describe('testing ODataQuery filter by number', () => {
  test('biggerThan', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.id.biggerThan(5)).toString();
    const expected = '$filter=id gt 5';
    expect(actual).toBe(expected);
  });

  test('lessThan', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.id.lessThan(5)).toString();
    const expected = '$filter=id lt 5';
    expect(actual).toBe(expected);
  });

  test('equals', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.id.equals(5)).toString();
    const expected = '$filter=id eq 5';
    expect(actual).toBe(expected);
  });

  test('notEquals', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.id.notEquals(5)).toString();
    const expected = '$filter=id ne 5';
    expect(actual).toBe(expected);
  });

  test('eq null', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.id.equals(null)).toString();
    const expected = '$filter=id eq null';
    expect(actual).toBe(expected);
  });

  test('not eq null', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.id.notEquals(null)).toString();
    const expected = '$filter=id ne null';
    expect(actual).toBe(expected);
  });

  test('number in array', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.id.in([5, 10])).toString();
    const expected = '$filter=id in (5,10)';
    expect(actual).toBe(expected);
  });
});

// boolean
describe('testing ODataQuery filter by boolean', () => {
  test('equals', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.accountEnabled.equals(true))
      .toString();
    const expected = '$filter=accountEnabled eq true';
    expect(actual).toBe(expected);
  });

  test('notEquals', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.accountEnabled.notEquals(true))
      .toString();
    const expected = '$filter=accountEnabled ne true';
    expect(actual).toBe(expected);
  });
});

// Date
describe('testing ODataQuery filter by Date', () => {
  test('inTimeSpan', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.createDate.inTimeSpan(2020))
      .toString();
    const expected = '$filter=(year(createDate) eq 2020)';
    expect(actual).toBe(expected);
  });

  test('inTimeSpan full date', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.createDate.inTimeSpan(2020, 10, 14, 6, 30))
      .toString();
    const expected =
      '$filter=(year(createDate) eq 2020) and (month(createDate) eq 10) and (day(createDate) eq 14) and (hour(createDate) eq 6) and (minute(createDate) eq 30)';
    expect(actual).toBe(expected);
  });

  test('isAfter', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.createDate.isAfter(new Date(2020, 0)))
      .toString();
    const expected = '$filter=createDate gt 2020-01-01T';
    expect(actual.indexOf(expected)).toBeGreaterThan(-1);
  });

  test('isBefore', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.createDate.isBefore(new Date(2020, 0)))
      .toString();
    const expected = '$filter=createDate lt 2020-01-01T';
    expect(actual.indexOf(expected)).toBeGreaterThan(-1);
  });

  test('isSame', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.createDate.isSame(new Date(2020, 0)))
      .toString();
    const expected = '$filter=createDate eq 2020-01-01T';
    expect(actual.indexOf(expected)).toBeGreaterThan(-1);
  });
});

// object
describe('testing ODataQuery filter by object', () => {
  test('filter by nested property', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.address.code.biggerThan(5)).toString();
    const expected = '$filter=address/code gt 5';
    expect(actual).toBe(expected);
  });

  test('filter by nested property deep', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.address.user.id.biggerThan(5))
      .toString();
    const expected = '$filter=address/user/id gt 5';
    expect(actual).toBe(expected);
  });
});

// object
describe('testing ODataQuery filter by array', () => {
  test('filter by empty array', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.phoneNumbers.empty()).toString();
    const expected = '$filter=not phoneNumbers/any()';
    expect(actual).toBe(expected);
  });

  test('filter by not empty array', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.phoneNumbers.notEmpty()).toString();
    const expected = '$filter=phoneNumbers/any()';
    expect(actual).toBe(expected);
  });

  test('filter by not empty related array', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.posts.notEmpty()).toString();
    const expected = '$filter=posts/any()';
    expect(actual).toBe(expected);
  });

  test('filter by any', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.phoneNumbers.any((x) => x.equals('test')))
      .toString();
    const expected = "$filter=phoneNumbers/any(x:x eq 'test')";
    expect(actual).toBe(expected);
  });

  test('filter by any nested', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.posts.any((p) => p.comments.any((c) => c.equals(null))))
      .toString();
    const expected = '$filter=posts/any(p:p/comments/any(c:c eq null))';
    expect(actual).toBe(expected);
  });

  test('filter by all', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.phoneNumbers.all((x) => x.equals('test')))
      .toString();
    const expected = "$filter=phoneNumbers/all(x:x eq 'test')";
    expect(actual).toBe(expected);
  });

  test('filter by all nested', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) =>
        q.posts.all((p) => p.comments.all((c) => c.notEquals(null)))
      )
      .toString();
    const expected = '$filter=posts/all(p:p/comments/all(c:c ne null))';
    expect(actual).toBe(expected);
  });
});

// by another key
describe('testing ODataQuery filter by another key', () => {
  test('string', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.givenName.contains(q.surname))
      .toString();
    const expected = '$filter=contains(givenName, surname)';
    expect(actual).toBe(expected);
  });

  test('number', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter((q) => q.id.equals(q.id)).toString();
    const expected = '$filter=id eq id';
    expect(actual).toBe(expected);
  });

  test('boolean', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.accountEnabled.notEquals(q.accountEnabled))
      .toString();
    const expected = '$filter=accountEnabled ne accountEnabled';
    expect(actual).toBe(expected);
  });

  test('Date', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.createDate.isSame(q.createDate, 'day'))
      .toString();
    const expected = '$filter=day(createDate) eq day(createDate)';
    expect(actual).toBe(expected);
  });
});

// composed
describe('testing ODataQuery filter composed', () => {
  test('and [inline]', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) =>
        q.mail
          .startsWith('a')
          .and(q.mail.contains('o'))
          .and(q.mail.endsWith('z'))
      )
      .toString();

    const expected =
      "$filter=startswith(mail, 'a') and contains(mail, 'o') and endswith(mail, 'z')";
    expect(actual).toBe(expected);
  });

  test('and [multilines]', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.mail.startsWith('a'))
      .filter((q) => q.mail.contains('o'))
      .filter((q) => q.mail.endsWith('z'))
      .toString();

    const expected =
      "$filter=startswith(mail, 'a') and contains(mail, 'o') and endswith(mail, 'z')";
    expect(actual).toBe(expected);
  });

  test('or', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) =>
        q.mail.startsWith('a').or(q.mail.contains('o')).or(q.mail.endsWith('z'))
      )
      .toString();

    const expected =
      "$filter=startswith(mail, 'a') or contains(mail, 'o') or endswith(mail, 'z')";
    expect(actual).toBe(expected);
  });

  test('or with and [inline]', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) =>
        q.givenName
          .startsWith('search')
          .and(q.surname.startsWith('search').or(q.mail.startsWith('search')))
      )
      .toString();

    const expected =
      "$filter=startswith(givenName, 'search') and (startswith(surname, 'search') or startswith(mail, 'search'))";
    expect(actual).toBe(expected);
  });

  test('or with and [multilines]', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) =>
        q.givenName
          .startsWith('search')
          .or(q.surname.startsWith('search'))
          .or(q.mail.startsWith('search'))
      )
      .filter((q) => q.accountEnabled.equals(true))
      .toString();

    const expected =
      "$filter=(startswith(givenName, 'search') or startswith(surname, 'search') or startswith(mail, 'search')) and accountEnabled eq true";
    expect(actual).toBe(expected);
  });

  test('not', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter((q) => q.mail.startsWith('a').or(q.mail.startsWith('b')).not())
      .toString();

    const expected =
      "$filter=not (startswith(mail, 'a') or startswith(mail, 'b'))";
    expect(actual).toBe(expected);
  });
});

// alt
describe('testing ODataQuery filter alt', () => {
  test('alt', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter('mail', (q) => q.startsWith('test')).toString();
    const expected = "$filter=startswith(mail, 'test')";
    expect(actual).toBe(expected);
  });

  test('alt or', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter('mail', (q) => q.startsWith('test').or(q.startsWith('ok')))
      .toString();
    const expected =
      "$filter=startswith(mail, 'test') or startswith(mail, 'ok')";
    expect(actual).toBe(expected);
  });

  test('alt and', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter('mail', (q) => q.startsWith('test').and(q.endsWith('.com')))
      .toString();
    const expected =
      "$filter=startswith(mail, 'test') and endswith(mail, '.com')";
    expect(actual).toBe(expected);
  });

  test('alt and [multilines]', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter('mail', (q) => q.startsWith('test'))
      .filter('givenName', (q) => q.startsWith('test'))
      .toString();

    const expected =
      "$filter=startswith(mail, 'test') and startswith(givenName, 'test')";
    expect(actual).toBe(expected);
  });
});

describe('testing ODataQuery expand', () => {
  // one2one relation
  test('expand', () => {
    const query = new ODataQuery<User>();
    const actual = query.expand('address').toString();
    const expected = '$expand=address';
    expect(actual).toBe(expected);
  });

  test('expand and select', () => {
    const query = new ODataQuery<User>();
    const actual = query.expand('address', (q) => q.select('code')).toString();

    const expected = '$expand=address($select=code)';
    expect(actual).toBe(expected);
  });

  test('expand twice', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .expand('address', (q) => q.expand('user', (q) => q.select('id')))
      .toString();

    const expected = '$expand=address($expand=user($select=id))';
    expect(actual).toBe(expected);
  });

  // one2many relation
  test('expand and filter', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .expand('posts', (e) => e.filter((q) => q.content.startsWith('test')))
      .toString();

    const expected = "$expand=posts($filter=startswith(content, 'test'))";
    expect(actual).toBe(expected);
  });

  test('expand and filter composed', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .expand('posts', (e) =>
        e.filter((q) => q.content.startsWith('test').or(q.id.biggerThan(5)))
      )
      .toString();

    const expected =
      "$expand=posts($filter=startswith(content, 'test') or id gt 5)";
    expect(actual).toBe(expected);
  });

  test('expand and filter composed multiline', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .expand('posts', (e) =>
        e
          .filter((q) => q.content.startsWith('test').or(q.id.biggerThan(5)))
          .filter((q) => q.id.lessThan(10))
      )
      .toString();

    const expected =
      "$expand=posts($filter=(startswith(content, 'test') or id gt 5) and id lt 10)";
    expect(actual).toBe(expected);
  });

  test('expand and orderby', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .expand('posts', (e) => e.orderBy((q) => q.id.desc()))
      .toString();

    const expected = '$expand=posts($orderby=id desc)';
    expect(actual).toBe(expected);
  });

  test('expand and paginate', () => {
    const query = new ODataQuery<User>();
    const actual = query.expand('posts', (e) => e.paginate(0)).toString();

    const expected = '$expand=posts($top=0;$count=true)';
    expect(actual).toBe(expected);
  });

  test('expand and paginate object', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .expand('posts', (e) =>
        e.paginate({
          page: 5,
          pagesize: 10,
          count: false,
        })
      )
      .toString();

    const expected = '$expand=posts($skip=50;$top=10)';
    expect(actual).toBe(expected);
  });
});

describe('testing ODataQuery groupBy', () => {
  test('groupBy', () => {
    const query = new ODataQuery<User>();
    const actual = query.groupBy(['mail']).toString();
    const expected = '$apply=groupby((mail))';
    expect(actual).toBe(expected);
  });

  test('groupBy multiple', () => {
    const query = new ODataQuery<User>();
    const actual = query.groupBy(['mail', 'surname']).toString();
    const expected = '$apply=groupby((mail,surname))';
    expect(actual).toBe(expected);
  });

  test('groupBy aggregate', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .groupBy(['mail', 'surname'], (a) => a.countdistinct('id', 'all'))
      .toString();
    const expected =
      '$apply=groupby((mail,surname),aggregate(id with countdistinct as all))';
    expect(actual).toBe(expected);
  });

  test('groupBy aggregate multiple', () => {
    const query = new ODataQuery<User>();

    const actual = query
      .groupBy(['mail', 'surname'], (a) =>
        a.countdistinct('id', 'all').max('phoneNumbers', 'test')
      )
      .toString();

    const expected =
      '$apply=groupby((mail,surname),aggregate(id with countdistinct as all,phoneNumbers with max as test))';
    expect(actual).toBe(expected);
  });
});

describe('testing ODataQuery toObject', () => {
  test('select one', () => {
    const query = new ODataQuery<User>();
    const actual = query.select('id').toObject();
    const expected = { $select: 'id' };
    expect(actual).toStrictEqual(expected);
  });

  test('multiple actions', () => {
    const query = new ODataQuery<User>();

    const actual = query
      .filter((q) => q.surname.startsWith('test'))
      .orderBy('mail')
      .select('id')
      .toObject();

    const expected = {
      $filter: "startswith(surname, 'test')",
      $orderby: 'mail',
      $select: 'id',
    };

    expect(actual).toStrictEqual(expected);
  });
});
