import { odataQuery } from '../src'
import { dateToObject } from '../src/builders/create-filter'
import { User } from './data/user'

// string
describe('test odataQuery filter by string', () => {
  it('contains', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.email.contains('test')).toString()
    const expected = "$filter=contains(email, 'test')"
    expect(actual).toBe(expected)
  })

  it('contains caseInsensitive', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.email.contains('test', { caseInsensitive: true }))
      .toString()
    const expected = "$filter=contains(tolower(email), 'test')"
    expect(actual).toBe(expected)
  })

  it('endsWith', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.email.endsWith('test')).toString()
    const expected = "$filter=endswith(email, 'test')"
    expect(actual).toBe(expected)
  })

  it('endsWith caseInsensitive', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.email.endsWith('test', { caseInsensitive: true }))
      .toString()
    const expected = "$filter=endswith(tolower(email), 'test')"
    expect(actual).toBe(expected)
  })

  it('equals', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.email.equals('test')).toString()
    const expected = "$filter=email eq 'test'"
    expect(actual).toBe(expected)
  })

  it('equals caseInsensitive', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.email.equals('test', { caseInsensitive: true }))
      .toString()
    const expected = "$filter=tolower(email) eq 'test'"
    expect(actual).toBe(expected)
  })

  it('notEquals', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.email.notEquals('test')).toString()
    const expected = "$filter=email ne 'test'"
    expect(actual).toBe(expected)
  })

  it('not equals caseInsensitive', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.email.notEquals('test', { caseInsensitive: true }))
      .toString()
    const expected = "$filter=tolower(email) ne 'test'"
    expect(actual).toBe(expected)
  })

  it('isNull', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.surname.isNull()).toString()
    const expected = '$filter=surname eq null'
    expect(actual).toBe(expected)
  })

  it('notNull', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.surname.notNull()).toString()
    const expected = '$filter=surname ne null'
    expect(actual).toBe(expected)
  })

  it('startsWith', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.email.startsWith('test')).toString()
    const expected = "$filter=startswith(email, 'test')"
    expect(actual).toBe(expected)
  })

  it('startsWith caseInsensitive', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.email.startsWith('test', { caseInsensitive: true }))
      .toString()
    const expected = "$filter=startswith(tolower(email), 'test')"
    expect(actual).toBe(expected)
  })

  it('string in array', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.givenName.in(['foo', 'bar'])).toString()
    const expected = "$filter=givenName in ('foo','bar')"
    expect(actual).toBe(expected)
  })

  it('length', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.givenName.length().equals(1)).toString()
    const expected = '$filter=length(givenName) eq 1'
    expect(actual).toBe(expected)
  })

  it('tolower toupper', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.givenName.tolower().notEquals(q.givenName.toupper()))
      .toString()
    const expected = '$filter=tolower(givenName) ne toupper(givenName)'
    expect(actual).toBe(expected)
  })

  it('trim', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.givenName.trim().equals('bar'))
      .toString()
    const expected = "$filter=trim(givenName) eq 'bar'"
    expect(actual).toBe(expected)
  })

  it('indexof', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.givenName.indexof('bar').equals(-1))
      .toString()
    const expected = "$filter=indexof(givenName, 'bar') eq -1"
    expect(actual).toBe(expected)
  })

  it('substring', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.givenName.substring(0).equals('bar'))
      .toString()
    const expected = "$filter=substring(givenName, 0) eq 'bar'"
    expect(actual).toBe(expected)
  })

  it('concat', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.givenName.append('foo').prepend('bar').notEquals('bar'))
      .toString()
    const expected = "$filter=concat('bar', concat(givenName, 'foo')) ne 'bar'"
    expect(actual).toBe(expected)
  })

  it('combined functions', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q =>
        q.address.street
          .tolower()
          .append('foo')
          .prepend('bar')
          .contains(q.address.street.tolower()),
      )
      .toString()
    const expected =
      "$filter=contains(concat('bar', concat(tolower(address/street), 'foo')), tolower(address/street))"
    expect(actual).toBe(expected)
  })
})

