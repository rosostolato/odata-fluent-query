// Internal types shared across multiple modules
// These types are not exposed to end users

/**
 * Internal key-value pair structure
 * Used for query parameter representation
 */
export interface KeyValue<T> {
  key: string
  value: T
}

/**
 * Generic function type accepting any arguments and returning any value
 * Used internally for callback type annotations
 */
export type AnyFunction = (...args: any[]) => any

/**
 * Object with string keys mapping to handler functions
 * Used internally for proxy handler implementations
 */
export type AnyObjectOfHandlers = Record<string, (...args: any[]) => unknown>

/**
 * Proxy instance type
 * Used for typing proxy objects
 */
export type ProxyInstance = InstanceType<typeof Proxy>

/**
 * Describes the internal structure of an OData query with all possible query options.
 * This is the internal state object used by the query builder.
 */
export interface QueryDescriptor {
  key: string | null
  compute: string[]
  expands: QueryDescriptor[]
  filters: string[]
  groupby: string[]
  search?: string | undefined
  orderby: string[]
  select: string[]
  aggregator?: string
  count?: boolean
  skip?: number
  take?: number
}
