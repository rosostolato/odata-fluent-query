export interface ComputeExpression {
  toString(): string
  as<K extends string>(alias: K): ComputeExpressionWithAlias<K, this>
}

export interface ComputeExpressionWithAlias<K extends string, V> {
  toString(): string
  readonly _alias: K
  readonly _type: V
}

export type InferComputeType<T> = T extends ComputeNumber
  ? number
  : T extends ComputeString
  ? string
  : T extends ComputeBoolean
  ? boolean
  : T extends ComputeDate
  ? Date
  : unknown

export interface ComputeNumber extends ComputeExpression {
  multiply(value: number | ComputeNumber): ComputeNumber
  divide(value: number | ComputeNumber): ComputeNumber
  add(value: number | ComputeNumber): ComputeNumber
  subtract(value: number | ComputeNumber): ComputeNumber
}

export interface ComputeString extends ComputeExpression {
  substring(start: number, length?: number): ComputeString
  length(): ComputeNumber
  concat(...values: (string | ComputeString | ComputeExpression)[]): ComputeString
}

export interface ComputeBoolean extends ComputeExpression {
  and(value: boolean | ComputeBoolean): ComputeBoolean
  or(value: boolean | ComputeBoolean): ComputeBoolean
  not(): ComputeBoolean
  equals(value: boolean | ComputeBoolean): ComputeBoolean
  notEquals(value: boolean | ComputeBoolean): ComputeBoolean
}

export interface ComputeDate extends ComputeExpression {
  add(duration: string | ComputeDate): ComputeDate
  subtract(duration: string | ComputeDate): ComputeDate
  year(): ComputeNumber
  month(): ComputeNumber
  day(): ComputeNumber
  hour(): ComputeNumber
  minute(): ComputeNumber
  second(): ComputeNumber
  date(): ComputeDate
  time(): ComputeDate
}

export type ComputeBuilderType<T> = T extends string
  ? ComputeString
  : T extends number
  ? ComputeNumber
  : T extends boolean
  ? ComputeBoolean
  : T extends Date
  ? ComputeDate
  : T extends (infer U)[]
  ? ComputeBuilder<U>
  : T extends object
  ? ComputeBuilder<T>
  : ComputeExpression

export type ComputeBuilder<T> = {
  [P in keyof T]: ComputeBuilderType<T[P]>
}