// guid
describe('test odataQuery filter by guid', () => {
  it('equals', () => {
    const query = odataQuery<User>()
    const guid = '003b63b4-e0b0-40db-8d5f-fb388bf0eabc'
    const actual = query.filter(q => q.email.equals(guid)).toString()
    const expected = `$filter=email eq ${guid}`
    expect(actual).toBe(expected)
  })

  it('notEquals', () => {
    const query = odataQuery<User>()
    const guid = '003b63b4-e0b0-40db-8d5f-fb388bf0eabc'
    const actual = query.filter(q => q.email.notEquals(guid)).toString()
    const expected = `$filter=email ne ${guid}`
    expect(actual).toBe(expected)
  })

  it('guid as string', () => {
    const query = odataQuery<User>()
    const guid = '003b63b4-e0b0-40db-8d5f-fb388bf0eabc'
    const actual = query
      .filter(q => q.email.equals(guid, { ignoreGuid: true }))
      .toString()
    const expected = `$filter=email eq '${guid}'`
    expect(actual).toBe(expected)
  })
})

// number
describe('test odataQuery filter by number', () => {
  it('biggerThan', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.biggerThan(5)).toString()
    const expected = '$filter=id gt 5'
    expect(actual).toBe(expected)
  })

  it('lessThan', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.lessThan(5)).toString()
    const expected = '$filter=id lt 5'
    expect(actual).toBe(expected)
  })

  it('biggerThanOrEqual', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.biggerThanOrEqual(5)).toString()
    const expected = '$filter=id ge 5'
    expect(actual).toBe(expected)
  })

  it('lessThanOrEqual', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.lessThanOrEqual(5)).toString()
    const expected = '$filter=id le 5'
    expect(actual).toBe(expected)
  })

  it('equals', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.equals(5)).toString()
    const expected = '$filter=id eq 5'
    expect(actual).toBe(expected)
  })

  it('notEquals', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.notEquals(5)).toString()
    const expected = '$filter=id ne 5'
    expect(actual).toBe(expected)
  })

  it('isNull', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.age.isNull()).toString()
    const expected = '$filter=age eq null'
    expect(actual).toBe(expected)
  })

  it('notNull', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.age.notNull()).toString()
    const expected = '$filter=age ne null'
    expect(actual).toBe(expected)
  })

  it('number in array', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.in([5, 10])).toString()
    const expected = '$filter=id in (5,10)'
    expect(actual).toBe(expected)
  })
})

// boolean
describe('test odataQuery filter by boolean', () => {
  it('equals', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.accountEnabled.equals(true)).toString()
    const expected = '$filter=accountEnabled eq true'
    expect(actual).toBe(expected)
  })

  it('notEquals', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.accountEnabled.notEquals(true))
      .toString()
    const expected = '$filter=accountEnabled ne true'
    expect(actual).toBe(expected)
  })
})

