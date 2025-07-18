export interface ComputeExpression {
  toString(): string
  /**
   * Creates an alias for the computed expression that can be used in subsequent operations like select, filter, or orderby
   * @param alias The name to assign to the computed value
   * @example
   * .compute(c => c.price.multiply(c.quantity).as('totalValue'))
   * .select('name', 'totalValue')
   */
  as<TAlias extends string>(
    alias: TAlias
  ): ComputeExpressionWithAlias<TAlias, this>
}

export interface ComputeExpressionWithAlias<
  TAliasKey extends string,
  TAliasValue
> {
  toString(): string
  readonly _alias: TAliasKey
  readonly _type: TAliasValue
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
  /**
   * Multiplies this number by another number or compute expression
   * @param value The number or compute expression to multiply by
   * @example c.price.multiply(c.quantity) // price * quantity
   */
  multiply(value: number | ComputeNumber): ComputeNumber

  /**
   * Divides this number by another number or compute expression
   * @param value The number or compute expression to divide by
   * @example c.total.divide(c.quantity) // total / quantity
   */
  divide(value: number | ComputeNumber): ComputeNumber

  /**
   * Adds another number or compute expression to this number
   * @param value The number or compute expression to add
   * @example c.price.add(100) // price + 100
   */
  add(value: number | ComputeNumber): ComputeNumber

  /**
   * Subtracts another number or compute expression from this number
   * @param value The number or compute expression to subtract
   * @example c.price.subtract(c.discount) // price - discount
   */
  subtract(value: number | ComputeNumber): ComputeNumber
}

export interface ComputeString extends ComputeExpression {
  /**
   * Extracts a substring from this string starting at the specified position
   * @param start The zero-based starting position
   * @param length Optional length of the substring. If omitted, extracts to the end
   * @example c.name.substring(0, 3) // first 3 characters
   * @example c.name.substring(5) // from position 5 to end
   */
  substring(start: number, length?: number): ComputeString

  /**
   * Gets the length of this string as a number
   * @example c.name.length() // returns the character count
   */
  length(): ComputeNumber

  /**
   * Concatenates this string with one or more other strings or compute expressions
   * @param values The values to concatenate (strings, compute expressions, etc.)
   * @example c.firstName.concat(' ', c.lastName) // "John Doe"
   * @example c.name.concat(' (', c.email, ')') // "John (john@example.com)"
   */
  concat(
    ...values: (string | ComputeString | ComputeExpression)[]
  ): ComputeString
}

export interface ComputeBoolean extends ComputeExpression {
  /**
   * Logical AND operation with another boolean expression
   * @param value The boolean value or compute expression to AND with
   * @example c.isActive.and(c.isVerified) // isActive AND isVerified
   */
  and(value: boolean | ComputeBoolean): ComputeBoolean

  /**
   * Logical OR operation with another boolean expression
   * @param value The boolean value or compute expression to OR with
   * @example c.isActive.or(c.isAdmin) // isActive OR isAdmin
   */
  or(value: boolean | ComputeBoolean): ComputeBoolean

  /**
   * Logical NOT operation (negation)
   * @example c.isActive.not() // NOT isActive
   */
  not(): ComputeBoolean

  /**
   * Equality comparison
   * @param value The boolean value or compute expression to compare with
   * @example c.isActive.equals(true) // isActive eq true
   */
  equals(value: boolean | ComputeBoolean): ComputeBoolean

  /**
   * Inequality comparison
   * @param value The boolean value or compute expression to compare with
   * @example c.isActive.notEquals(false) // isActive ne false
   */
  notEquals(value: boolean | ComputeBoolean): ComputeBoolean
}

export interface ComputeDate extends ComputeExpression {
  /**
   * Adds a duration to this date
   * @param duration The duration to add (ISO 8601 duration string or another date expression)
   * @example c.createdDate.add('P1D') // add 1 day
   */
  add(duration: string | ComputeDate): ComputeDate

  /**
   * Subtracts a duration from this date
   * @param duration The duration to subtract (ISO 8601 duration string or another date expression)
   * @example c.createdDate.subtract('P1M') // subtract 1 month
   */
  subtract(duration: string | ComputeDate): ComputeDate

  /**
   * Extracts the year component from this date as a number
   * @example c.birthDate.year() // returns the year (e.g., 1990)
   */
  year(): ComputeNumber

  /**
   * Extracts the month component from this date as a number (1-12)
   * @example c.birthDate.month() // returns the month (1=January, 12=December)
   */
  month(): ComputeNumber

  /**
   * Extracts the day component from this date as a number (1-31)
   * @example c.birthDate.day() // returns the day of the month
   */
  day(): ComputeNumber

  /**
   * Extracts the hour component from this date as a number (0-23)
   * @example c.lastLogin.hour() // returns the hour in 24-hour format
   */
  hour(): ComputeNumber

  /**
   * Extracts the minute component from this date as a number (0-59)
   * @example c.lastLogin.minute() // returns the minute
   */
  minute(): ComputeNumber

  /**
   * Extracts the second component from this date as a number (0-59)
   * @example c.lastLogin.second() // returns the second
   */
  second(): ComputeNumber

  /**
   * Extracts the date portion (without time) from this datetime
   * @example c.createdDateTime.date() // returns just the date part
   */
  date(): ComputeDate

  /**
   * Extracts the time portion (without date) from this datetime
   * @example c.createdDateTime.time() // returns just the time part
   */
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
