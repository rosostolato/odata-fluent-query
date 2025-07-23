import { createQuery, createQueryDescriptor } from './builders'
import { parseODataQuery } from './builders/parse-query'
import { ODataQuery } from './models'

export function odataQuery<T>(): ODataQuery<T> {
  const defaultDescriptor = createQueryDescriptor()
  return createQuery(defaultDescriptor)
}

// Add fromString as a static method on the function
odataQuery.fromString = function <T>(queryString: string): ODataQuery<T> {
  const descriptor = parseODataQuery(queryString)
  return createQuery(descriptor)
}

// Export types
export * from './models'
export default odataQuery