// Date
describe('test odataQuery filter by Date', () => {
  it('inTimeSpan', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.createDate.inTimeSpan(2020)).toString()
    const expected = '$filter=(year(createDate) eq 2020)'
    expect(actual).toBe(expected)
  })

  it('inTimeSpan full date', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.inTimeSpan(2020, 10, 14, 6, 30))
      .toString()
    const expected =
      '$filter=(year(createDate) eq 2020) and (month(createDate) eq 10) and (day(createDate) eq 14) and (hour(createDate) eq 6) and (minute(createDate) eq 30)'
    expect(actual).toBe(expected)
  })

  it('isAfter', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isAfter(new Date(2020, 0)))
      .toString()
    const expected = '$filter=createDate gt 2020-01-01T'
    expect(actual.indexOf(expected)).toBeGreaterThan(-1)
  })

  it('isBefore', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isBefore(new Date(2020, 0)))
      .toString()
    const expected = '$filter=createDate lt 2020-01-01T'
    expect(actual.indexOf(expected)).toBeGreaterThan(-1)
  })

  it('isAfterOrEqual', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isAfterOrEqual(new Date(2020, 0)))
      .toString()
    const expected = '$filter=createDate ge 2020-01-01T'
    expect(actual.indexOf(expected)).toBeGreaterThan(-1)
  })

  it('isBeforeOrEqual', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isBeforeOrEqual(new Date(2020, 0)))
      .toString()
    const expected = '$filter=createDate le 2020-01-01T'
    expect(actual.indexOf(expected)).toBeGreaterThan(-1)
  })

  it('isSame', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isSame(new Date(2020, 0)))
      .toString()
    const expected = '$filter=createDate eq 2020-01-01T'
    expect(actual.indexOf(expected)).toBeGreaterThan(-1)
  })

  it('equals', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.equals(new Date(2020, 0)))
      .toString()
    const expected = '$filter=createDate eq 2020-01-01T'
    expect(actual.indexOf(expected)).toBeGreaterThan(-1)
  })

  it('notEquals', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.notEquals(new Date(2020, 0)))
      .toString()
    const expected = '$filter=createDate ne 2020-01-01T'
    expect(actual.indexOf(expected)).toBeGreaterThan(-1)
  })

  it('isNull', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.lastLogin.isNull()).toString()
    const expected = '$filter=lastLogin eq null'
    expect(actual).toBe(expected)
  })

  it('notNull', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.lastLogin.notNull()).toString()
    const expected = '$filter=lastLogin ne null'
    expect(actual).toBe(expected)
  })
})

// object
describe('test odataQuery filter by object', () => {
  it('filter by nested property', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.address.code.biggerThan(5)).toString()
    const expected = '$filter=address/code gt 5'
    expect(actual).toBe(expected)
  })

  it('filter by nested property deep', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.address.user.id.biggerThan(5)).toString()
    const expected = '$filter=address/user/id gt 5'
    expect(actual).toBe(expected)
  })

  it('filter by null object property', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.surname.isNull()).toString()
    const expected = '$filter=surname eq null'
    expect(actual).toBe(expected)
  })

  it('filter by not null object property', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.lastLogin.notNull()).toString()
    const expected = '$filter=lastLogin ne null'
    expect(actual).toBe(expected)
  })
})

// array
describe('test odataQuery filter by array', () => {
  it('filter by empty array', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.phoneNumbers.empty()).toString()
    const expected = '$filter=not phoneNumbers/any()'
    expect(actual).toBe(expected)
  })

  it('filter by not empty array', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.phoneNumbers.notEmpty()).toString()
    const expected = '$filter=phoneNumbers/any()'
    expect(actual).toBe(expected)
  })

  it('filter by not empty related array', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.posts.notEmpty()).toString()
    const expected = '$filter=posts/any()'
    expect(actual).toBe(expected)
  })

  it('filter by any', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.phoneNumbers.any(x => x.equals('test')))
      .toString()
    const expected = "$filter=phoneNumbers/any(x: x eq 'test')"
    expect(actual).toBe(expected)
  })

  it('filter by any nested', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.posts.any(p => p.comments.any(c => c.isNull())))
      .toString()
    const expected = '$filter=posts/any(p: p/comments/any(c: c eq null))'
    expect(actual).toBe(expected)
  })

  it('filter by any (specific case)', () => {
    interface Product {
      productType: {
        category: {
          segmentCategories: { segmentId: number }[]
        }
      }
    }
    const selectedSegmentId = 1
    const query = odataQuery<Product>().filter(q =>
      q.productType.category.segmentCategories.any((p: any) =>
        p.segmentId.equals(selectedSegmentId),
      ),
    )
    const actual = query.toString()
    const expected =
      '$filter=productType/category/segmentCategories/any(p: p/segmentId eq 1)'
    expect(actual).toBe(expected)
  })

  it('filter by all', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.phoneNumbers.all(x => x.equals('test')))
      .toString()
    const expected = "$filter=phoneNumbers/all(x: x eq 'test')"
    expect(actual).toBe(expected)
  })

  it('filter by all nested', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.posts.all(p => p.comments.all(c => c.notNull())))
      .toString()
    const expected = '$filter=posts/all(p: p/comments/all(c: c ne null))'
    expect(actual).toBe(expected)
  })

  it('filter by null', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.posts.isNull()).toString()
    const expected = '$filter=posts eq null'
    expect(actual).toBe(expected)
  })

  it('filter by not null', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.posts.notNull()).toString()
    const expected = '$filter=posts ne null'
    expect(actual).toBe(expected)
  })
})

