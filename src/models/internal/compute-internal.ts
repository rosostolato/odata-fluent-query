// Internal types for the compute builder implementation
// These types are not exposed to end users

import {
  ComputeBoolean,
  ComputeDate,
  ComputeNumber,
  ComputeString,
} from '../query-compute'

/**
 * Internal type utility to infer the TypeScript type from a ComputeExpression
 * Used for type inference in the query result type
 */
export type InferComputeType<T> = T extends ComputeNumber
  ? number
  : T extends ComputeString
    ? string
    : T extends ComputeBoolean
      ? boolean
      : T extends ComputeDate
        ? Date
        : unknown
