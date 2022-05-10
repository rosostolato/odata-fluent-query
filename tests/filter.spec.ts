import { User } from '../models'
import { odataQuery } from '../src'

// string
describe('testodataQuery filter by string', () => {
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

  it('equals null', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.email.equals(null)).toString()
    const expected = '$filter=email eq null'
    expect(actual).toBe(expected)
  })

  it('notEquals null', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.email.notEquals(null)).toString()
    const expected = '$filter=email ne null'
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
})

// guid
describe('testodataQuery filter by guid', () => {
  it('equals', () => {
    const query = odataQuery<User>()
    const guid = '003b63b4-e0b0-40db-8d5f-fb388bf0eabc'
    const actual = query.filter(q => q.email.equals(guid)).toString()
    const expected = '$filter=email eq ' + guid
    expect(actual).toBe(expected)
  })

  it('notEquals', () => {
    const query = odataQuery<User>()
    const guid = '003b63b4-e0b0-40db-8d5f-fb388bf0eabc'
    const actual = query.filter(q => q.email.notEquals(guid)).toString()
    const expected = '$filter=email ne ' + guid
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
describe('testodataQuery filter by number', () => {
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

  it('biggerOrEqualThan', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.biggerOrEqualThan(5)).toString()
    const expected = '$filter=id ge 5'
    expect(actual).toBe(expected)
  })

  it('lessOrEqualThan', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.lessOrEqualThan(5)).toString()
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

  it('eq null', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.equals(null)).toString()
    const expected = '$filter=id eq null'
    expect(actual).toBe(expected)
  })

  it('not eq null', () => {
    const query = odataQuery<User>()
    const actual = query.filter(q => q.id.notEquals(null)).toString()
    const expected = '$filter=id ne null'
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
describe('testodataQuery filter by boolean', () => {
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
describe('testodataQuery filter by Date', () => {
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
})

// object
describe('testodataQuery filter by object', () => {
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
})

// object
describe('testodataQuery filter by array', () => {
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
      .filter(q => q.posts.any(p => p.comments.any(c => c.equals(null))))
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
        p.segmentId.equals(selectedSegmentId)
      )
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
      .filter(q => q.posts.all(p => p.comments.all(c => c.notEquals(null))))
      .toString()
    const expected = '$filter=posts/all(p: p/comments/all(c: c ne null))'
    expect(actual).toBe(expected)
  })
})

// by another key
describe('testodataQuery filter by another key', () => {
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
describe('testodataQuery filter composed', () => {
  it('and [inline]', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q =>
        q.email
          .startsWith('a')
          .and(q.email.contains('o'))
          .and(q.email.endsWith('z'))
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
          .or(q.email.endsWith('z'))
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
          .and(q.surname.startsWith('search').or(q.email.startsWith('search')))
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
          .or(q.email.startsWith('search'))
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
describe('testodataQuery filter alt', () => {
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
