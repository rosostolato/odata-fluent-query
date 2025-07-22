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
   * Creates a search phrase for text
   * @param phrase The search phrase - can be a single word or multiple words
   * @returns SearchExpression for the phrase
   * @example
   * search(s => s.phrase('bike')) // Results in: bike
   * search(s => s.phrase('mountain bike')) // Results in: mountain bike
   */
  phrase(phrase: string): SearchExpression

  /**
   * Creates a search expression for non-string tokens (automatically quoted)
   * Used for numbers, dates, booleans, or any value that needs to be quoted
   * @param value The non-string value to search for
   * @returns SearchExpression for the quoted value
   * @example
   * search(s => s.nonString(2022)) // Results in: "2022"
   * search(s => s.nonString(true)) // Results in: "true"
   * search(s => s.nonString(new Date('2023-01-01'))) // Results in: "2023-01-01T00:00:00.000Z"
   */
  nonString(value: number | boolean | Date): SearchExpression
}