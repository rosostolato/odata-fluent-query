import { createQuery } from './builders/create-query'
import { ODataQuery } from './models/odata-query'
import { QueryDescriptor } from './models/query-descriptor'

function odataQuery<T>() {
  const defaultDescriptor: QueryDescriptor = {
    key: null,
    skip: null,
    take: null,
    groupAgg: null,
    strict: false,
    count: false,
    filters: [],
    expands: [],
    orderby: [],
    groupby: [],
    select: [],
  }

  return createQuery<T>(defaultDescriptor)
}

export { odataQuery, ODataQuery }
export default odataQuery
