import { QueryObject } from '../models/odata-query'
import { createFilter } from './create-filter'
import { createSelect } from './create-select'
import { createOrderby } from './create-orderby'
import { QueryDescriptor } from '../models/query-descriptor'

export interface KeyValue<T> {
  key: string
  value: T
}

export function makeQuery(qd: QueryDescriptor): KeyValue<string>[] {
  let params: {
    key: string
    value: string
  }[] = []

  if (qd.filters.length) {
    if (qd.filters.length > 1) {
      params.push({
        key: '$filter',
        value: `${qd.filters.map(makeQueryParentheses).join(' and ')}`,
      })
    } else {
      params.push({
        key: '$filter',
        value: `${qd.filters.join()}`,
      })
    }
  }

  if (qd.groupby.length) {
    let group = `groupby((${qd.groupby.join(',')})`

    if (qd.groupAgg) {
      group += `,aggregate(${qd.groupAgg})`
    }

    params.push({
      key: '$apply',
      value: group + ')',
    })
  }

  if (qd.expands.length) {
    params.push({
      key: '$expand',
      value: `${qd.expands.map(makeRelationQuery).join(',')}`,
    })
  }

  if (qd.select.length) {
    params.push({
      key: '$select',
      value: `${qd.select.join(',')}`,
    })
  }

  if (qd.orderby.length) {
    params.push({
      key: '$orderby',
      value: `${qd.orderby.pop()}`,
    })
  }

  if (qd.skip != null) {
    params.push({
      key: '$skip',
      value: `${qd.skip}`,
    })
  }

  if (qd.take != null) {
    params.push({
      key: '$top',
      value: `${qd.take}`,
    })
  }

  if (qd.count == true) {
    params.push({
      key: '$count',
      value: `true`,
    })
  }

  return params
}

export function makeQueryParentheses(query: string): string {
  if (query.indexOf(' or ') > -1 || query.indexOf(' and ') > -1) {
    return `(${query})`
  }

  return query
}

export function makeRelationQuery(rqd: QueryDescriptor): string {
  let expand: string = rqd.key

  if (rqd.strict) {
    expand += '!'
  }

  if (
    rqd.filters.length ||
    rqd.orderby.length ||
    rqd.select.length ||
    rqd.expands.length ||
    rqd.skip != null ||
    rqd.take != null ||
    rqd.count != false
  ) {
    expand += `(`

    let operators = []

    if (rqd.skip != null) {
      operators.push(`$skip=${rqd.skip}`)
    }

    if (rqd.take != null) {
      operators.push(`$top=${rqd.take}`)
    }

    if (rqd.count == true) {
      operators.push(`$count=true`)
    }

    if (rqd.orderby.length) {
      operators.push(`$orderby=${rqd.orderby.join(',')}`)
    }

    if (rqd.select.length) {
      operators.push(`$select=${rqd.select.join(',')}`)
    }

    if (rqd.filters.length) {
      if (rqd.filters.length > 1) {
        operators.push(
          `$filter=${rqd.filters.map(makeQueryParentheses).join(' and ')}`
        )
      } else {
        operators.push(`$filter=${rqd.filters.join()}`)
      }
    }

    if (rqd.expands.length) {
      operators.push(`$expand=${rqd.expands.map(makeRelationQuery).join(',')}`)
    }

    expand += operators.join(';') + ')'
  }

  return expand
}

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
