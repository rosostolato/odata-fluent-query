// General utility types
export type Defined<T> = Exclude<T, undefined>
export type ExtractNull<T> = Extract<null, T>

// Type utilities for result type inference
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

// Extract required properties (complex types - always included)
// Uses Pick to detect optional properties, which works with exactOptionalPropertyTypes
export type RequiredProperties<T> = {
  [K in keyof T as {} extends Pick<T, K> ? never : K]: T[K]
}

// Extract optional properties (navigation properties - only included if expanded)
export type OptionalProperties<T> = {
  [K in keyof T as {} extends Pick<T, K> ? K : never]: Required<Pick<T, K>>[K] | undefined
}

// Helper to ensure we get the right intersection types
export type IntersectTypes<T, U> = Prettify<T & U>

// Helper to create selected properties as an object type (not a union)
export type SelectedProperties<T, TSelected extends keyof T> = {
  [K in TSelected]: T[K]
}

// Helper to create expanded optional properties
// Removes undefined from optional properties when they are expanded
export type ExpandedOptionalProperties<
  T,
  TExpanded extends keyof OptionalProperties<T>
> = {
  [K in TExpanded]-?: Required<Pick<T, K>>[K]
}
