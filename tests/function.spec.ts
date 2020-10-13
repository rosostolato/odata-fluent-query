import odataQuery from '../src/functions'

import { User } from '../models'

describe('functions', () => {
  test('select', () => {
    const result = odataQuery<User>()
      .filter((q) => q.phoneNumbers.any((x) => x.equals('+55')))
      .select('id', (x) => x.address.code)
      .toString()

    expect(result).toBe('$select=id,address/code')
  })
})
