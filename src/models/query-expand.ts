import { Primitive } from './internal/type-utils'

/**
 * Type for expand parameter callbacks
 * Used to specify expand paths using type-safe builder syntax
 */
export type ExpandParam<T, U> = (exp: ExpandBuilder<T>) => ExpandBuilder<U>

/**
 * Builder type for specifying expand paths in a type-safe way
 * Only non-primitive properties can be expanded
 */
export type ExpandBuilder<T> = {
  [K in keyof T as NonNullable<T[K]> extends Primitive
    ? never
    : K]-?: NonNullable<T[K]> extends Array<infer R>
    ? NonNullable<R> extends Primitive
      ? ExpandExpression
      : ExpandBuilder<R>
    : ExpandBuilder<NonNullable<T[K]>>
}

/**
 * Represents an expand expression that includes a unique key identifier.
 */
export type ExpandExpressionWithKey = ExpandExpression & { _key: string }

/**
 * Marker interface for expand expressions
 * Used to identify completed expand builder chains
 */
export interface ExpandExpression {}
