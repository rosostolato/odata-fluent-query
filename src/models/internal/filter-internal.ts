// Internal types used by the filter builder implementation
// These types are not exposed to end users

import { FilterBuilder } from '../query-filter'

/**
 * Internal interface for filter expressions that have a _get method
 * Used internally to retrieve the OData query string
 */
export interface ExpressionWithGet {
  _get(checkParentheses?: boolean): string
}

/**
 * Internal interface for filter objects that have a _key property
 * Used to identify filter builder instances with their property path
 */
export interface FilterWithKey {
  _key: string
  getPropName?: boolean
}

/**
 * Union type of all possible filter values
 * Used internally by equality and comparison builders
 */
export type FilterValue = string | number | boolean | Date | FilterWithKey | null

/**
 * Type for filter builder callback functions
 * Used in the createFilter function signature
 */
export type FilterFunction = (builder: FilterBuilder<unknown>) => ExpressionWithGet
