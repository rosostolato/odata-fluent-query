import { createQuery } from './builders/create-query'
import { ODataQuery } from './models/odata-query'
import { QueryDescriptor } from './models/query-descriptor'

const defaultDescriptor: QueryDescriptor = {
  key: null,
  skip: null,
  take: null,
  groupAgg: null,
  filters: [],
  expands: [],
  orderby: [],
  groupby: [],
  select: [],
  strict: false,
  count: false,
}

function odataQuery<T>() {
  return createQuery<T>(defaultDescriptor)
}

export { odataQuery, ODataQuery }
export default odataQuery
