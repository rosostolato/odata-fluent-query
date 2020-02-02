import { IFilterBuilder, IFilterExpression, FilterBuilder, IFilterBuilderTyped } from "./filterbuilder";
import { IOrderByBuilder, IOrderByExpression, OrderByBuilder, IOrderBy } from "./orderbyBuilder";
import { get_property_keys, mk_builder, mk_query_string } from "./utils";

export type QueryDescriptor = {
  key?:     string;
  skip:     number | 'none';
  take:     number | 'none';
  orderby:  string[]
  select:   string[];
  filters:  string[];
  expands:  QueryDescriptor[];
  strict?:  boolean;
  count?:   boolean;
}

export type RelationsOf<Model> = Pick<Model, {
  [P in keyof Model]: 
    Model[P] extends Date ? never : 
    Model[P] extends Uint8Array ? never : 
    Model[P] | Array<any> extends Object ? P : never
}[keyof Model]>

export type ExpandQueryComplex<T> = T extends Array<infer U>
  ? ExpandArrayQuery<U>
  : ExpandObjectQuery<T>


/**
 * OData Query instance where T is the object that will be used on query
 */
export class ODataQuery<T> {
  protected queryDescriptor: QueryDescriptor;

  /**
   * Create a new instance of ODataQuery
   */
  constructor();
  /**
   * @param key internal key selector
   * 
   * @internal
   */
  constructor(key: string);
  constructor(key?: string) {
    this.queryDescriptor = {
      key,
      skip: 'none',
      take: 'none',
      filters: [],
      expands: [],
      orderby: [],
      select: [],
      count: false
    }
  }

  /**
   * Adds a $select operator to the OData query.
   * There is only one instance of $select, if you call multiple times it will take the last one.
   * 
   * @param keys the names of the properties you want to select.
   * 
   * @example q.select('id', 'title').
   */
  select<key extends keyof T>(...keys: key[]): ODataQuery<T> {
    this.queryDescriptor = {
      ...this.queryDescriptor,
      select: keys.map(String),
      expands: this.queryDescriptor.expands.filter(e => keys.some(k => e.key == String(k)))
    };

    return this;
  }

  /**
   * Adds a $filter operator to the OData query.
   * Multiple calls to Filter will be merged with `and`.
   * 
   * @param exp a lambda expression that builds an expression from the builder.
   * 
   * @example q.filter(u => u.id.equals(1)).
   */
  filter(exp: (x: IFilterBuilder<T>) => IFilterExpression): ODataQuery<T>;
  /**
   * Adds a $filter operator to the OData query.
   * Multiple calls to Filter will be merged with `and`.
   * 
   * @param key property key selector.
   * @param exp a lambda expression that builds an expression from the builder.
   * 
   * @example q.filter('id', id => id.equals(1)).
   */
  filter<TKey extends keyof T>(key: TKey, exp: (x: IFilterBuilderTyped<T[TKey]>) => IFilterExpression): ODataQuery<T>;
  filter(keyOrExp: any, exp?: (x: any) => any): ODataQuery<T> {
    let expr: any;
    
    if (typeof keyOrExp === 'string') {
      // run expression
      expr = exp(new FilterBuilder(keyOrExp));
    } else {
      // set expression
      exp = keyOrExp;

      // read funciton string to retrieve keys
      const keys = get_property_keys(exp);

      if (!keys || !keys.length) {
        throw new Error('Could not find property key.');
      }
      
      // run expression
      expr = exp(mk_builder(keys, FilterBuilder));
    }

    if (expr.kind == 'none') {
      return this;
    }

    // this.queryDescriptor = {
    //   ...this.queryDescriptor,
    //   filters: this.queryDescriptor.filters.push(expr.getFilterExpresion())
    // };

    this.queryDescriptor.filters.push(expr.getFilterExpresion());

    return this;
  }

  /**
   * Adds a $expand operator to the OData query.
   * Multiple calls to Expand will expand all the relations, e.g.: $expand=rel1(...),rel2(...).
   * The lambda in the second parameter allows you to build a complex inner query.
   * 
   * @param key the name of the relation.
   * @param query a lambda expression that build the subquery from the querybuilder.
   * 
   * @example q.exand('blogs', q => q.select('id', 'title')).
   */
  expand<key extends keyof RelationsOf<T>, U = T[key]>(
    key: key,
    query?: (x: ExpandQueryComplex<U>) => ExpandQueryComplex<U>
  ): ODataQuery<T> {
    let expand: any = new ODataQuery(String(key));
    if (query) expand = query(expand);

    // this.queryDescriptor = {
    //   ...this.queryDescriptor,
    //   expands: 
    // };

    this.queryDescriptor.expands.push(expand['queryDescriptor']);

    return this;
  }

