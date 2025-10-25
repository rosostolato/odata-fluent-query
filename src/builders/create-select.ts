import { ProxyInstance, QueryDescriptor } from '../models'
import { createQuery } from './create-query'

function makeSelect(key = ''): ProxyInstance {
  return new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === '_key') return key.slice(1)
        return makeSelect(`${key}/${String(prop)}`)
      },
    }
  )
}

export function createSelect(descriptor: QueryDescriptor) {
  return (...keys: any[]  ) => {
    const _keys = keys
      .map(keyOrExp => {
        if (typeof keyOrExp === 'function') {
          const exp = keyOrExp(makeSelect())
          return exp._key
        } else {
          return String(keyOrExp)
        }
      })
      .filter((k, i, arr) => arr.indexOf(k) === i) // unique
    return createQuery({
      ...descriptor,
      select: _keys,
    })
  }
}
