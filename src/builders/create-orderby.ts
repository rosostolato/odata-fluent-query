import { QueryDescriptor } from '../models'
import { createQuery } from './create-query'

function makeOrderby(key = ''): InstanceType<typeof Proxy> {
  if (key[0] === '/') {
    key = key.slice(1)
  }

  const methods = {
    _key: key,
    asc: () => makeOrderby(`${key} asc`),
    desc: () => makeOrderby(`${key} desc`),
  }

  return new Proxy(
    {},
    {
      get(_, prop) {
        return methods[prop as keyof typeof methods] || makeOrderby(`${key}/${String(prop)}`)
      },
    }
  )
}

export function createOrderby(descriptor: QueryDescriptor) {
  return (keyOrExp: any, order?: 'asc' | 'desc') => {
    let expr =
      typeof keyOrExp === 'string'
        ? makeOrderby(keyOrExp)
        : keyOrExp(makeOrderby())

    if (order) {
      expr = expr[order]()
    }

    return createQuery({
      ...descriptor,
      orderby: descriptor.orderby.concat(expr['_key']),
    })
  }
}
