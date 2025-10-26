// Internal types for the expand builder implementation
// These types are not exposed to end users

import { ODataQuery } from '../odata-query'

/**
 * Internal type to extract keys from T that are expandable (non-primitive types)
 * Used to validate expand keys
 */
export type ExpandKey<T> = Pick<
  T,
  {
    [K in keyof T]: NonNullable<Required<T>[K]> extends
      | number
      | string
      | boolean
      | Date
      | Uint8Array
      ? never
      : K
  }[keyof T]
>

/**
 * Internal type to determine the appropriate query type for expanded properties
 * Arrays and objects have different query capabilities
 */
export type ExpandQueryComplex<T> = T extends Array<infer U>
  ? ExpandArrayQuery<U>
  : T extends object
    ? ExpandObjectQuery<T>
    : never

/**
 * Internal type for queries on expanded object properties
 * Object expansions can only select and expand further
 */
export type ExpandObjectQuery<T> = Pick<ODataQuery<T>, 'select' | 'expand'>

/**
 * Internal type for queries on expanded array properties
 * Array expansions have full query capabilities
 * Starts with no selections (never), no computed properties ({}), and no expansions (never)
 */
export type ExpandArrayQuery<T> = ODataQuery<T, never, {}, never>