// by another key
describe('test odataQuery filter by another key', () => {
  it('string', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.givenName.contains(q.surname)).toString()
    const expected = '$filter=contains(givenName, surname)'
    expect(actual).toBe(expected)
  })

  it('number', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.equals(q.id)).toString()
    const expected = '$filter=id eq id'
    expect(actual).toBe(expected)
  })

  it('boolean', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.accountEnabled.notEquals(q.accountEnabled))
      .toString()
    const expected = '$filter=accountEnabled ne accountEnabled'
    expect(actual).toBe(expected)
  })

  it('Date', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isSame(q.createDate, 'day'))
      .toString()
    const expected = '$filter=day(createDate) eq day(createDate)'
    expect(actual).toBe(expected)
  })
})

// composed
describe('test odataQuery filter composed', () => {
  it('and [inline]', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q =>
        q.email
          .startsWith('a')
          .and(q.email.contains('o'))
          .and(q.email.endsWith('z')),
      )
      .toString()

    const expected =
      "$filter=startswith(email, 'a') and contains(email, 'o') and endswith(email, 'z')"
    expect(actual).toBe(expected)
  })

  it('and [multilines]', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.email.startsWith('a'))
      .filter(q => q.email.contains('o'))
      .filter(q => q.email.endsWith('z'))
      .toString()

    const expected =
      "$filter=startswith(email, 'a') and contains(email, 'o') and endswith(email, 'z')"
    expect(actual).toBe(expected)
  })

  it('or', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q =>
        q.email
          .startsWith('a')
          .or(q.email.contains('o'))
          .or(q.email.endsWith('z')),
      )
      .toString()

    const expected =
      "$filter=startswith(email, 'a') or contains(email, 'o') or endswith(email, 'z')"
    expect(actual).toBe(expected)
  })

  it('or with and [inline]', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q =>
        q.givenName
          .startsWith('search')
          .and(q.surname.startsWith('search').or(q.email.startsWith('search'))),
      )
      .toString()

    const expected =
      "$filter=startswith(givenName, 'search') and (startswith(surname, 'search') or startswith(email, 'search'))"
    expect(actual).toBe(expected)
  })

  it('or with and [multilines]', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q =>
        q.givenName
          .startsWith('search')
          .or(q.surname.startsWith('search'))
          .or(q.email.startsWith('search')),
      )
      .filter(q => q.accountEnabled.equals(true))
      .toString()

    const expected =
      "$filter=(startswith(givenName, 'search') or startswith(surname, 'search') or startswith(email, 'search')) and accountEnabled eq true"
    expect(actual).toBe(expected)
  })

  it('not', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.email.startsWith('a').or(q.email.startsWith('b')).not())
      .toString()

    const expected =
      "$filter=not (startswith(email, 'a') or startswith(email, 'b'))"
    expect(actual).toBe(expected)
  })
})

// alt
describe('test odataQuery filter alt', () => {
  it('alt', () => {
    const query = odataQuery<User>()
    const actual = query.filter('email', q => q.startsWith('test')).toString()
    const expected = "$filter=startswith(email, 'test')"
    expect(actual).toBe(expected)
  })

  it('alt or', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter('email', q => q.startsWith('test').or(q.startsWith('ok')))
      .toString()
    const expected =
      "$filter=startswith(email, 'test') or startswith(email, 'ok')"
    expect(actual).toBe(expected)
  })

  it('alt and', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter('email', q => q.startsWith('test').and(q.endsWith('.com')))
      .toString()
    const expected =
      "$filter=startswith(email, 'test') and endswith(email, '.com')"
    expect(actual).toBe(expected)
  })

  it('alt and [multilines]', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter('email', q => q.startsWith('test'))
      .filter('givenName', q => q.startsWith('test'))
      .toString()

    const expected =
      "$filter=startswith(email, 'test') and startswith(givenName, 'test')"
    expect(actual).toBe(expected)
  })
})

