import { User } from '../models'
import { odataQuery } from '../src'

// string
describe('testodataQuery filter by string', () => {
  test('contains', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.mail.contains('test')).toString()
    const expected = "$filter=contains(mail, 'test')"
    expect(actual).toBe(expected)

    const q = query
      .filter(q => q.mail.contains('gmail'))
      .select('id', 'mail')
      .toString()
  })

  test('contains caseInsensitive', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.mail.contains('test', { caseInsensitive: true }))
      .toString()
    const expected = "$filter=contains(tolower(mail), 'test')"
    expect(actual).toBe(expected)
  })

  test('endsWith', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.mail.endsWith('test')).toString()
    const expected = "$filter=endswith(mail, 'test')"
    expect(actual).toBe(expected)
  })

  test('endsWith caseInsensitive', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.mail.endsWith('test', { caseInsensitive: true }))
      .toString()
    const expected = "$filter=endswith(tolower(mail), 'test')"
    expect(actual).toBe(expected)
  })

  test('equals', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.mail.equals('test')).toString()
    const expected = "$filter=mail eq 'test'"
    expect(actual).toBe(expected)
  })

  test('equals caseInsensitive', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.mail.equals('test', { caseInsensitive: true }))
      .toString()
    const expected = "$filter=tolower(mail) eq 'test'"
    expect(actual).toBe(expected)
  })

  test('notEquals', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.mail.notEquals('test')).toString()
    const expected = "$filter=mail ne 'test'"
    expect(actual).toBe(expected)
  })

  test('not equals caseInsensitive', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.mail.notEquals('test', { caseInsensitive: true }))
      .toString()
    const expected = "$filter=tolower(mail) ne 'test'"
    expect(actual).toBe(expected)
  })

  test('equals null', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.mail.equals(null)).toString()
    const expected = '$filter=mail eq null'
    expect(actual).toBe(expected)
  })

  test('notEquals null', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.mail.notEquals(null)).toString()
    const expected = '$filter=mail ne null'
    expect(actual).toBe(expected)
  })

  test('startsWith', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.mail.startsWith('test')).toString()
    const expected = "$filter=startswith(mail, 'test')"
    expect(actual).toBe(expected)
  })

  test('startsWith caseInsensitive', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.mail.startsWith('test', { caseInsensitive: true }))
      .toString()
    const expected = "$filter=startswith(tolower(mail), 'test')"
    expect(actual).toBe(expected)
  })

  test('string in array', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.givenName.in(['foo', 'bar'])).toString()
    const expected = "$filter=givenName in ('foo','bar')"
    expect(actual).toBe(expected)
  })
})

// guid
describe('testodataQuery filter by guid', () => {
  test('equals', () => {
    const query = odataQuery<User>()
    const guid = '003b63b4-e0b0-40db-8d5f-fb388bf0eabc'
    const actual = query.filter(q => q.mail.equals(guid)).toString()
    const expected = '$filter=mail eq ' + guid
    expect(actual).toBe(expected)
  })

  test('notEquals', () => {
    const query = odataQuery<User>()
    const guid = '003b63b4-e0b0-40db-8d5f-fb388bf0eabc'
    const actual = query.filter(q => q.mail.notEquals(guid)).toString()
    const expected = '$filter=mail ne ' + guid
    expect(actual).toBe(expected)
  })

  test('guid as string', () => {
    const query = odataQuery<User>()
    const guid = '003b63b4-e0b0-40db-8d5f-fb388bf0eabc'
    const actual = query
      .filter(q => q.mail.equals(guid, { ignoreGuid: true }))
      .toString()
    const expected = `$filter=mail eq '${guid}'`
    expect(actual).toBe(expected)
  })
})

// number
describe('testodataQuery filter by number', () => {
  test('biggerThan', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.biggerThan(5)).toString()
    const expected = '$filter=id gt 5'
    expect(actual).toBe(expected)
  })

  test('lessThan', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.lessThan(5)).toString()
    const expected = '$filter=id lt 5'
    expect(actual).toBe(expected)
  })

  test('biggerOrEqualThan', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.biggerOrEqualThan(5)).toString()
    const expected = '$filter=id ge 5'
    expect(actual).toBe(expected)
  })

  test('lessOrEqualThan', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.lessOrEqualThan(5)).toString()
    const expected = '$filter=id le 5'
    expect(actual).toBe(expected)
  })

  test('equals', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.equals(5)).toString()
    const expected = '$filter=id eq 5'
    expect(actual).toBe(expected)
  })

  test('notEquals', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.notEquals(5)).toString()
    const expected = '$filter=id ne 5'
    expect(actual).toBe(expected)
  })

  test('eq null', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.equals(null)).toString()
    const expected = '$filter=id eq null'
    expect(actual).toBe(expected)
  })

  test('not eq null', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.notEquals(null)).toString()
    const expected = '$filter=id ne null'
    expect(actual).toBe(expected)
  })

  test('number in array', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.in([5, 10])).toString()
    const expected = '$filter=id in (5,10)'
    expect(actual).toBe(expected)
  })
})

