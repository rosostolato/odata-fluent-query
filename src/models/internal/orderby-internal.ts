// Internal types for the orderby builder implementation
// These types are not exposed to end users

/**
 * Internal proxy type used by the orderby builder
 * Represents a chainable orderby expression with key tracking and sort direction methods
 */
export type OrderByProxy = {
  _key: string
  asc: () => OrderByProxy
  desc: () => OrderByProxy
}
