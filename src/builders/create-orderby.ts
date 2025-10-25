import { OrderByProxy } from '../models/internal/orderby-internal'
import { QueryDescriptor } from '../models/internal/common-internal'
import { createQuery } from './create-query'

function makeOrderby(key = ''): OrderByProxy {
  if (key[0] === '/') {
    key = key.slice(1)
  }

  const methods = {
    _key: key,
    asc: () => makeOrderby(`${key} asc`),
    desc: () => makeOrderby(`${key} desc`),
  }

  return new Proxy(
    {} as OrderByProxy,
    {
      get(_, prop) {
        return methods[prop as keyof typeof methods] || makeOrderby(`${key}/${String(prop)}`)
      },
    }
  )
}

export function createOrderby(descriptor: QueryDescriptor) {
  return (keyOrExp: string | number | symbol | ((exp: OrderByProxy) => OrderByProxy), order?: 'asc' | 'desc') => {
    let expr =
      typeof keyOrExp === 'string'
        ? makeOrderby(keyOrExp)
        : (keyOrExp as (exp: OrderByProxy) => OrderByProxy)(makeOrderby())

    if (order) {
      expr = expr[order]()
    }

    return createQuery({
      ...descriptor,
      orderby: descriptor.orderby.concat(expr._key),
    })
  }
}
