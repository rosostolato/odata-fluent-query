import { QueryDescriptor, QueryObject } from '../models'
import { createCompute } from './create-compute'
import { createExpand } from './create-expand'
import { createFilter } from './create-filter'
import { createGroupby } from './create-groupby'
import { createOrderby } from './create-orderby'
import { createPaginate } from './create-paginate'
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
    select: createSelect(descriptor),
    compute: createCompute(descriptor),
    count() {
      return createQuery({
        ...descriptor,
        count: true,
      })
    },
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
