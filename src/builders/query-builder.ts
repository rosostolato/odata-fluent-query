import { QueryDescriptor } from '../models'

export interface KeyValue<T> {
  key: string
  value: T
}

export function makeQuery(qd: QueryDescriptor): KeyValue<string>[] {
  const params: {
    key: string
    value: string
  }[] = []

  // Helper function to add a parameter
  const addParam = (key: string, value: string) => {
    params.push({ key, value })
  }

  // Use consistent order regardless of input order (since OData spec says order is insignificant)
  if (qd.filters.length) {
    if (qd.filters.length > 1) {
      addParam(
        '$filter',
        `${qd.filters.map(makeQueryParentheses).join(' and ')}`
      )
    } else {
      addParam('$filter', `${qd.filters.join()}`)
    }
  }

  if (qd.groupby.length) {
    let group = `groupby((${qd.groupby.join(', ')})`
    if (qd.aggregator) {
      group += `, aggregate(${qd.aggregator})`
    }
    addParam('$apply', group + ')')
  }

  if (qd.expands.length) {
    addParam('$expand', `${qd.expands.map(makeRelationQuery).join(',')}`)
  }

  if (qd.select.length) {
    addParam('$select', `${qd.select.join(',')}`)
  }

  if (qd.orderby.length) {
    addParam('$orderby', `${qd.orderby.join(', ')}`)
  }

  if (qd.skip != null) {
    addParam('$skip', `${qd.skip}`)
  }

  if (qd.take != null) {
    addParam('$top', `${qd.take}`)
  }

  if (qd.count == true) {
    addParam('$count', 'true')
  }

  if (qd.compute.length) {
    addParam('$compute', `${qd.compute.join(',')}`)
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
  if (!rqd.key) {
    throw new Error('Query descriptor for expand must have a key')
  }
  let expand: string = rqd.key

  if (
    rqd.filters.length ||
    rqd.orderby.length ||
    rqd.select.length ||
    rqd.expands.length ||
    rqd.compute.length ||
    rqd.skip != null ||
    rqd.take != null ||
    rqd.count != false
  ) {
    expand += `(`

    const operators = []

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

    if (rqd.compute.length) {
      operators.push(`$compute=${rqd.compute.join(',')}`)
    }

    expand += operators.join(';') + ')'
  }

  return expand
}
