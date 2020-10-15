import { odataQuery } from '../src'
import { User } from '../models'

describe('testing ODataQuery orderby', () => {
  test('orderby', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy(q => q.mail).toString()
    const expected = '$orderby=mail'
    expect(actual).toBe(expected)
  })

  test('orderby alt', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy('mail').toString()
    const expected = '$orderby=mail'
    expect(actual).toBe(expected)
  })

  test('orderby asc', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy(q => q.mail.asc()).toString()
    const expected = '$orderby=mail asc'
    expect(actual).toBe(expected)
  })

  test('orderby asc alt', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy('mail', 'asc').toString()
    const expected = '$orderby=mail asc'
    expect(actual).toBe(expected)
  })

  test('orderby desc', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy(q => q.mail.desc()).toString()
    const expected = '$orderby=mail desc'
    expect(actual).toBe(expected)
  })

  test('orderby desc alt', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy('mail', 'desc').toString()
    const expected = '$orderby=mail desc'
    expect(actual).toBe(expected)
  })

  test('orderby nested', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy(q => q.address.street).toString()
    const expected = '$orderby=address/street'
    expect(actual).toBe(expected)
  })

  test('orderby nested array', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy(q => q.posts.id).toString()
    const expected = '$orderby=posts/id'
    expect(actual).toBe(expected)
  })
})
