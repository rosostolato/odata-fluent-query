import { RelationsOf } from "./odata-query";
import { IOrderByBuilder, IOrderBy, IOrderByExpression } from "./orderby-Builder";
import { IFilterBuilder, IFilterExpression, IFilterBuilderTyped } from "./filter-builder";
export declare type ExpandQueryComplex<T> = T extends Array<infer U> ? ExpandArrayQuery<U> : ExpandObjectQuery<T>;
export interface ExpandObjectQuery<T> {
    /**
     * selects properties from the model.
     * @param keys the names of the properties.
     *
     * @example q => q.select('id', 'title').
     */
    select<key extends keyof T>(...keys: key[]): ExpandObjectQuery<T>;
    /**
     * Adds a $expand operator to the OData query.
     * Multiple calls to Expand will expand all the relations, e.g.: $expand=rel1(...),rel2(...).
     * The lambda in the second parameter allows you to build a complex inner query.
     *
     * @param key the name of the relation.
     * @param query   a lambda expression that build the subquery from the querybuilder.
     *
     * @example q.exand('blogs', q => q.select('id', 'title')).
     */
    expand<key extends keyof RelationsOf<T>, U = T[key]>(key: key, query?: (x: ExpandQueryComplex<U>) => ExpandQueryComplex<U>): ExpandObjectQuery<T>;
}
export interface ExpandArrayQuery<T> {
    /**
     * selects properties from the model.
     * @param keys the names of the properties.
     *
     * @example q => q.select('id', 'title').
     */
    select<key extends keyof T>(...keys: key[]): ExpandArrayQuery<T>;
    /**
     * Adds a $filter operator to the OData query.
     * Multiple calls to Filter will be merged with `and`.
     *
     * @param exp a lambda expression that builds an expression from the builder.
     *
     * @example q.filter(u => u.id.equals(1)).
     */
    filter(exp: (x: IFilterBuilder<T>) => IFilterExpression): ExpandArrayQuery<T>;
    /**
     * Adds a $filter operator to the OData query.
     * Multiple calls to Filter will be merged with `and`.
     *
     * @param key property key selector.
     * @param exp a lambda expression that builds an expression from the builder.
     *
     * @example q.filter('id', id => id.equals(1)).
     */
    filter<TKey extends keyof T>(key: TKey, exp: (x: IFilterBuilderTyped<T[TKey]>) => IFilterExpression): ExpandArrayQuery<T>;
    /**
     * Adds a $orderby operator to the OData query.
     * Ordering over relations is supported (check you OData implementation for details).
     *
     * @param exp a lambda expression that builds the orderby expression from the builder.
     *
     * @example q.orderBy(u => u.blogs().id.desc()).
     */
    orderBy(exp: (ob: IOrderByBuilder<T>) => IOrderBy | IOrderByExpression): ExpandArrayQuery<T>;
    /**
     * Adds a $orderby operator to the OData query.
     * Ordering over relations is supported (check you OData implementation for details).
     *
     * @param key key in T.
     * @param order the order of the sort.
     *
     * @example q.orderBy('blogs', 'desc').
     */
    orderBy<TKey extends keyof T>(key: TKey, order?: 'asc' | 'desc'): ExpandArrayQuery<T>;
    /**
     * Adds a $expand operator to the OData query.
     * Multiple calls to Expand will expand all the relations, e.g.: $expand=rel1(...),rel2(...).
     * The lambda in the second parameter allows you to build a complex inner query.
     *
     * @param key the name of the relation.
     * @param query   a lambda expression that build the subquery from the querybuilder.
     *
     * @example q.exand('blogs', q => q.select('id', 'title')).
     */
    expand<key extends keyof RelationsOf<T>, U = T[key]>(key: key, query?: (x: ExpandQueryComplex<U>) => ExpandQueryComplex<U>): ExpandArrayQuery<T>;
    /**
     * Adds a $skip and $top to the OData query.
     * The pageindex in zero-based.
     * This method automatically adds $count=true to the query.
     *
     * @param pagesize page index ($skip).
     * @param page page size ($top)
     *
     * @example q.paginate(50, 0).
     */
    paginate(pagesize: number, page?: number): ExpandArrayQuery<T>;
    /**
     * Adds a $skip and $top to the OData query.
     * The pageindex in zero-based.
     *
     * @param options paginate query options
     *
     * @example q.paginate({ pagesize: 50, page: 0, count: false }).
     */
    paginate(options: {
        pagesize: number;
        page?: number;
        count?: boolean;
    }): ExpandArrayQuery<T>;
    /**
     * set $count=true
     */
    count(): ExpandArrayQuery<T>;
}
