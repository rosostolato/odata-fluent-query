import odataQuery from '../src/functions'

import { User } from '../models'

describe('functions', () => {
  test('select', () => {
    const result = odataQuery<User>()
      .select('id', (x) => x.address.code)
      .orderBy((x) => x.address.street.desc())
      .toString()

    expect(result).toBe('$select=id,address/code')
  })
})
