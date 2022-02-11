import { User } from '../models'
import { odataQuery } from '../src'

describe('testing ODataQuery orderby', () => {
  it('orderby', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy(q => q.mail).toString()
    const expected = '$orderby=mail'
    expect(actual).toBe(expected)
  })

  it('orderby alt', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy('mail').toString()
    const expected = '$orderby=mail'
    expect(actual).toBe(expected)
  })

  it('orderby asc', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy(q => q.mail.asc()).toString()
    const expected = '$orderby=mail asc'
    expect(actual).toBe(expected)
  })

  it('orderby asc alt', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy('mail', 'asc').toString()
    const expected = '$orderby=mail asc'
    expect(actual).toBe(expected)
  })

  it('orderby desc', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy(q => q.mail.desc()).toString()
    const expected = '$orderby=mail desc'
    expect(actual).toBe(expected)
  })

  it('orderby desc alt', () => {
    const query = odataQuery<User>()
    const actual = query.orderBy('mail', 'desc').toString()
    const expected = '$orderby=mail desc'
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
