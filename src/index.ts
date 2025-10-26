import { createQuery, createQueryDescriptor } from './builders'
import { parseODataQuery } from './builders/parse-query'
import { ODataQuery } from './models'

/**
 * Creates a new OData query builder instance for the specified entity type.
 *
 * @template T - The type of the entity being queried
 * @returns A new ODataQuery instance with default query descriptor settings
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number;
 *   name: string;
 *   email: string;
 * }
 *
 * const query = odataQuery<User>();
 * ```
 */
export function odataQuery<T>(): ODataQuery<T> {
  const defaultDescriptor = createQueryDescriptor()

  return createQuery(defaultDescriptor)
}

odataQuery.fromString = function <T>(queryString: string): ODataQuery<T> {
  const descriptor = parseODataQuery(queryString)
  return createQuery(descriptor)
}

export * from './models'
export default odataQuery
