export type FilterBuilder<T> = {
  [P in keyof T]-?: FilterBuilderType<T[P]>
}

export type FilterBuilderType<T> = T extends Array<infer R>
  ? FilterCollection<R>
  : T extends string
  ? FilterString
  : T extends number
  ? FilterNumber
  : T extends boolean
  ? FilterBoolean
  : T extends Date
  ? FilterDate
  : T extends Object
  ? FilterBuilder<T>
  : any

export interface FilterExpression {
  not(): FilterExpression
  and(exp: FilterExpression): FilterExpression
  or(exp: FilterExpression): FilterExpression
}

export interface StringOptions {
  /** @default false */
  caseInsensitive?: boolean
}

export interface FilterDate {
  inTimeSpan(
    y: number,
    m?: number,
    d?: number,
    h?: number,
    mm?: number
  ): FilterExpression
  isSame(d: string | Date | FilterDate): FilterExpression
  isSame(
    d: number | Date | FilterDate,
    g: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
  ): FilterExpression
  isAfter(d: string | Date | FilterDate): FilterExpression
  isAfterOrEqual(d: string | Date | FilterDate): FilterExpression
  isBefore(d: string | Date | FilterDate): FilterExpression
  isBeforeOrEqual(d: string | Date | FilterDate): FilterExpression
}

export interface FilterString {
  notNull(): FilterExpression
  contains(s: string | FilterString, options?: StringOptions): FilterExpression
  equals(s: string | FilterString, options?: StringOptions): FilterExpression
  notEquals(s: string | FilterString, options?: StringOptions): FilterExpression
  startsWith(
    s: string | FilterString,
    options?: StringOptions
  ): FilterExpression
  endsWith(s: string | FilterString, options?: StringOptions): FilterExpression
  in(list: string[]): FilterExpression
}

export interface FilterNumber {
  equals(n: number | FilterNumber): FilterExpression
  notEquals(n: number | FilterNumber): FilterExpression
  biggerThan(n: number | FilterNumber): FilterExpression
  biggerOrEqualThan(n: number | FilterNumber): FilterExpression
  lessThan(n: number | FilterNumber): FilterExpression
  lessOrEqualThan(n: number | FilterNumber): FilterExpression
  in(list: number[]): FilterExpression
}

export interface FilterBoolean {
  equals(b: boolean | FilterBoolean): FilterExpression
  notEquals(b: boolean | FilterBoolean): FilterExpression
}

export interface FilterCollection<T> {
  empty(): FilterExpression
  notEmpty(): FilterExpression
  any(c: (arg: FilterBuilderType<T>) => FilterExpression): FilterExpression
  all(c: (arg: FilterBuilderType<T>) => FilterExpression): FilterExpression
}
