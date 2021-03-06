import { User } from '../models'
import { odataQuery } from '../src'

describe('testing odataQuery select', () => {
  test('select one', () => {
    const query = odataQuery<User>()
    const actual = query.select('id').toString()
    const expected = '$select=id'
    expect(actual).toBe(expected)
  })

  test('select multiple', () => {
    const query = odataQuery<User>()
    const actual = query.select('id', 'mail', 'surname').toString()
    const expected = '$select=id,mail,surname'
    expect(actual).toBe(expected)
  })

  test('select with expression', () => {
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

  test('select mixed', () => {
    const query = odataQuery<User>()

    const actual = query
      .select('id', x => x.givenName, 'accountEnabled')
      .toString()

    const expected = '$select=id,givenName,accountEnabled'
    expect(actual).toBe(expected)
  })

  test('select optional', () => {
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
})
