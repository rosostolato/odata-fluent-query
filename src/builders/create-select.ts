import { QueryDescriptor } from '../models'
import { createQuery } from './create-query'

function makeSelect(key = ''): any {
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
  return (...keys: any[]) => {
    const _keys = keys
      .map(keyOrExp => {
        if (typeof keyOrExp === 'function') {
          const exp: any = keyOrExp(makeSelect())
          return exp._key
        } else {
          return String(keyOrExp)
        }
      })
      .filter((k, i, arr) => arr.indexOf(k) === i) // unique
    return createQuery({
      ...descriptor,
      select: _keys,
      expands: descriptor.expands.filter(e =>
        _keys.some(k => e.key == String(k))
      ),
    })
  }
}
