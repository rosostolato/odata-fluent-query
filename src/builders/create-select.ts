import { SelectBuilder, SelectExpression } from '../models'
import { QueryDescriptor } from '../models/internal/common-internal'
import { createQuery } from './create-query'

function makeSelect(key = ''): SelectBuilder<unknown> {
  return new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === '_key') return key.slice(1)
        return makeSelect(`${key}/${String(prop)}`)
      },
    },
  )
}

export function createSelect(descriptor: QueryDescriptor) {
  return (
    ...keys: Array<
      PropertyKey | ((exp: SelectBuilder<unknown>) => SelectExpression)
    >
  ) => {
    const _keys = keys
      .map(keyOrExp => {
        if (typeof keyOrExp === 'function') {
          const exp = keyOrExp(makeSelect()) as SelectExpression & {
            _key: string
          }
          return exp._key
        } else {
          return String(keyOrExp)
        }
      })
      .filter((key, i, arr) => arr.indexOf(key) === i)

    return createQuery({
      ...descriptor,
      select: _keys,
    })
  }
}