// boolean
describe('testodataQuery filter by boolean', () => {
  test('equals', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.accountEnabled.equals(true)).toString()
    const expected = '$filter=accountEnabled eq true'
    expect(actual).toBe(expected)
  })

  test('notEquals', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.accountEnabled.notEquals(true))
      .toString()
    const expected = '$filter=accountEnabled ne true'
    expect(actual).toBe(expected)
  })
})

// Date
describe('testodataQuery filter by Date', () => {
  test('inTimeSpan', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.createDate.inTimeSpan(2020)).toString()
    const expected = '$filter=(year(createDate) eq 2020)'
    expect(actual).toBe(expected)
  })

  test('inTimeSpan full date', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.inTimeSpan(2020, 10, 14, 6, 30))
      .toString()
    const expected =
      '$filter=(year(createDate) eq 2020) and (month(createDate) eq 10) and (day(createDate) eq 14) and (hour(createDate) eq 6) and (minute(createDate) eq 30)'
    expect(actual).toBe(expected)
  })

  test('isAfter', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isAfter(new Date(2020, 0)))
      .toString()
    const expected = '$filter=createDate gt 2020-01-01T'
    expect(actual.indexOf(expected)).toBeGreaterThan(-1)
  })

  test('isBefore', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isBefore(new Date(2020, 0)))
      .toString()
    const expected = '$filter=createDate lt 2020-01-01T'
    expect(actual.indexOf(expected)).toBeGreaterThan(-1)
  })

  test('isAfterOrEqual', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isAfterOrEqual(new Date(2020, 0)))
      .toString()
    const expected = '$filter=createDate ge 2020-01-01T'
    expect(actual.indexOf(expected)).toBeGreaterThan(-1)
  })

  test('isBeforeOrEqual', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isBeforeOrEqual(new Date(2020, 0)))
      .toString()
    const expected = '$filter=createDate le 2020-01-01T'
    expect(actual.indexOf(expected)).toBeGreaterThan(-1)
  })

  test('isSame', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isSame(new Date(2020, 0)))
      .toString()
    const expected = '$filter=createDate eq 2020-01-01T'
    expect(actual.indexOf(expected)).toBeGreaterThan(-1)
  })
})

// object
describe('testodataQuery filter by object', () => {
  test('filter by nested property', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.address.code.biggerThan(5)).toString()
    const expected = '$filter=address/code gt 5'
    expect(actual).toBe(expected)
  })

  test('filter by nested property deep', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.address.user.id.biggerThan(5)).toString()
    const expected = '$filter=address/user/id gt 5'
    expect(actual).toBe(expected)
  })
})

// object
describe('testodataQuery filter by array', () => {
  test('filter by empty array', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.phoneNumbers.empty()).toString()
    const expected = '$filter=not phoneNumbers/any()'
    expect(actual).toBe(expected)
  })

  test('filter by not empty array', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.phoneNumbers.notEmpty()).toString()
    const expected = '$filter=phoneNumbers/any()'
    expect(actual).toBe(expected)
  })

  test('filter by not empty related array', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.posts.notEmpty()).toString()
    const expected = '$filter=posts/any()'
    expect(actual).toBe(expected)
  })

  test('filter by any', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.phoneNumbers.any(x => x.equals('test')))
      .toString()
    const expected = "$filter=phoneNumbers/any(x: x eq 'test')"
    expect(actual).toBe(expected)
  })

  test('filter by any nested', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.posts.any(p => p.comments.any(c => c.equals(null))))
      .toString()
    const expected = '$filter=posts/any(p: p/comments/any(c: c eq null))'
    expect(actual).toBe(expected)
  })

  test('filter by all', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.phoneNumbers.all(x => x.equals('test')))
      .toString()
    const expected = "$filter=phoneNumbers/all(x: x eq 'test')"
    expect(actual).toBe(expected)
  })

  test('filter by all nested', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.posts.all(p => p.comments.all(c => c.notEquals(null))))
      .toString()
    const expected = '$filter=posts/all(p: p/comments/all(c: c ne null))'
    expect(actual).toBe(expected)
  })
})

