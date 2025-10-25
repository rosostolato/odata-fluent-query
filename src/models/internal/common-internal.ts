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
 * Proxy instance type
 * Used for typing proxy objects
 */
export type ProxyInstance = InstanceType<typeof Proxy>

// Re-export QueryDescriptor from the public API - single source of truth
export type { QueryDescriptor } from '../query-descriptor'
