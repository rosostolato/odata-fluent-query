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
   * Creates a search phrase (handles both single terms and multi-word phrases)
   * @param phrase The search phrase - can be a single word or multiple words
   * @returns SearchExpression for the phrase
   * @example
   * search(s => s.phrase('bike')) // Results in: "bike"
   * search(s => s.phrase('mountain bike')) // Results in: "mountain bike"
   */
  phrase(phrase: string): SearchExpression
}