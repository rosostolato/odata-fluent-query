import { QueryDescriptor, QueryObject } from '../models'
import { createFilter } from './create-filter'
import { createGroupby } from './create-groupby'
import { createOrderby } from './create-orderby'
import { createSelect } from './create-select'
import { makeQuery } from './query-builder'

export function createQueryDescriptor(key?: string): QueryDescriptor {
  return {
    key: key,
    skip: undefined,
    take: undefined,
    count: false,
    aggregator: undefined,
    filters: [],
    expands: [],
    orderby: [],
    groupby: [],
    select: [],
  }
}

export function createQuery(descriptor: QueryDescriptor): any {
  return {
    _descriptor: descriptor,
    select: createSelect(descriptor),
    orderBy: createOrderby(descriptor),
    filter: createFilter(descriptor),
    groupBy: createGroupby(descriptor),

    count() {
      return createQuery({
        ...descriptor,
        count: true,
      })
    },

    paginate(sizeOrOptions: any, page: number) {
      let data: {
        page: number
        count?: boolean
        pagesize: number
      }

      if (typeof sizeOrOptions === 'number') {
        data = {
          page: page,
          count: true,
          pagesize: sizeOrOptions,
        }
      } else {
        data = sizeOrOptions

        if (data.count === undefined) {
          data.count = true
        }
      }

      const queryDescriptor: QueryDescriptor = {
        ...descriptor,
        take: data.pagesize,
        skip: data.pagesize * data.page,
        count: data.count,
      }

      if (!queryDescriptor.skip) {
        queryDescriptor.skip = undefined
      }

      return createQuery(queryDescriptor)
    },

    expand(key: string, query?: Function) {
      const expand = createQuery(createQueryDescriptor(key))
      const result = query?.(expand) || expand

      const newDescriptor: QueryDescriptor = {
        ...descriptor,
        expands: descriptor.expands.concat(result._descriptor),
      }

      return createQuery(newDescriptor)
    },

    toString(): string {
      return makeQuery(descriptor)
        .map(p => `${p.key}=${p.value}`)
        .join('&')
    },

    toObject(): QueryObject {
      return makeQuery(descriptor).reduce((obj, x) => {
        obj[x.key] = x.value
        return obj
      }, {} as QueryObject)
    },
  }
}
