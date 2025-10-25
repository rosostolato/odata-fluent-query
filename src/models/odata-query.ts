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
import { SelectParams } from './query-select'
import {
  ExpandedOptionalProperties,
  IntersectTypes,
  OptionalProperties,
  RequiredProperties,
  SelectedProperties,
} from './type-utils'

export type QueryObject = {
  $apply?: string
  $compute?: string
  $count?: string
  $expand?: string
  $filter?: string
  $orderby?: string
  $select?: string
  $skip?: string
  $top?: string
}

// Main result type that combines all transformations
export type QueryResultType<
  T,
  TSelected extends keyof T | keyof TComputed | never = never,
  TComputed = {},
  TExpanded extends keyof OptionalProperties<T> = never
> = [TSelected] extends [never]
  ? // No select applied - include all required properties + expanded navigation properties + computed fields
    IntersectTypes<
      IntersectTypes<
        RequiredProperties<T>,
        ExpandedOptionalProperties<T, TExpanded>
      >,
      TComputed
    >
  : // Select applied - create intersection of selected properties
    IntersectTypes<
      IntersectTypes<
        SelectedProperties<T, TSelected & keyof RequiredProperties<T>>,
        ExpandedOptionalProperties<T, TSelected & TExpanded>
      >,
      SelectedProperties<TComputed, TSelected & keyof TComputed>
    >

export interface ODataQuery<
  T,
  TSelected extends keyof T | keyof TComputed | never = never,
  TComputed = {},
  TExpanded extends keyof OptionalProperties<T> = never
> {
  /**
   * Creates an ODataQuery from a query string
   *
   * @param queryString The OData query string to parse (e.g., "$filter=id eq 1&$select=name")
   * @returns A new ODataQuery instance
   * @example
   * ODataQuery.fromString<User>("$filter=id eq 1&$select=name,email")
   */
  fromString?: never // This makes fromString unavailable on instances

  /**
   * Sets $count=true in the OData query.
   * @returns The OData query with count enabled
   * @example
   * q.count()
   */
  count(): ODataQuery<T, TSelected, TComputed, TExpanded>

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
  ): ODataQuery<
    T,
    TSelected,
    TComputed,
    TExpanded | (Tkey & keyof OptionalProperties<T>)
  >

  /**
   * Adds $filter operator in the OData query.
   * Multiple calls to Filter will be merged with `and`.
   *
   * @param exp Expression that builds an expression from the builder
   *
   * @example
   * q.filter(u => u.id.equals(1))
   */
  filter(
    exp: (x: FilterBuilder<T>) => FilterExpression
  ): ODataQuery<T, TSelected, TComputed, TExpanded>
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
  ): ODataQuery<T, TSelected, TComputed, TExpanded>

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
  ): ODataQuery<T, TSelected, TComputed, TExpanded>

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
  ): ODataQuery<T, TSelected, TComputed, TExpanded>
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
  ): ODataQuery<T, TSelected, TComputed, TExpanded>

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
  paginate(
    pagesize: number,
    page?: number
  ): ODataQuery<T, TSelected, TComputed, TExpanded>
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
  }): ODataQuery<T, TSelected, TComputed, TExpanded>

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
  select<K1 extends keyof T>(k1: K1): ODataQuery<T, K1, TComputed, TExpanded>
  select<K1 extends keyof T, K2 extends keyof T>(
    k1: K1,
    k2: K2
  ): ODataQuery<T, K1 | K2, TComputed, TExpanded>
  select<K1 extends keyof T, K2 extends keyof T, K3 extends keyof T>(
    k1: K1,
    k2: K2,
    k3: K3
  ): ODataQuery<T, K1 | K2 | K3, TComputed, TExpanded>
  select<
    K1 extends keyof T,
    K2 extends keyof T,
    K3 extends keyof T,
    K4 extends keyof T
  >(
    k1: K1,
    k2: K2,
    k3: K3,
    k4: K4
  ): ODataQuery<T, K1 | K2 | K3 | K4, TComputed, TExpanded>
  select<
    K1 extends keyof T,
    K2 extends keyof T,
    K3 extends keyof T,
    K4 extends keyof T,
    K5 extends keyof T
  >(
    k1: K1,
    k2: K2,
    k3: K3,
    k4: K4,
    k5: K5
  ): ODataQuery<T, K1 | K2 | K3 | K4 | K5, TComputed, TExpanded>
  select<TKey extends keyof T>(
    ...keys: SelectParams<T, TKey>
  ): ODataQuery<T, TKey, TComputed, TExpanded>

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
  ): ODataQuery<
    T & Record<K, InferComputeType<V>>,
    TSelected extends never ? never : TSelected,
    TComputed & Record<K, InferComputeType<V>>,
    TExpanded
  >

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

  /**
   * Type-only property for TypeScript inference. Use `typeof query.type` to get the result type.
   * This property exists only for type inference and has no runtime value.
   *
   * @example
   * const query = odataQuery<User>().select('id', 'name')
   * type UserResponse = typeof query.type // Will be Pick<User, 'id' | 'name'>
   *
   * const result = await http.get<UserResponse>(`/Users?${query.toString()}`)
   */
  readonly type: QueryResultType<T, TSelected, TComputed, TExpanded>
}

export interface ODataQueryStatic {
  /**
   * Creates an ODataQuery from a query string
   *
   * @param queryString The OData query string to parse (e.g., "$filter=id eq 1&$select=name")
   * @returns A new ODataQuery instance
   * @example
   * odataQuery.fromString<User>("$filter=id eq 1&$select=name,email")
   */
  fromString<T>(queryString: string): ODataQuery<T>
}
