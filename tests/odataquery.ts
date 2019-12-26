import { ODataQuery } from '../src/odataquery';
import { User } from '../models';

describe('testing ODataQuery select', () => {
  test('select one', () => {
    const query = new ODataQuery<User>();
    const actual = query.select('id').toString();
    const expected = "$select=id";
    expect(actual).toBe(expected);
  })

  test('select multiple', () => {
    const query = new ODataQuery<User>();
    const actual = query.select('id', 'mail', 'surname').toString();
    const expected = "$select=id,mail,surname";
    expect(actual).toBe(expected);
  })
})

describe('testing ODataQuery orderby', () => {
  test('orderby', () => {
    const query = new ODataQuery<User>();
    const actual = query.orderBy(q => q.mail).toString();
    const expected = "$orderby=mail";
    expect(actual).toBe(expected);
  })

  test('orderby explicit', () => {
    const query = new ODataQuery<User>();
    const actual = query.orderBy('mail').toString();
    const expected = "$orderby=mail";
    expect(actual).toBe(expected);
  })

  test('orderby asc', () => {
    const query = new ODataQuery<User>();
    const actual = query.orderBy(q => q.mail.asc()).toString();
    const expected = "$orderby=mail asc";
    expect(actual).toBe(expected);
  })

  test('orderby asc explicit', () => {
    const query = new ODataQuery<User>();
    const actual = query.orderBy('mail', 'asc').toString();
    const expected = "$orderby=mail asc";
    expect(actual).toBe(expected);
  })

  test('orderby desc', () => {
    const query = new ODataQuery<User>();
    const actual = query.orderBy(q => q.mail.desc()).toString();
    const expected = "$orderby=mail desc";
    expect(actual).toBe(expected);
  })

  test('orderby desc explicit', () => {
    const query = new ODataQuery<User>();
    const actual = query.orderBy('mail', 'desc').toString();
    const expected = "$orderby=mail desc";
    expect(actual).toBe(expected);
  })
})

describe('testing ODataQuery paginate', () => {
  test('paginate', () => {
    const query = new ODataQuery<User>();
    const actual = query.paginate(10).toString();
    const expected = "$top=10&$count=true";
    expect(actual).toBe(expected);
  })

  test('paginate with skip', () => {
    const query = new ODataQuery<User>();
    const actual = query.paginate(25, 5).toString();
    const expected = "$skip=125&$top=25&$count=true";
    expect(actual).toBe(expected);
  })

  test('paginate object', () => {
    const query = new ODataQuery<User>();
    const actual = query.paginate({ pagesize: 10 }).toString();
    const expected = "$top=10&$count=true";
    expect(actual).toBe(expected);
  })

  test('paginate object with skip', () => {
    const query = new ODataQuery<User>();
    const actual = query.paginate({ page: 5, pagesize: 25 }).toString();
    const expected = "$skip=125&$top=25&$count=true";
    expect(actual).toBe(expected);
  })

  test('paginate disable count', () => {
    const query = new ODataQuery<User>();
    const actual = query.paginate({ page: 5, pagesize: 25, count: false }).toString();
    const expected = "$skip=125&$top=25";
    expect(actual).toBe(expected);
  })
})

