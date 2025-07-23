import { Defined, ExtractNull } from './type-utils'

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
  /**
   * Applies `tolower` method to the property
   */
  caseInsensitive?: boolean

  /**
   * Ignores Guid type casting
   */
  ignoreGuid?: boolean
}

export interface FilterExpression {
  /**
   * Negates the current filter expression
   * @returns A new filter expression with the opposite logic
   * @example
   * filter(u => u.isActive.not()) // NOT isActive
   */
  not(): FilterExpression

  /**
   * Combines this filter expression with another using logical AND
   * @param exp The filter expression to combine with
   * @returns A new filter expression representing both conditions
   * @example
   * filter(u => u.isActive.and(u.age.biggerThan(18))) // isActive AND age > 18
   */
  and(exp: FilterExpression): FilterExpression

  /**
   * Combines this filter expression with another using logical OR
   * @param exp The filter expression to combine with
   * @returns A new filter expression representing either condition
   * @example
   * filter(u => u.isActive.or(u.isAdmin)) // isActive OR isAdmin
   */
  or(exp: FilterExpression): FilterExpression
}

export interface FilterDate<T = Date> {
  /**
   * Checks if the date equals the specified value
   * @param d The date value to compare against (string, Date, or FilterDate)
   * @returns A filter expression for date equality
   * @example
   * filter(u => u.createdDate.equals('2023-01-01'))
   */
  equals(d: string | Date | FilterDate | ExtractNull<T>): FilterExpression

  /**
   * Checks if the date does not equal the specified value
   * @param d The date value to compare against (string, Date, or FilterDate)
   * @returns A filter expression for date inequality
   * @example
   * filter(u => u.createdDate.notEquals('2023-01-01'))
   */
  notEquals(d: string | Date | FilterDate | ExtractNull<T>): FilterExpression

  /**
   * Checks if the date falls within a specified time span
   * @param y The year offset (negative for past, positive for future)
   * @param m Optional month offset
   * @param d Optional day offset
   * @param h Optional hour offset
   * @param mm Optional minute offset
   * @returns A filter expression for time span checking
   * @example
   * filter(u => u.createdDate.inTimeSpan(-1, 0, 0)) // within last year
   */
  inTimeSpan(
    y: number,
    m?: number,
    d?: number,
    h?: number,
    mm?: number
  ): FilterExpression

  /**
   * Checks if the date is the same as the specified value
   * @param d The date value to compare against
   * @returns A filter expression for date sameness
   * @example
   * filter(u => u.createdDate.isSame('2023-01-01'))
   */
  isSame(d: string | Date | FilterDate | ExtractNull<T>): FilterExpression

  /**
   * Checks if the date component matches the specified value
   * @param d The value to compare against
   * @param g The granularity level ('year', 'month', 'day', 'hour', 'minute', 'second')
   * @returns A filter expression for date component matching
   * @example
   * filter(u => u.createdDate.isSame(2023, 'year')) // same year
   */
  isSame(
    d: number | Date | FilterDate | ExtractNull<T>,
    g: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
  ): FilterExpression

  /**
   * Checks if the date is after the specified value
   * @param d The date value to compare against
   * @returns A filter expression for date ordering
   * @example
   * filter(u => u.createdDate.isAfter('2023-01-01'))
   */
  isAfter(d: string | Date | FilterDate | ExtractNull<T>): FilterExpression

  /**
   * Checks if the date is after or equal to the specified value
   * @param d The date value to compare against
   * @returns A filter expression for date ordering
   * @example
   * filter(u => u.createdDate.isAfterOrEqual('2023-01-01'))
   */
  isAfterOrEqual(
    d: string | Date | FilterDate | ExtractNull<T>
  ): FilterExpression

  /**
   * Checks if the date is before the specified value
   * @param d The date value to compare against
   * @returns A filter expression for date ordering
   * @example
   * filter(u => u.createdDate.isBefore('2023-01-01'))
   */
  isBefore(d: string | Date | FilterDate | ExtractNull<T>): FilterExpression

