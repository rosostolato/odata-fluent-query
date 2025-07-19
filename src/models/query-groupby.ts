export interface GroupbyBuilder<T> {
  /**
   * Calculates the sum of the specified property
   * @param prop The property key to sum
   * @param alias The alias name for the result
   * @returns The groupby builder for chaining
   * @example
   * groupBy(['category'], agg => agg.sum('price', 'totalPrice'))
   */
  sum(prop: keyof T, alias: string): GroupbyBuilder<T>

  /**
   * Calculates the minimum value of the specified property
   * @param prop The property key to find minimum for
   * @param alias The alias name for the result
   * @returns The groupby builder for chaining
   * @example
   * groupBy(['category'], agg => agg.min('price', 'minPrice'))
   */
  min(prop: keyof T, alias: string): GroupbyBuilder<T>

  /**
   * Calculates the maximum value of the specified property
   * @param prop The property key to find maximum for
   * @param alias The alias name for the result
   * @returns The groupby builder for chaining
   * @example
   * groupBy(['category'], agg => agg.max('price', 'maxPrice'))
   */
  max(prop: keyof T, alias: string): GroupbyBuilder<T>

  /**
   * Calculates the average value of the specified property
   * @param prop The property key to calculate average for
   * @param alias The alias name for the result
   * @returns The groupby builder for chaining
   * @example
   * groupBy(['category'], agg => agg.average('price', 'avgPrice'))
   */
  average(prop: keyof T, alias: string): GroupbyBuilder<T>

  /**
   * Counts the distinct values of the specified property
   * @param prop The property key to count distinct values for
   * @param alias The alias name for the result
   * @returns The groupby builder for chaining
   * @example
   * groupBy(['category'], agg => agg.countdistinct('id', 'uniqueCount'))
   */
  countdistinct(prop: keyof T, alias: string): GroupbyBuilder<T>

  /**
   * Applies a custom aggregation function to the specified property
   * @param prop The property key to aggregate
   * @param aggregator The custom aggregation function name
   * @param alias The alias name for the result
   * @returns The groupby builder for chaining
   * @example
   * groupBy(['category'], agg => agg.custom('price', 'custom_agg', 'customResult'))
   */
  custom(prop: keyof T, aggregator: string, alias: string): GroupbyBuilder<T>
}
