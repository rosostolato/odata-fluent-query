/**
 * Represents a search expression that can be used in OData $search queries
 */
export interface SearchExpression {
  /**
   * Negates the current search expression
   * @returns A new search expression with NOT operator
   * @example
   * search(s => s.token('clothing').not()) // Results in: NOT clothing
   */
  not(): SearchExpression

  /**
   * Combines this search expression with another using logical AND
   * @param value The search value to AND with
   * @returns A new search expression representing both conditions
   * @example
   * search(s => s.token('bike').and('mountain')) // Results in: bike AND mountain
   * search(s => s.token('bike').and(2022)) // Results in: bike AND "2022"
   */
  and(value: number | boolean | string): SearchExpression

  /**
   * Combines this search expression with another using logical OR
   * @param value The search value to OR with
   * @returns A new search expression representing either condition
   * @example
   * search(s => s.token('bike').or('car')) // Results in: bike OR car
   * search(s => s.token('bike').or(2022)) // Results in: bike OR "2022"
   */
  or(value: number | boolean | string): SearchExpression
}

/**
 * Builder for creating search expressions following OData $search syntax
 */
export interface SearchBuilder {
  /**
   * Creates a search token with automatic quoting.
   * Tokens containing special characters or spaces are quoted for queries to function correctly.
   * @param value The value to search for
   * @returns SearchExpression with appropriate quoting
   * @example
   * search(s => s.token('bike')) // Results in: bike
   * search(s => s.token('mountain bike')) // Results in: mountain bike  
   * search(s => s.token(2022)) // Results in: "2022"
   * search(s => s.token('example.com')) // Results in: "example.com"
   */
  token(value: number | boolean | string): SearchExpression
}

export interface SearchExpressionInternal extends SearchExpression {
  _get(): string
}