  /**
   * Checks if the date is before or equal to the specified value
   * @param d The date value to compare against
   * @returns A filter expression for date ordering
   * @example
   * filter(u => u.createdDate.isBeforeOrEqual('2023-01-01'))
   */
  isBeforeOrEqual(
    d: string | Date | FilterDate | ExtractNull<T>
  ): FilterExpression
}

export interface FilterString<T = string> {
  /**
   * Checks if the string contains the specified substring
   * @param s The substring to search for
   * @param options Optional string comparison options
   * @returns A filter expression for string containment
   * @example
   * filter(u => u.name.contains('john'))
   */
  contains(
    s: string | FilterString | ExtractNull<T>,
    options?: StringOptions
  ): FilterExpression

  /**
   * Checks if the string equals the specified value
   * @param s The string value to compare against
   * @param options Optional string comparison options
   * @returns A filter expression for string equality
   * @example
   * filter(u => u.name.equals('John Doe'))
   */
  equals(
    s: string | FilterString | ExtractNull<T>,
    options?: StringOptions
  ): FilterExpression

  /**
   * Checks if the string does not equal the specified value
   * @param s The string value to compare against
   * @param options Optional string comparison options
   * @returns A filter expression for string inequality
   * @example
   * filter(u => u.name.notEquals('John Doe'))
   */
  notEquals(
    s: string | FilterString | ExtractNull<T>,
    options?: StringOptions
  ): FilterExpression

  /**
   * Checks if the string starts with the specified prefix
   * @param s The prefix to check for
   * @param options Optional string comparison options
   * @returns A filter expression for string prefix matching
   * @example
   * filter(u => u.name.startsWith('John'))
   */
  startsWith(
    s: string | FilterString | ExtractNull<T>,
    options?: StringOptions
  ): FilterExpression

  /**
   * Checks if the string ends with the specified suffix
   * @param s The suffix to check for
   * @param options Optional string comparison options
   * @returns A filter expression for string suffix matching
   * @example
   * filter(u => u.name.endsWith('Doe'))
   */
  endsWith(
    s: string | FilterString | ExtractNull<T>,
    options?: StringOptions
  ): FilterExpression

  /**
   * Checks if the string is in the specified list of values
   * @param list The array of string values to check against
   * @returns A filter expression for string membership
   * @example
   * filter(u => u.status.in(['active', 'pending']))
   */
  in(list: string[] | ExtractNull<T>): FilterExpression

  /**
   * Gets the length of the string as a number for comparison
   * @returns A filter number expression representing the string length
   * @example
   * filter(u => u.name.length().biggerThan(10))
   */
  length(): FilterNumber

  /**
   * Converts the string to lowercase for case-insensitive operations
   * @returns A filter string expression in lowercase
   * @example
   * filter(u => u.name.tolower().equals('john doe'))
   */
  tolower(): FilterString

  /**
   * Converts the string to uppercase for case-insensitive operations
   * @returns A filter string expression in uppercase
   * @example
   * filter(u => u.name.toupper().equals('JOHN DOE'))
   */
  toupper(): FilterString

  /**
   * Removes leading and trailing whitespace from the string
   * @returns A filter string expression with trimmed whitespace
   * @example
   * filter(u => u.name.trim().equals('John'))
   */
  trim(): FilterString

  /**
   * Gets the index of the first occurrence of a substring
   * @param s The substring to search for
   * @returns A filter number expression representing the index
   * @example
   * filter(u => u.name.indexof('John').equals(0))
   */
  indexof(s: string): FilterNumber

  /**
   * Extracts a substring starting from the specified position
   * @param n The starting position (zero-based)
   * @returns A filter string expression representing the substring
   * @example
   * filter(u => u.name.substring(5).equals('Doe'))
   */
  substring(n: number): FilterString

  /**
   * Appends a string to the end of the current string
   * @param s The string to append
   * @returns A filter string expression with the appended value
   * @example
   * filter(u => u.name.append(' Jr').equals('John Doe Jr'))
   */
  append(s: string): FilterString

  /**
   * Prepends a string to the beginning of the current string
   * @param s The string to prepend
   * @returns A filter string expression with the prepended value
   * @example
   * filter(u => u.name.prepend('Mr. ').equals('Mr. John Doe'))
   */
  prepend(s: string): FilterString
}

