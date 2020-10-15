import { createQuery, createQueryDescriptor } from './builders/create-query'
import { ODataQuery } from './models/odata-query'

export function odataQuery<T>(): ODataQuery<T> {
  const defaultDescriptor = createQueryDescriptor()
  return createQuery(defaultDescriptor)
}

export * from './models'
export default odataQuery
