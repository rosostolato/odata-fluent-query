import odataQuery from '../src/functions'

import { User } from '../models'

describe('functions', () => {
  test('select', () => {
    const result = odataQuery<User>()
      .filter((q) => q.address.street.equals('test'))
      .select('id', (x) => x.address.code)
      .toString()

    expect(result).toBe('$select=id,address/code')
  })
})
