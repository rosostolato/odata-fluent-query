import {
  ComputeBuilder,
  ComputeExpressionWithAlias,
  InferComputeType,
} from './query-compute'
import { ExpandKey, ExpandParam, ExpandQueryComplex } from './query-expand'
import {
  FilterBuilder,
  FilterBuilderProp,
  FilterExpression,
} from './query-filter'
import { GroupbyBuilder } from './query-groupby'
import { OrderBy, OrderByBuilder, OrderByExpression } from './query-orderby'
import { SearchBuilder, SearchExpression } from './query-search'
import { SelectParams } from './query-select'

export interface ODataQuery<T> {
  /**
   * Sets $count=true in the OData query.
   * @returns The OData query with count enabled
   * @example
   * q.count()
   */
  count(): ODataQuery<T>

  /**
   * Adds $expand operator in the OData query.
   * Multiple calls to Expand will expand all the relations, e.g.: $expand=rel1(...),rel2(...).
   * The lambda in the second parameter allows you to build a complex inner query.
   *
   * @param key The name of the relation
   * @param query Expression that builds the subquery from the querybuilder
   *
   * @example
   * q.expand('blogs', q => q.select('id', 'title'))
   * q.expand(u => u.blogs, q => q.select('id', 'title'))
   */
  expand<Tkey extends keyof ExpandKey<T>, U = Required<T>[Tkey]>(
    key: Tkey | ExpandParam<T, U>,
    query?: (x: ExpandQueryComplex<U>) => ExpandQueryComplex<U>
  ): ODataQuery<T>

  /**
   * Adds $filter operator in the OData query.
   * Multiple calls to Filter will be merged with `and`.
   *
   * @param exp Expression that builds an expression from the builder
   *
   * @example
   * q.filter(u => u.id.equals(1))
   */
  filter(exp: (x: FilterBuilder<T>) => FilterExpression): ODataQuery<T>
  /**
   * Adds $filter operator in the OData query.
   * Multiple calls to Filter will be merged with `and`.
   *
   * @param key Property key selector
   * @param exp Expression that builds an expression from the builder
   *
   * @example
   * q.filter('id', id => id.equals(1))
   */
  filter<TKey extends keyof T>(
    key: TKey,
    exp: (x: FilterBuilderProp<T[TKey]>) => FilterExpression
  ): ODataQuery<T>

  /**
   * Groups the results by the selected keys.
   *
   * @param keys Keys to be grouped by
   * @param aggregate Aggregate builder [optional]
   *
   * @example
   * q.groupBy(["email", "surname"], agg => agg
   *   .countdistinct("phoneNumbers", "count")
   *   .max("id", "id")
   * )
   */
  groupBy<key extends keyof T>(
    keys: key[],
    aggregate?: (aggregator: GroupbyBuilder<T>) => GroupbyBuilder<T>
  ): ODataQuery<T>

  /**
   * Adds $orderby operator in the OData query.
   * Ordering over relations is supported (check OData implementation for details).
   *
   * @param key Key in T
   * @param order The order of the sort
   *
   * @example
   * q.orderBy('blogs', 'desc')
   */
  orderBy<TKey extends keyof T>(
    key: TKey,
    order?: 'asc' | 'desc'
  ): ODataQuery<T>
  /**
   * Adds $orderby operator in the OData query.
   * Ordering over relations is supported (check OData implementation for details).
   *
   * @param exp Expression that builds the orderby expression from the builder
   *
   * @example
   * q.orderBy(u => u.blogs().id.desc())
   */
  orderBy(
    exp: (ob: OrderByBuilder<T>) => OrderBy | OrderByExpression
  ): ODataQuery<T>

  /**
   * Adds $skip and $top in the OData query.
   * The pageindex is zero-based.
   * This method automatically adds $count=true to the query.
   *
   * @param pagesize Page size ($top)
   * @param page Page index ($skip)
   *
   * @example
   * q.paginate(50, 0)
   */
  paginate(pagesize: number, page?: number): ODataQuery<T>
  /**
   * Adds $skip and $top in the OData query.
   * The pageindex is zero-based.
   *
   * @param options Paginate query options
   *
   * @example
   * q.paginate({ pagesize: 50, page: 0, count: false })
   */
  paginate(options: {
    pagesize: number
    page?: number
    count?: boolean
  }): ODataQuery<T>

  /**
   * Adds $select operator in the OData query.
   * There is only one instance of $select, if you call multiple times it will take the last one.
   *
   * @param keys The names or an expression of the properties you want to select
   *
   * @example
   * q.select('id', 'title')
   * q.select(x => x.address.city)
   * q.select('id', x => x.title)
   */
  select<TKey extends keyof T>(...keys: SelectParams<T, TKey>): ODataQuery<T>

  /**
   * Adds $compute operator in the OData query.
   * Multiple calls to compute will add all the computed expressions.
   * Computed aliases are type-safe and accessible in subsequent select, filter, and orderBy operations.
   *
   * @param exp Expression that builds a computed expression from the builder
   *
   * @example
   * // Basic compute with mathematical operations
   * q.compute(c => c.price.multiply(c.quantity).as('totalPrice'))
   * q.compute(c => c.firstName.concat(' ', c.lastName).as('fullName'))
   *
   * // Using computed aliases in subsequent operations
   * q.compute(c => c.price.multiply(c.quantity).as('totalPrice'))
   *  .select('id', 'name', 'totalPrice')
   *  .filter(p => p.totalPrice.biggerThan(100))
   *  .orderBy('totalPrice', 'desc')
   */
  compute<K extends string, V>(
    exp: (builder: ComputeBuilder<T>) => ComputeExpressionWithAlias<K, V>
  ): ODataQuery<T & Record<K, InferComputeType<V>>>

  /**
   * Adds $search operator in the OData query.
   * Enables free-text search across the collection with automatic quoting.
   * Simple text remains unquoted, while numbers, booleans, and special characters are quoted.
   *
   * @param exp Expression that builds a search expression from the builder
   *
   * @example
   * // Basic search
   * q.search(s => s.token('bike'))        // → $search=bike
   * q.search(s => s.token(2023))          // → $search="2023"
   * 
   * // Search with logical operators
   * q.search(s => s.token('mountain').and('bike'))  // → $search=mountain AND bike
   * q.search(s => s.token('bike').or(2022))         // → $search=bike OR "2022"
   * 
   * // Negation
   * q.search(s => s.token('clothing').not())        // → $search=NOT clothing
   */
  search(exp: (builder: SearchBuilder) => SearchExpression): ODataQuery<T>

  /**
   * Exports the query to an object with key/value pairs.
   *
   * @returns An object containing the OData query parameters
   * @example
   * {
   *  '$filter': 'order gt 5',
   *  '$select': 'id'
   * }
   */
  toObject(): QueryObject

  /**
   * Exports the query to a string joined with `&`.
   *
   * @returns A string representation of the OData query
   * @example
   * '$filter=order gt 5&$select=id'
   */
  toString(): string
}

export type QueryObject = {
  $apply?: string
  $compute?: string
  $count?: string
  $expand?: string
  $filter?: string
  $orderby?: string
  $search?: string
  $select?: string
  $skip?: string
  $top?: string
}
