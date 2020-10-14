import {
  FilterBuilder,
  FilterBuilderType,
  FilterExpression,
} from './query-filter'
import { SelectParams } from './query-select'

export interface ODataQuery<T> {
  /**
   * Adds a $select operator to the OData query.
   * There is only one instance of $select, if you call multiple times it will take the last one.
   *
   * @param keys the names or a expression of the properties you want to select
   *
   * @example
   * q.select('id', 'title')
   * q.select(x => x.address.city)
   * q.select('id', x => x.title)
   */
  select<Tkey extends keyof T>(...keys: SelectParams<T, Tkey>): ODataQuery<T>

  /**
   * Adds a $filter operator to the OData query.
   * Multiple calls to Filter will be merged with `and`.
   *
   * @param exp a lambda expression that builds an expression from the builder.
   *
   * @example
   * q.filter(u => u.id.equals(1))
   */
  filter(exp: (x: FilterBuilder<T>) => FilterExpression): ODataQuery<T>
  /**
   * Adds a $filter operator to the OData query.
   * Multiple calls to Filter will be merged with `and`.
   *
   * @param key property key selector.
   * @param exp a lambda expression that builds an expression from the builder.
   *
   * @example
   * q.filter('id', id => id.equals(1))
   */
  filter<TKey extends keyof T>(
    key: TKey,
    exp: (x: FilterBuilderType<T[TKey]>) => FilterExpression
  ): ODataQuery<T>

  /**
   * exports query to string joined with `&`
   *
   * @example
   *
   * '$filter=order gt 5&$select=id'
   */
  toString(): string
}
