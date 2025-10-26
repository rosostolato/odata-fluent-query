import { QueryDescriptor } from '../models/internal/common-internal'
import { ExpandBuilder, ExpandExpressionWithKey } from '../models/query-expand'
import { createQuery, createQueryDescriptor } from './create-query'

function makeExpand(key = ''): ExpandBuilder<unknown> {
  return new Proxy(
    {},
    {
      get(_, prop) {
        if (prop === '_key') return key.slice(1)
        return makeExpand(`${key}/${String(prop)}`)
      },
    },
  )
}

export function createExpand(
  descriptor: QueryDescriptor,
): ExpandBuilder<unknown> {
  return (
    keyOrExp:
      | string
      | ((exp: ExpandBuilder<unknown>) => ExpandExpressionWithKey),
    query?: Function,
  ) => {
    let key: string = ''

    if (typeof keyOrExp === 'function') {
      const exp = keyOrExp(makeExpand())
      key = exp._key
    } else {
      key = String(keyOrExp)
    }

    const expand = createQuery(createQueryDescriptor(key))
    const result = query?.(expand) || expand
    const newDescriptor: QueryDescriptor = {
      ...descriptor,
      expands: descriptor.expands.concat(result._descriptor),
    }

    return createQuery(newDescriptor)
  }
}
