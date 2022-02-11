import { createQuery, createQueryDescriptor } from './builders'
import { ODataQuery } from './models'

export function odataQuery<T>(): ODataQuery<T> {
  const defaultDescriptor = createQueryDescriptor()
  return createQuery(defaultDescriptor)
}

export * from './models'
export default odataQuery
