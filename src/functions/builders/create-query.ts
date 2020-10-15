import { QueryObject } from '../models/odata-query'
import { createFilter } from './create-filter'
import { createSelect } from './create-select'
import { createOrderby } from './create-orderby'
import { QueryDescriptor } from '../models/query-descriptor'
import { makeQuery } from './query-builder'

export function createQueryDescriptor(key: string = null): QueryDescriptor {
  return {
    key: key,
    skip: null,
    take: null,
    count: false,
    strict: false,
    groupAgg: null,
    filters: [],
    expands: [],
    orderby: [],
    groupby: [],
    select: [],
  }
}

export function createQuery(descriptor: QueryDescriptor): any {
  return {
    $$descriptor: descriptor,
    select: createSelect(descriptor),
    orderBy: createOrderby(descriptor),
    filter: createFilter(descriptor),

    paginate(sizeOrOptions: any, page?: number) {
      let data: {
        page?: number
        count?: boolean
        pagesize?: number
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
        queryDescriptor.skip = null
      }

      return createQuery(queryDescriptor)
    },

    expand(key: string, query?: Function) {
      let expand = createQuery(createQueryDescriptor(key))

      if (query) {
        expand = query(expand)
      }

      const newDescriptor: QueryDescriptor = {
        ...descriptor,
        expands: descriptor.expands.concat(expand.$$descriptor),
      }

      return createQuery(newDescriptor)
    },

    toString(): string {
      return makeQuery(descriptor)
        .map((p) => `${p.key}=${p.value}`)
        .join('&')
    },

    toObject(): QueryObject {
      return makeQuery(descriptor).reduce((obj, x) => {
        obj[x.key] = x.value
        return obj
      }, {})
    },
  }
}
