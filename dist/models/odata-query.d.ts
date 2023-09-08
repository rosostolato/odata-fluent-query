import { ExpandParam, ExpandKey, ExpandQueryComplex } from './query-expand';
import { FilterBuilder, FilterBuilderProp, FilterExpression } from './query-filter';
import { GroupbyBuilder } from './query-groupby';
import { OrderBy, OrderByBuilder, OrderByExpression } from './query-orderby';
import { SelectParams } from './query-select';
export interface ODataQuery<T> {
    /**
     * set $count=true
     */
    count(): ODataQuery<T>;
    /**
     * Adds a $expand operator to the OData query.
     * Multiple calls to Expand will expand all the relations, e.g.: $expand=rel1(...),rel2(...).
     * The lambda in the second parameter allows you to build a complex inner query.
     *
     * @param key the name of the relation.
     * @param query a lambda expression that build the subquery from the querybuilder.
     *
     * @example
     * q.exand('blogs', q => q.select('id', 'title'))
     * q.exand(u => u.blogs, q => q.select('id', 'title'))
     */
    expand<Tkey extends keyof ExpandKey<T>, U = Required<T>[Tkey]>(key: Tkey | ExpandParam<T, U>, query?: (x: ExpandQueryComplex<U>) => ExpandQueryComplex<U>): ODataQuery<T>;
    /**
     * Adds a $filter operator to the OData query.
     * Multiple calls to Filter will be merged with `and`.
     *
     * @param exp a lambda expression that builds an expression from the builder.
     *
     * @example
     * q.filter(u => u.id.equals(1))
     */
    filter(exp: (x: FilterBuilder<T>) => FilterExpression): ODataQuery<T>;
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
    filter<TKey extends keyof T>(key: TKey, exp: (x: FilterBuilderProp<T[TKey]>) => FilterExpression): ODataQuery<T>;
    /**
     * group by the selected keys
     *
     * @param keys keys to be grouped by
     * @param aggregate aggregate builder [optional]
     *
     * @example
     * q.groupBy(["email", "surname"], agg => agg
     *   .countdistinct("phoneNumbers", "count")
     *   .max("id", "id")
     * )
     */
    groupBy<key extends keyof T>(keys: key[], aggregate?: (aggregator: GroupbyBuilder<T>) => GroupbyBuilder<T>): ODataQuery<T>;
    /**
     * Adds a $orderby operator to the OData query.
     * Ordering over relations is supported (check OData implementation for details).
     *
     * @param key key in T.
     * @param order the order of the sort.
     *
     * @example
     * q.orderBy('blogs', 'desc')
     */
    orderBy<TKey extends keyof T>(key: TKey, order?: 'asc' | 'desc'): ODataQuery<T>;
    /**
     * Adds a $orderby operator to the OData query.
     * Ordering over relations is supported (check OData implementation for details).
     *
     * @param exp a lambda expression that builds the orderby expression from the builder.
     *
     * @example
     * q.orderBy(u => u.blogs().id.desc())
     */
    orderBy(exp: (ob: OrderByBuilder<T>) => OrderBy | OrderByExpression): ODataQuery<T>;
    /**
     * Adds a $skip and $top to the OData query.
     * The pageindex in zero-based.
     * This method automatically adds $count=true to the query.
     *
     * @param pagesize page index ($skip).
     * @param page page size ($top)
     *
     * @example
     * q.paginate(50, 0)
     */
    paginate(pagesize: number, page?: number): ODataQuery<T>;
    /**
     * Adds a $skip and $top to the OData query.
     * The pageindex in zero-based.
     *
     * @param options paginate query options
     *
     * @example
     * q.paginate({ pagesize: 50, page: 0, count: false })
     */
    paginate(options: {
        pagesize: number;
        page?: number;
        count?: boolean;
    }): ODataQuery<T>;
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
    select<Tkey extends keyof T>(...keys: SelectParams<T, Tkey>): ODataQuery<T>;
    /**
     * exports query to object key/value
     *
     * @example
     * {
     *  '$filter': 'order gt 5',
     *  '$select': 'id'
     * }
     */
    toObject(): QueryObject;
    /**
     * exports query to string joined with `&`
     *
     * @example
     * '$filter=order gt 5&$select=id'
     */
    toString(): string;
}
export type QueryObject = {
    $apply?: string;
    $count?: string;
    $expand?: string;
    $filter?: string;
    $orderby?: string;
    $select?: string;
    $skip?: string;
    $top?: string;
};
