import { User } from '../models'
import { odataQuery } from '../src'

describe('testing odataQuery select', () => {
  it('select one', () => {
    const query = odataQuery<User>()
    const actual = query.select('id').toString()
    const expected = '$select=id'
    expect(actual).toBe(expected)
  })

  it('select multiple', () => {
    const query = odataQuery<User>()
    const actual = query.select('id', 'email', 'surname').toString()
    const expected = '$select=id,email,surname'
    expect(actual).toBe(expected)
  })

  it('select with expression', () => {
    const query = odataQuery<User>()

    const actual = query
      .select(
        x => x.id,
        x => x.address.street
      )
      .toString()

    const expected = '$select=id,address/street'
    expect(actual).toBe(expected)
  })

  it('select mixed', () => {
    const query = odataQuery<User>()

    const actual = query
      .select('id', x => x.givenName, 'accountEnabled')
      .toString()

    const expected = '$select=id,givenName,accountEnabled'
    expect(actual).toBe(expected)
  })

  it('select optional', () => {
    const query = odataQuery<User>()

    const actual = query
      .select(
        x => x.givenName,
        x => x.surname
      )
      .toString()

    const expected = '$select=givenName,surname'
    expect(actual).toBe(expected)
  })

  it('remove expand after select', () => {
    const query = odataQuery<User>()
    const expandedQuery = query.expand('address')
    let actual = expandedQuery.toString()
    let expected = '$expand=address'
    expect(actual).toBe(expected)
    actual = expandedQuery.select('email').toString()
    expected = '$select=email'
    expect(actual).toBe(expected)
  })
})