describe('testing ODataQuery filter', () => {
  // string
  test('contains', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.contains('test')).toString();
    const expected = "$filter=contains(mail, 'test')";
    expect(actual).toBe(expected);
  })

  test('containsCaseInsensitive', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.containsCaseInsensitive('test')).toString();
    const expected = "$filter=contains(tolower(mail), 'test')";
    expect(actual).toBe(expected);
  })

  test('endsWith', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.endsWith('test')).toString();
    const expected = "$filter=endswith(mail, 'test')";
    expect(actual).toBe(expected);
  })

  test('endsWithCaseInsensitive', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.endsWithCaseInsensitive('test')).toString();
    const expected = "$filter=endswith(tolower(mail), 'test')";
    expect(actual).toBe(expected);
  })

  test('equals', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.equals('test')).toString();
    const expected = "$filter=mail eq 'test'";
    expect(actual).toBe(expected);
  })

  test('equalsCaseInsensitive', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.equalsCaseInsensitive('test')).toString();
    const expected = "$filter=tolower(mail) eq 'test'";
    expect(actual).toBe(expected);
  })

  test('notEquals', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.notEquals('test')).toString();
    const expected = "$filter=mail ne 'test'";
    expect(actual).toBe(expected);
  })

  test('notEqualsCaseInsensitive', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.notEqualsCaseInsensitive('test')).toString();
    const expected = "$filter=tolower(mail) ne 'test'";
    expect(actual).toBe(expected);
  })

  test('notNull', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.notNull()).toString();
    const expected = "$filter=mail ne null";
    expect(actual).toBe(expected);
  })

  test('startsWith', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.startsWith('test')).toString();
    const expected = "$filter=startswith(mail, 'test')";
    expect(actual).toBe(expected);
  })

  test('startsWithCaseInsensitive', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q => q.mail.startsWithCaseInsensitive('test')).toString();
    const expected = "$filter=startswith(tolower(mail), 'test')";
    expect(actual).toBe(expected);
  })

  // number
  test('biggerThan', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter('id', q => q.biggerThan(5)).toString();
    const expected = "$filter=id gt 5";
    expect(actual).toBe(expected);
  })

  test('equals', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter('id', q => q.equals(5)).toString();
    const expected = "$filter=id eq 5";
    expect(actual).toBe(expected);
  })

  test('lessThan', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter('id', q => q.lessThan(5)).toString();
    const expected = "$filter=id lt 5";
    expect(actual).toBe(expected);
  })

  test('notEquals', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter('id', q => q.notEquals(5)).toString();
    const expected = "$filter=id ne 5";
    expect(actual).toBe(expected);
  })

  // boolean
  test('equals', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter('accountEnabled', q => q.equals(true)).toString();
    const expected = "$filter=accountEnabled eq true";
    expect(actual).toBe(expected);
  })

  test('notEquals', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter('accountEnabled', q => q.notEquals(true)).toString();
    const expected = "$filter=accountEnabled ne true";
    expect(actual).toBe(expected);
  })

  // Date
  test('inTimeSpan', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter('createDate', q => q.inTimeSpan(2020)).toString();
    const expected = "$filter=(year(createDate) eq 2020)";
    expect(actual).toBe(expected);
  })

  test('inTimeSpan full date', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter('createDate', q => q.inTimeSpan(2020, 10, 14, 6, 30)).toString();
    const expected = "$filter=(year(createDate) eq 2020) and (month(createDate) eq 10) and (day(createDate) eq 14) and (hour(createDate) eq 6) and (minute(createDate) eq 30)";
    expect(actual).toBe(expected);
  })

  test('isAfter', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter('createDate', q => q.isAfter(new Date(2020, 0))).toString();
    const expected = "$filter=createDate gt 2020-01-01T02:00:00.000Z";
    expect(actual).toBe(expected);
  })

  test('isBefore', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter('createDate', q => q.isBefore(new Date(2020, 0))).toString();
    const expected = "$filter=createDate lt 2020-01-01T02:00:00.000Z";
    expect(actual).toBe(expected);
  })

  test('isSame', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter('createDate', q => q.isSame(new Date(2020, 0))).toString();
    const expected = "$filter=createDate gt 2020-01-01T02:00:00.999Z and createDate lt 2020-01-01T02:00:00.999Z";
    expect(actual).toBe(expected);
  })
  
  /////////
  // composed

  test('and [inline]', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q =>
      q.mail.startsWith('a')
      .and(q.mail.contains('o'))
      .and(q.mail.endsWith('z'))
    ).toString();

    const expected = "$filter=startswith(mail, 'a') and contains(mail, 'o') and endswith(mail, 'z')";
    expect(actual).toBe(expected);
  })

  test('and [multilines]', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter(q => q.mail.startsWith('a'))
      .filter(q => q.mail.contains('o'))
      .filter(q => q.mail.endsWith('z'))
      .toString();

    const expected = "$filter=startswith(mail, 'a') and contains(mail, 'o') and endswith(mail, 'z')";
    expect(actual).toBe(expected);
  })

  test('or', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q =>
      q.mail.startsWith('a')
      .or(q.mail.contains('o'))
      .or(q.mail.endsWith('z'))
    ).toString();

    const expected = "$filter=startswith(mail, 'a') or contains(mail, 'o') or endswith(mail, 'z')";
    expect(actual).toBe(expected);
  })

  test('or with and [inline]', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter(q => 
        q.givenName.startsWith('search')
        .and(
          q.surname.startsWith('search')
          .or(q.mail.startsWith('search'))
        ))
      .toString();

    const expected = "$filter=startswith(givenName, 'search') and (startswith(surname, 'search') or startswith(mail, 'search'))";
    expect(actual).toBe(expected);
  })

  test('or with and [multilines]', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter(q => 
        q.givenName.startsWith('search')
        .or(q.surname.startsWith('search'))
        .or(q.mail.startsWith('search')))
      .filter(q => q.accountEnabled.equals(true))
      .toString();

    const expected = "$filter=(startswith(givenName, 'search') or startswith(surname, 'search') or startswith(mail, 'search')) and accountEnabled eq true";
    expect(actual).toBe(expected);
  })

  test('not', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter(q =>q.mail
      .startsWith('a')
      .or(q.mail.startsWith('b'))
      .not()
    ).toString();

    const expected = "$filter=not (startswith(mail, 'a') or startswith(mail, 'b'))";
    expect(actual).toBe(expected);
  })

  //////////////
  // explicit

  test('explicit', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter('mail', q => q.startsWith('test')).toString();
    const expected = "$filter=startswith(mail, 'test')";
    expect(actual).toBe(expected);
  })

  test('explicit or', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter('mail', q => q.startsWith('test').or(q.startsWith('ok'))).toString();
    const expected = "$filter=startswith(mail, 'test') or startswith(mail, 'ok')";
    expect(actual).toBe(expected);
  })

  test('explicit and', () => {
    const query = new ODataQuery<User>();
    const actual = query.filter('mail', q => q.startsWith('test').and(q.endsWith('.com'))).toString();
    const expected = "$filter=startswith(mail, 'test') and endswith(mail, '.com')";
    expect(actual).toBe(expected);
  })

  test('explicit and [multilines]', () => {
    const query = new ODataQuery<User>();
    const actual = query
      .filter('mail', q => q.startsWith('test'))
      .filter('givenName', q => q.startsWith('test'))
      .toString();

    const expected = "$filter=startswith(mail, 'test') and startswith(givenName, 'test')";
    expect(actual).toBe(expected);
  })
})
