import { odataQuery } from '../src'
import { User } from './data/user'

describe('testing ODataQuery orderby', () => {
  it('orderby', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy(q => q.email).toString()
    const expected = '$orderby=email'
    expect(actual).toBe(expected)
  })

  it('orderby alt', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy('email').toString()
    const expected = '$orderby=email'
    expect(actual).toBe(expected)
  })

  it('orderby asc', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy(q => q.email.asc()).toString()
    const expected = '$orderby=email asc'
    expect(actual).toBe(expected)
  })

  it('orderby asc alt', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy('email', 'asc').toString()
    const expected = '$orderby=email asc'
    expect(actual).toBe(expected)
  })

  it('orderby desc', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy(q => q.email.desc()).toString()
    const expected = '$orderby=email desc'
    expect(actual).toBe(expected)
  })

  it('orderby desc alt', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy('email', 'desc').toString()
    const expected = '$orderby=email desc'
    expect(actual).toBe(expected)
  })

  it('orderby nested', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy(q => q.address.street).toString()
    const expected = '$orderby=address/street'
    expect(actual).toBe(expected)
  })

  it('orderby nested array', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy(q => q.posts.id).toString()
    const expected = '$orderby=posts/id'
    expect(actual).toBe(expected)
  })

  it('orderby multiple', () => {
    const query = odataQuery<User>()
    const actual = query
      .orderBy(q => q.address.street.asc())
      .orderBy(q => q.address2.street.desc())
      .toString()
    const expected = '$orderby=address/street asc, address2/street desc'
    expect(actual).toBe(expected)
  })
})
