import { createQuery, createQueryDescriptor } from './builders/create-query'
import { ODataQuery } from './models/odata-query'

function odataQuery<T>(): ODataQuery<T> {
  const defaultDescriptor = createQueryDescriptor()
  return createQuery(defaultDescriptor)
}

export { odataQuery, ODataQuery }
export default odataQuery