export interface FilterNumber<T = number> {
  /**
   * Checks if the number equals the specified value
   * @param n The number value to compare against
   * @returns A filter expression for number equality
   * @example
   * filter(u => u.age.equals(25))
   */
  equals(n: number | FilterNumber | ExtractNull<T>): FilterExpression

  /**
   * Checks if the number does not equal the specified value
   * @param n The number value to compare against
   * @returns A filter expression for number inequality
   * @example
   * filter(u => u.age.notEquals(25))
   */
  notEquals(n: number | FilterNumber | ExtractNull<T>): FilterExpression

  /**
   * Checks if the number is greater than the specified value
   * @param n The number value to compare against
   * @returns A filter expression for number comparison
   * @example
   * filter(u => u.age.biggerThan(18))
   */
  biggerThan(n: number | FilterNumber | ExtractNull<T>): FilterExpression

  /**
   * Checks if the number is greater than or equal to the specified value
   * @param n The number value to compare against
   * @returns A filter expression for number comparison
   * @example
   * filter(u => u.age.biggerThanOrEqual(18))
   */
  biggerThanOrEqual(n: number | FilterNumber | ExtractNull<T>): FilterExpression

  /**
   * Checks if the number is less than the specified value
   * @param n The number value to compare against
   * @returns A filter expression for number comparison
   * @example
   * filter(u => u.age.lessThan(65))
   */
  lessThan(n: number | FilterNumber | ExtractNull<T>): FilterExpression

  /**
   * Checks if the number is less than or equal to the specified value
   * @param n The number value to compare against
   * @returns A filter expression for number comparison
   * @example
   * filter(u => u.age.lessThanOrEqual(65))
   */
  lessThanOrEqual(n: number | FilterNumber | ExtractNull<T>): FilterExpression

  /**
   * Checks if the number is in the specified list of values
   * @param list The array of number values to check against
   * @returns A filter expression for number membership
   * @example
   * filter(u => u.age.in([18, 25, 30]))
   */
  in(list: number[] | ExtractNull<T>): FilterExpression
}

export interface FilterBoolean<T = boolean> {
  /**
   * Checks if the boolean equals the specified value
   * @param b The boolean value to compare against
   * @returns A filter expression for boolean equality
   * @example
   * filter(u => u.isActive.equals(true))
   */
  equals(b: boolean | FilterBoolean | ExtractNull<T>): FilterExpression

  /**
   * Checks if the boolean does not equal the specified value
   * @param b The boolean value to compare against
   * @returns A filter expression for boolean inequality
   * @example
   * filter(u => u.isActive.notEquals(false))
   */
  notEquals(b: boolean | FilterBoolean | ExtractNull<T>): FilterExpression
}

export interface FilterNullable {
  /**
   * Checks if the value is null
   * @returns A filter expression for null checking
   * @example
   * filter(u => u.middleName.isNull())
   */
  isNull(): FilterExpression

  /**
   * Checks if the value is not null
   * @returns A filter expression for non-null checking
   * @example
   * filter(u => u.middleName.notNull())
   */
  notNull(): FilterExpression
}

export interface FilterCollection<T> {
  /**
   * Checks if the collection is empty
   * @returns A filter expression for empty collection checking
   * @example
   * filter(u => u.orders.empty())
   */
  empty(): FilterExpression

  /**
   * Checks if the collection is not empty
   * @returns A filter expression for non-empty collection checking
   * @example
   * filter(u => u.orders.notEmpty())
   */
  notEmpty(): FilterExpression

  /**
   * Checks if any element in the collection satisfies the condition
   * @param c A function that takes a filter builder for collection elements and returns a filter expression
   * @returns A filter expression for collection element checking
   * @example
   * filter(u => u.orders.any(order => order.total.biggerThan(100)))
   */
  any(c: (arg: FilterBuilderProp<T>) => FilterExpression): FilterExpression

  /**
   * Checks if all elements in the collection satisfy the condition
   * @param c A function that takes a filter builder for collection elements and returns a filter expression
   * @returns A filter expression for collection element checking
   * @example
   * filter(u => u.orders.all(order => order.status.equals('completed')))
   */
  all(c: (arg: FilterBuilderProp<T>) => FilterExpression): FilterExpression
}