describe('test additional filter edge cases', () => {
  it('date isSame with number parameter', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isSame(2023, 'year'))
      .toString()
    const expected = '$filter=year(createDate) eq 2023'
    expect(actual).toBe(expected)
  })

  it('date isSame with Date parameter and grouping', () => {
    const query = odataQuery<User>()
    const testDate = new Date('2023-01-01')
    const actual = query
      .filter(q => q.createDate.isSame(testDate, 'year'))
      .toString()
    const expected = `$filter=year(createDate) eq ${testDate.getFullYear()}`
    expect(actual).toBe(expected)
  })

  it('date isSame with object reference and grouping', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isSame(q.createDate, 'year'))
      .toString()
    const expected = '$filter=year(createDate) eq year(createDate)'
    expect(actual).toBe(expected)
  })

  it('date isSame with string parameter', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isSame('2023-01-01T00:00:00.000Z'))
      .toString()
    const expected = '$filter=createDate eq 2023-01-01T00:00:00.000Z'
    expect(actual).toBe(expected)
  })

  it('boolean equals with object reference and caseInsensitive', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.email.equals(q.surname, { caseInsensitive: true }))
      .toString()
    const expected = '$filter=tolower(email) eq tolower(surname)'
    expect(actual).toBe(expected)
  })

  it('date comparison with object reference', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isAfter(q.createDate))
      .toString()
    const expected = '$filter=createDate gt createDate'
    expect(actual).toBe(expected)
  })

  it('string contains with object reference that has getPropName', () => {
    const query = odataQuery<User>()
    // Create a mock object with getPropName method to trigger that branch
    const mockProp = { _key: 'surname', getPropName: () => 'surname' }
    const actual = query
      .filter(q => q.email.contains(mockProp as any))
      .toString()
    const expected = '$filter=contains(email, surname)'
    expect(actual).toBe(expected)
  })

  it('number comparison with object reference', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.biggerThan(q.id)).toString()
    const expected = '$filter=id gt id'
    expect(actual).toBe(expected)
  })

  it('string contains with object reference and caseInsensitive', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.email.contains(q.surname, { caseInsensitive: true }))
      .toString()
    const expected = '$filter=contains(tolower(email), tolower(surname))'
    expect(actual).toBe(expected)
  })

  it('string contains with non-string object (no getPropName)', () => {
    const query = odataQuery<User>()
    const mockObj = { _key: 'surname' }
    const actual = query
      .filter(q => q.email.contains(mockObj as any))
      .toString()
    const expected = '$filter=contains(email, [object Object])'
    expect(actual).toBe(expected)
  })

  it('date comparison with string parameter', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.createDate.isAfter('2023-01-01T00:00:00.000Z'))
      .toString()
    const expected = '$filter=createDate gt 2023-01-01T00:00:00.000Z'
    expect(actual).toBe(expected)
  })
})

describe('test dateToObject function', () => {
  it('should convert string to Date object', () => {
    const dateString = '2023-01-01'
    const result = dateToObject(dateString as any) // Test the string conversion branch
    const testDate = new Date(dateString)

    expect(result.year).toBe(testDate.getFullYear())
    expect(result.month).toBe(testDate.getMonth())
  })

  it('should handle Date object directly', () => {
    const date = new Date('2023-01-01')
    const result = dateToObject(date)

    expect(result.year).toBe(date.getFullYear())
    expect(result.month).toBe(date.getMonth())
  })
})

