import { odataQuery } from '../src/functions'
import { User } from '../models'

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
})
