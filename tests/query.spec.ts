import { User } from '../models'
import { odataQuery } from '../src'

describe('testing ODataQuery', () => {
  it('count', () => {
    const query = odataQuery<User>()
    const actual = query.count().toString()
    const expected = '$count=true'
    expect(actual).toBe(expected)
  })

  it('toString', () => {
    const query = odataQuery<User>()
    const actual = query.toString()
    const expected = ''
    expect(actual).toBe(expected)
  })

  it('toObject', () => {
    const query = odataQuery<User>()
    const actual = query.toObject()
    const expected = {}
    expect(actual).toStrictEqual(expected)
  })

  it('complete toObject', () => {
    const query = odataQuery<User>()
    const actual = query
      .filter(q => q.email.contains('test'))
      .expand('address')
      .orderBy('email')
      .count()
      .toObject()
    const expected = {
      $count: 'true',
      $expand: 'address',
      $filter: "contains(email, 'test')",
      $orderby: 'email',
    }
    expect(actual).toStrictEqual(expected)
  })
})
