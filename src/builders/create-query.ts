import { QueryObject } from '../models'
import { QueryDescriptor } from '../models/internal/common-internal'
import { createCompute } from './create-compute'
import { createExpand } from './create-expand'
import { createFilter } from './create-filter'
import { createGroupby } from './create-groupby'
import { createOrderby } from './create-orderby'
import { createPaginate } from './create-paginate'
import { createSearch } from './create-search'
import { createSelect } from './create-select'
import { makeQuery } from './query-builder'

export function createQueryDescriptor(key?: string): QueryDescriptor {
  return {
    key: key ?? null,
    count: false,
    filters: [],
    expands: [],
    orderby: [],
    groupby: [],
    select: [],
    compute: [],
  }
}

export function createQuery(descriptor: QueryDescriptor): any {
  return {
    _descriptor: descriptor,
    expand: createExpand(descriptor),
    filter: createFilter(descriptor),
    groupBy: createGroupby(descriptor),
    orderBy: createOrderby(descriptor),
    paginate: createPaginate(descriptor),
    search: createSearch(descriptor),
    select: createSelect(descriptor),
    compute: createCompute(descriptor),
    count() {
      return createQuery({
        ...descriptor,
        count: true,
      })
    },
    type: {}, // Empty object for TypeScript type inference only
    toObject(): QueryObject {
      return makeQuery(descriptor).reduce((obj, x) => {
        obj[x.key as keyof QueryObject] = x.value
        return obj
      }, {} as QueryObject)
    },
    toString(): string {
      return makeQuery(descriptor)
        .map(p => `${p.key}=${p.value}`)
        .join('&')
    },
  }
}
