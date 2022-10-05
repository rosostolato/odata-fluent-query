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
  : never

export interface FilterExpression {
  not(): FilterExpression
  and(exp: FilterExpression): FilterExpression
  or(exp: FilterExpression): FilterExpression
}

export interface StringOptions {
  /** Applies `tolower` method to the property */
  caseInsensitive?: boolean
  /** Ignores Guid type casting */
  ignoreGuid?: boolean
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
  isSame(d: null | undefined): FilterExpression
  isAfter(d: string | Date | FilterDate): FilterExpression
  isAfterOrEqual(d: string | Date | FilterDate): FilterExpression
  isBefore(d: string | Date | FilterDate): FilterExpression
  isBeforeOrEqual(d: string | Date | FilterDate): FilterExpression
}

export interface FilterString {
  isNull(): FilterExpression
  notNull(): FilterExpression
  contains(s: string | FilterString, options?: StringOptions): FilterExpression
  contains(s: null | undefined, options?: StringOptions): FilterExpression
  equals(s: string | FilterString, options?: StringOptions): FilterExpression
  equals(s: null | undefined, options?: StringOptions): FilterExpression
  notEquals(s: string | FilterString, options?: StringOptions): FilterExpression
  notEquals(s: null | undefined, options?: StringOptions): FilterExpression
  startsWith(
    s: string | FilterString,
    options?: StringOptions
  ): FilterExpression
  startsWith(s: null | undefined, options?: StringOptions): FilterExpression
  endsWith(s: string | FilterString, options?: StringOptions): FilterExpression
  endsWith(s: null | undefined, options?: StringOptions): FilterExpression
  in(list: string[]): FilterExpression
}

export interface FilterNumber {
  equals(n: number | FilterNumber): FilterExpression
  equals(n: null | undefined): FilterExpression
  notEquals(n: number | FilterNumber): FilterExpression
  notEquals(n: null | undefined): FilterExpression
  biggerThan(n: number | FilterNumber): FilterExpression
  biggerThan(n: null | undefined): FilterExpression
  biggerOrEqualThan(n: number | FilterNumber): FilterExpression
  biggerOrEqualThan(n: null | undefined): FilterExpression
  lessThan(n: number | FilterNumber): FilterExpression
  lessThan(n: null | undefined): FilterExpression
  lessOrEqualThan(n: number | FilterNumber): FilterExpression
  lessOrEqualThan(n: null | undefined): FilterExpression
  in(list: number[]): FilterExpression
}

export interface FilterBoolean {
  equals(b: boolean | FilterBoolean): FilterExpression
  equals(b: null | undefined): FilterExpression
  notEquals(b: boolean | FilterBoolean): FilterExpression
  notEquals(b: null | undefined): FilterExpression
}

export interface FilterCollection<T> {
  empty(): FilterExpression
  notEmpty(): FilterExpression
  any(c: (arg: FilterBuilderType<T>) => FilterExpression): FilterExpression
  all(c: (arg: FilterBuilderType<T>) => FilterExpression): FilterExpression
}
