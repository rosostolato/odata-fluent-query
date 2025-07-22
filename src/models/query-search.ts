export interface SearchExpressionInternal extends SearchExpression {
  _get(): string
}

/**
 * Represents a search expression that can be used in OData $search queries
 */
export interface SearchExpression {
  /**
   * Negates the current search expression
   * @returns A new search expression with NOT operator
   * @example
   * search(s => s.phrase('clothing').not()) // Results in: NOT "clothing"
   */
  not(): SearchExpression

  /**
   * Combines this search expression with another using logical AND
   * @param phrase The search phrase to AND with
   * @returns A new search expression representing both conditions
   * @example
   * search(s => s.phrase('bike').and('mountain')) // Results in: "bike" AND "mountain"
   */
  and(phrase: string): SearchExpression

  /**
   * Combines this search expression with another using logical OR
   * @param phrase The search phrase to OR with
   * @returns A new search expression representing either condition
   * @example
   * search(s => s.phrase('bike').or('car')) // Results in: "bike" OR "car"
   */
  or(phrase: string): SearchExpression
}

/**
 * Builder for creating search expressions following OData $search syntax
 */
export interface SearchBuilder {
  /**
   * Creates a search phrase for text containing only alphabetical characters and spaces
   * Use this for simple words or phrases that don't contain special characters like dots, numbers, etc.
   * @param phrase The search phrase containing only letters and spaces
   * @returns SearchExpression for the phrase
   * @example
   * search(s => s.phrase('bike'))
   * search(s => s.phrase('mountain bike'))
   * search(s => s.phrase('Technology'))
   */
  phrase(phrase: string): SearchExpression

  /**
   * Creates a search expression for non-string tokens (automatically quoted)
   * Use this for numbers, dates, booleans, or strings containing special characters (dots, symbols, etc.)
   * The output will be quoted to ensure it's treated as a valid OData search token
   * @param value The value to search for
   * @returns SearchExpression for the quoted value
   * @example
   * search(s => s.nonString(2022)) // Results in: "2022"
   * search(s => s.nonString(true)) // Results in: "true"
   * search(s => s.nonString('example.com')) // Results in: "example.com" (quoted because of dot)
   * search(s => s.nonString('user@domain.com')) // Results in: "user@domain.com" (quoted because of special chars)
   * search(s => s.nonString(new Date('2023-01-01'))) // Results in: "2023-01-01T00:00:00.000Z"
   */
  nonString(value: number | boolean | Date | string): SearchExpression
}