// by another key
describe('testodataQuery filter by another key', () => {
  test('string', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.givenName.contains(q.surname)).toString()
    const expected = '$filter=contains(givenName, surname)'
    expect(actual).toBe(expected)
  })

  test('number', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.equals(q.id)).toString()
    const expected = '$filter=id eq id'
    expect(actual).toBe(expected)
  })

  test('boolean', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.accountEnabled.notEquals(q.accountEnabled))
      .toString()
    const expected = '$filter=accountEnabled ne accountEnabled'
    expect(actual).toBe(expected)
  })

  test('Date', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isSame(q.createDate, 'day'))
      .toString()
    const expected = '$filter=day(createDate) eq day(createDate)'
    expect(actual).toBe(expected)
  })
})

// composed
describe('testodataQuery filter composed', () => {
  test('and [inline]', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q =>
        q.mail
          .startsWith('a')
          .and(q.mail.contains('o'))
          .and(q.mail.endsWith('z'))
      )
      .toString()

    const expected =
      "$filter=startswith(mail, 'a') and contains(mail, 'o') and endswith(mail, 'z')"
    expect(actual).toBe(expected)
  })

  test('and [multilines]', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.mail.startsWith('a'))
      .filter(q => q.mail.contains('o'))
      .filter(q => q.mail.endsWith('z'))
      .toString()

    const expected =
      "$filter=startswith(mail, 'a') and contains(mail, 'o') and endswith(mail, 'z')"
    expect(actual).toBe(expected)
  })

  test('or', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q =>
        q.mail.startsWith('a').or(q.mail.contains('o')).or(q.mail.endsWith('z'))
      )
      .toString()

    const expected =
      "$filter=startswith(mail, 'a') or contains(mail, 'o') or endswith(mail, 'z')"
    expect(actual).toBe(expected)
  })

  test('or with and [inline]', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q =>
        q.givenName
          .startsWith('search')
          .and(q.surname.startsWith('search').or(q.mail.startsWith('search')))
      )
      .toString()

    const expected =
      "$filter=startswith(givenName, 'search') and (startswith(surname, 'search') or startswith(mail, 'search'))"
    expect(actual).toBe(expected)
  })

  test('or with and [multilines]', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q =>
        q.givenName
          .startsWith('search')
          .or(q.surname.startsWith('search'))
          .or(q.mail.startsWith('search'))
      )
      .filter(q => q.accountEnabled.equals(true))
      .toString()

    const expected =
      "$filter=(startswith(givenName, 'search') or startswith(surname, 'search') or startswith(mail, 'search')) and accountEnabled eq true"
    expect(actual).toBe(expected)
  })

  test('not', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.mail.startsWith('a').or(q.mail.startsWith('b')).not())
      .toString()

    const expected =
      "$filter=not (startswith(mail, 'a') or startswith(mail, 'b'))"
    expect(actual).toBe(expected)
  })
})

// alt
describe('testodataQuery filter alt', () => {
  test('alt', () => {
    const query = odataQuery<User>()
    const actual = query.filter('mail', q => q.startsWith('test')).toString()
    const expected = "$filter=startswith(mail, 'test')"
    expect(actual).toBe(expected)
  })

  test('alt or', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter('mail', q => q.startsWith('test').or(q.startsWith('ok')))
      .toString()
    const expected =
      "$filter=startswith(mail, 'test') or startswith(mail, 'ok')"
    expect(actual).toBe(expected)
  })

  test('alt and', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter('mail', q => q.startsWith('test').and(q.endsWith('.com')))
      .toString()
    const expected =
      "$filter=startswith(mail, 'test') and endswith(mail, '.com')"
    expect(actual).toBe(expected)
  })

  test('alt and [multilines]', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter('mail', q => q.startsWith('test'))
      .filter('givenName', q => q.startsWith('test'))
      .toString()

    const expected =
      "$filter=startswith(mail, 'test') and startswith(givenName, 'test')"
    expect(actual).toBe(expected)
  })
})
