export interface SelectExpression {}

export type SelectParams<T, Tkey> = Array<
  Tkey | ((exp: SelectBuilder<T>) => SelectExpression)
>

export type SelectBuilder<T> = {
  [P in keyof T]: SelectBuilderType<T[P]>
}

export type SelectBuilderType<T> = T extends Array<infer R>
  ? SelectBuilder<R>
  : T extends string
  ? SelectExpression
  : T extends number
  ? SelectExpression
  : T extends boolean
  ? SelectExpression
  : T extends Date
  ? SelectExpression
  : T extends Object
  ? SelectBuilder<T>
  : SelectExpression
