import { createQuery } from './create-query'
import { QueryDescriptor } from '../models/query-descriptor'

function makeSelect(key = '') {
  return new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === '$$key') return key.slice(1)
        return makeSelect(`${key}/${String(prop)}`)
      },
    }
  )
}

export function createSelect(descriptor: QueryDescriptor): any {
  return (...keys: any[]) => {
    const _keys = keys
      .map((keyOrExp) => {
        if (typeof keyOrExp === 'function') {
          const exp: any = keyOrExp(makeSelect())
          return exp.$$key
        } else {
          return String(keyOrExp)
        }
      })
      .filter((k, i, arr) => arr.indexOf(k) === i) // unique

    return createQuery({
      ...descriptor,
      select: _keys,
      expands: descriptor.expands.filter((e) =>
        _keys.some((k) => e.key == String(k))
      ),
    })
  }
}