// nullable values
describe('test odataQuery filter with nullable values', () => {
  it('should allow null value for nullable string property', () => {
    const query = odataQuery<User>()
    const querySurname: string | null = null
    const actual = query.filter(q => q.surname.equals(querySurname)).toString()
    const expected = '$filter=surname eq null'
    expect(actual).toBe(expected)
  })

  it('should allow string value for nullable string property', () => {
    const query = odataQuery<User>()
    const queryEmail: string | null = 'test@example.com'
    const actual = query.filter(q => q.email.equals(queryEmail)).toString()
    const expected = "$filter=email eq 'test@example.com'"
    expect(actual).toBe(expected)
  })

  it('should allow null value for nullable number property', () => {
    const query = odataQuery<User>()
    const queryNumber: number | null = null
    const actual = query.filter(q => q.age.equals(queryNumber)).toString()
    const expected = '$filter=age eq null'
    expect(actual).toBe(expected)
  })

  it('should allow number value for nullable number property', () => {
    const query = odataQuery<User>()
    const queryId: number | null = 42
    const actual = query.filter(q => q.id.equals(queryId)).toString()
    const expected = '$filter=id eq 42'
    expect(actual).toBe(expected)
  })

  it('should allow null value for nullable date property', () => {
    const query = odataQuery<User>()
    const queryDate: Date | null = null
    const actual = query.filter(q => q.lastLogin.equals(queryDate)).toString()
    const expected = '$filter=lastLogin eq null'
    expect(actual).toBe(expected)
  })

  it('should allow date value for nullable date property', () => {
    const query = odataQuery<User>()
    const queryDate = new Date('2023-01-01T00:00:00.000Z')
    const actual = query.filter(q => q.createDate.equals(queryDate)).toString()
    const expected = '$filter=createDate eq 2023-01-01T00:00:00.000Z'
    expect(actual).toBe(expected)
  })

  it('should allow null value with notEquals for nullable property', () => {
    const query = odataQuery<User>()
    const queryStr: string | null = null
    const actual = query.filter(q => q.surname.notEquals(queryStr)).toString()
    const expected = '$filter=surname ne null'
    expect(actual).toBe(expected)
  })

  it('should work with variables in nullable context', () => {
    const query = odataQuery<User>()
    const searchEmail: string | null = 'user@example.com'
    const searchId: number | null = 123

    const actual = query
      .filter(q => q.email.equals(searchEmail))
      .filter(q => q.id.equals(searchId))
      .toString()

    const expected = "$filter=email eq 'user@example.com' and id eq 123"
    expect(actual).toBe(expected)
  })

  it('should work with mixed null and non-null values', () => {
    const query = odataQuery<User>()
    const searchStr: string | null = null
    const isEnabled: boolean = true

    const actual = query
      .filter(q => q.surname.equals(searchStr))
      .filter(q => q.accountEnabled.equals(isEnabled))
      .toString()

    const expected = '$filter=surname eq null and accountEnabled eq true'
    expect(actual).toBe(expected)
  })

  it('should work with the original problematic code from user', () => {
    const query = odataQuery<User>()
    const queryStr: string | null = null
    // This was the original problem - should now work without needing isNull()
    const filteredQuery = query.filter(q => q.surname.equals(queryStr))

    const actual = filteredQuery.toString()
    const expected = '$filter=surname eq null'
    expect(actual).toBe(expected)
  })
})

describe('undefined value rejection', () => {
  it('should throw error when trying to filter by undefined value', () => {
    const query = odataQuery<User>()
    const undefinedValue: any = undefined

    expect(() => {
      query.filter(q => q.email.equals(undefinedValue))
    }).toThrow(
      'Cannot filter by undefined value. OData only supports null values. Use null instead of undefined, or use .isNull() method for nullable checks.',
    )
  })

  it('should throw error for undefined in number filter', () => {
    const query = odataQuery<User>()
    const undefinedValue: any = undefined

    expect(() => {
      query.filter(q => q.id.equals(undefinedValue))
    }).toThrow(
      'Cannot filter by undefined value. OData only supports null values. Use null instead of undefined, or use .isNull() method for nullable checks.',
    )
  })
})