  /**
   * Adds a $orderby operator to the OData query.
   * Ordering over relations is supported (check you OData implementation for details).
   * 
   * @param exp a lambda expression that builds the orderby expression from the builder.
   * 
   * @example q.orderBy(u => u.blogs().id.desc()).
   */
  orderBy(exp: (ob: IOrderByBuilder<T>) => IOrderBy|IOrderByExpression): ODataQuery<T>;
  /**
   * Adds a $orderby operator to the OData query.
   * Ordering over relations is supported (check you OData implementation for details).
   * 
   * @param key key in T.
   * @param order the order of the sort.
   * 
   * @example q.orderBy('blogs', 'desc').
   */
  orderBy<TKey extends keyof T>(key: TKey, order?: 'asc'|'desc'): ODataQuery<T>;
  orderBy(keyOrExp: any, order?: 'asc'|'desc') {
    let orderby: any;

    if (typeof keyOrExp === 'string') {
      orderby = new OrderByBuilder(keyOrExp);

      // run orderer
      if (order) {
        orderby = orderby[order]();
      }

      // get string
      orderby = orderby.get();
    } else {
      // read funciton string
      const keys = get_property_keys(keyOrExp);

      if (!keys || !keys.length) {
        throw new Error('Could not find property key. Use the second overload of orderBy instead');
      }

      orderby = keyOrExp(mk_builder(keys, OrderByBuilder)).get();
    }

    this.queryDescriptor = {
      ...this.queryDescriptor,
      orderby: this.queryDescriptor.orderby.concat(orderby)
    };

    return this;
  }

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
  paginate(pagesize: number, page?: number): ODataQuery<T>;
  /**
   * Adds a $skip and $top to the OData query.
   * The pageindex in zero-based.
   * 
   * @param options paginate query options
   * 
   * @example q.paginate({ pagesize: 50, page: 0, count: false }).
   */
  paginate(options: { pagesize: number, page?: number, count?: boolean }): ODataQuery<T>
  paginate(options: any, page?: number): ODataQuery<T> {
    let data: {
      pagesize: number,
      page?: number,
      count?: boolean
    };
    
    if (typeof options === 'number') {
      data = {
        pagesize: options,
        page: page,
        count: true
      };
    } else {
      data = options;

      if (data.count === undefined) {
        data.count = true;
      }
    }

    this.queryDescriptor = {
      ...this.queryDescriptor,
      take: data.pagesize,
      skip: data.pagesize * data.page,
      count: data.count
    };

    if (!this.queryDescriptor.skip) {
      this.queryDescriptor.skip = 'none';
    }

    return this;
  }

  /**
   * set $count=true
   */
  count() {
    this.queryDescriptor = {
      ...this.queryDescriptor,
      count: true
    };

    return this;
  }

  /**
   * exports query to string
   */
  toString(): string {
    return mk_query_string(this.queryDescriptor);
  }
}

/**
 * OData Query instance where T is the object that will be used on query
 * @deprecated use 'ODataQuery' instead
 */
export class OQuery<T> extends ODataQuery<T> {}

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
  expand<key extends keyof RelationsOf<T>, U = T[key]>(
    key: key,
    query?: (x: ExpandQueryComplex<U>) => ExpandQueryComplex<U>
  ): ExpandObjectQuery<T>;
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
  orderBy(exp: (ob: IOrderByBuilder<T>) => IOrderBy|IOrderByExpression): ExpandArrayQuery<T>;
  /**
   * Adds a $orderby operator to the OData query.
   * Ordering over relations is supported (check you OData implementation for details).
   * 
   * @param key key in T.
   * @param order the order of the sort.
   * 
   * @example q.orderBy('blogs', 'desc').
   */
  orderBy<TKey extends keyof T>(key: TKey, order?: 'asc'|'desc'): ExpandArrayQuery<T>;

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
  expand<key extends keyof RelationsOf<T>, U = T[key]>(
    key: key,
    query?: (x: ExpandQueryComplex<U>) => ExpandQueryComplex<U>
  ): ExpandArrayQuery<T>;

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
  paginate(options: { pagesize: number, page?: number, count?: boolean }): ExpandArrayQuery<T>;

  /**
   * set $count=true
   */
  count(): ExpandArrayQuery<T>;
}
