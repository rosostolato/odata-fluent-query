type Defined<T> = Exclude<T, undefined>
type ExtractNull<T> = Extract<null, T>

export type FilterBuilder<T> = {
  readonly [P in keyof T]-?: FilterBuilderProp<T[P]>
}

export type FilterBuilderProp<T> = null extends T
  ? FilterBuilderType<Defined<T>, NonNullable<T>> & FilterNullable
  : FilterBuilderType<Defined<T>, T>

export type FilterBuilderType<Type, Primitive> = Primitive extends Array<
  infer R
>
  ? FilterCollection<R>
  : Primitive extends string
  ? FilterString<Type>
  : Primitive extends number
  ? FilterNumber<Type>
  : Primitive extends boolean
  ? FilterBoolean<Type>
  : Primitive extends Date
  ? FilterDate<Type>
  : Primitive extends object
  ? FilterBuilder<Primitive>
  : never

export interface StringOptions {
  /** Applies `tolower` method to the property */
  caseInsensitive?: boolean
  /** Ignores Guid type casting */
  ignoreGuid?: boolean
}

export interface FilterExpression {
  not(): FilterExpression
  and(exp: FilterExpression): FilterExpression
  or(exp: FilterExpression): FilterExpression
}

export interface FilterDate<T = Date> {
  equals(d: string | Date | FilterDate | ExtractNull<T>): FilterExpression
  notEquals(d: string | Date | FilterDate | ExtractNull<T>): FilterExpression

  inTimeSpan(
    y: number,
    m?: number,
    d?: number,
    h?: number,
    mm?: number
  ): FilterExpression

  isSame(d: string | Date | FilterDate | ExtractNull<T>): FilterExpression
  isSame(
    d: number | Date | FilterDate | ExtractNull<T>,
    g: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
  ): FilterExpression

  isAfter(d: string | Date | FilterDate | ExtractNull<T>): FilterExpression
  isAfterOrEqual(
    d: string | Date | FilterDate | ExtractNull<T>
  ): FilterExpression
  isBefore(d: string | Date | FilterDate | ExtractNull<T>): FilterExpression
  isBeforeOrEqual(
    d: string | Date | FilterDate | ExtractNull<T>
  ): FilterExpression
}

export interface FilterString<T = string> {
  contains(
    s: string | FilterString | ExtractNull<T>,
    options?: StringOptions
  ): FilterExpression
  equals(
    s: string | FilterString | ExtractNull<T>,
    options?: StringOptions
  ): FilterExpression
  notEquals(
    s: string | FilterString | ExtractNull<T>,
    options?: StringOptions
  ): FilterExpression
  startsWith(
    s: string | FilterString | ExtractNull<T>,
    options?: StringOptions
  ): FilterExpression
  endsWith(
    s: string | FilterString | ExtractNull<T>,
    options?: StringOptions
  ): FilterExpression
  in(list: string[] | ExtractNull<T>): FilterExpression

  length(): FilterNumber
  tolower(): FilterString
  toupper(): FilterString
  trim(): FilterString
  indexof(s: string): FilterNumber
  substring(n: number): FilterString
  append(s: string): FilterString
  prepend(s: string): FilterString
}

export interface FilterNumber<T = number> {
  equals(n: number | FilterNumber | ExtractNull<T>): FilterExpression
  notEquals(n: number | FilterNumber | ExtractNull<T>): FilterExpression
  biggerThan(n: number | FilterNumber | ExtractNull<T>): FilterExpression
  biggerThanOrEqual(n: number | FilterNumber | ExtractNull<T>): FilterExpression
  lessThan(n: number | FilterNumber | ExtractNull<T>): FilterExpression
  lessThanOrEqual(n: number | FilterNumber | ExtractNull<T>): FilterExpression
  in(list: number[] | ExtractNull<T>): FilterExpression
}

export interface FilterBoolean<T = boolean> {
  equals(b: boolean | FilterBoolean | ExtractNull<T>): FilterExpression
  notEquals(b: boolean | FilterBoolean | ExtractNull<T>): FilterExpression
}

export interface FilterNullable {
  isNull(): FilterExpression
  notNull(): FilterExpression
}

export interface FilterCollection<T> {
  empty(): FilterExpression
  notEmpty(): FilterExpression
  any(c: (arg: FilterBuilderProp<T>) => FilterExpression): FilterExpression
  all(c: (arg: FilterBuilderProp<T>) => FilterExpression): FilterExpression
}
