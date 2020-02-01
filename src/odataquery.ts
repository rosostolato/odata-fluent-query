import { FilterBuilderComplex, FilterExpresion, FilterBuilder, FilterBuilderTyped } from "./filterbuilder";
import { OrderByBuilderComplex, OrderBy, OrderByProp } from "./orderbyBuilder";
import { List } from "immutable";

type QueryDescriptor = {
  key?:     string;
  skip:     number | 'none';
  take:     number | 'none';
  orderby:  List<string>
  select:   List<string>;
  filters:  List<string>;
  expands:  List<QueryDescriptor>;
  strict?:  boolean;
  count?:   boolean;
}

type RelationsOf<Model> = Pick<Model, {
  [P in keyof Model]: 
    Model[P] extends Date ? never : 
    Model[P] extends Uint8Array ? never : 
    Model[P] | Array<any> extends Object ? P : never
}[keyof Model]>

type ExpandQueryComplex<T> = T extends (infer U)[]
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
      filters: List<string>(),
      expands: List<QueryDescriptor>(),
      orderby: List<string>(),
      select: List<string>(),
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
      select: List(keys.map(String)),
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
  filter(exp: (x: FilterBuilderComplex<T>) => FilterExpresion): ODataQuery<T>;
  /**
   * Adds a $filter operator to the OData query.
   * Multiple calls to Filter will be merged with `and`.
   * 
   * @param key property key selector.
   * @param exp a lambda expression that builds an expression from the builder.
   * 
   * @example q.filter('id', id => id.equals(1)).
   */
  filter<TKey extends keyof T>(key: TKey, exp: (x: FilterBuilderTyped<T[TKey]>) => FilterExpresion): ODataQuery<T>;
  filter(keyOrExp: any, exp?: (x: any) => any): ODataQuery<T> {
    let expr: FilterExpresion;
    
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

      const builder: {
        [TKey in keyof T]?: FilterBuilder
      } = { };

      keys.forEach(k => {
        builder[k] = new FilterBuilder(k);
      });
      
      // run expression
      expr = exp(builder);
    }

    if (expr._kind == 'none') {
      return this;
    }

    this.queryDescriptor = {
      ...this.queryDescriptor,
      filters: this.queryDescriptor.filters.push(expr._getFilterExpresion())
    };

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

    this.queryDescriptor = {
      ...this.queryDescriptor,
      expands: this.queryDescriptor.expands.push(expand['queryDescriptor'])
    };

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
  orderBy(exp: (ob: OrderByBuilderComplex<T>) => OrderBy): ODataQuery<T>;
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
      orderby = new OrderByProp(keyOrExp);

      // run orderer
      if (order) {
        orderby = orderby[order]();
      }

      // get string
      orderby = orderby._get();
    } else {
      // read funciton string
      const keys = get_property_keys(keyOrExp);

      if (!keys || !keys.length) {
        throw new Error('Could not find property key. Use the second overload of orderBy instead');
      }

      const builder: { [TKey in keyof T]?: OrderByProp } = { };
      keys.forEach(k => builder[k] = new OrderByProp(k));

      orderby = keyOrExp(builder)._get();
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
  filter(exp: (x: FilterBuilderComplex<T>) => FilterExpresion): ExpandArrayQuery<T>;
  /**
   * Adds a $filter operator to the OData query.
   * Multiple calls to Filter will be merged with `and`.
   * 
   * @param key property key selector.
   * @param exp a lambda expression that builds an expression from the builder.
   * 
   * @example q.filter('id', id => id.equals(1)).
   */
  filter<TKey extends keyof T>(key: TKey, exp: (x: FilterBuilderTyped<T[TKey]>) => FilterExpresion): ExpandArrayQuery<T>;

  /**
   * Adds a $orderby operator to the OData query.
   * Ordering over relations is supported (check you OData implementation for details).
   * 
   * @param exp a lambda expression that builds the orderby expression from the builder.
   * 
   * @example q.orderBy(u => u.blogs().id.desc()).
   */
  orderBy(exp: (ob: OrderByBuilderComplex<T>) => OrderBy): ExpandArrayQuery<T>;
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

export function mk_query_string_parentheses(query: string) {
  if (query.indexOf(' or ') > -1 || query.indexOf(' and ') > -1) {
    return `(${query})`;
  }

  return query;
}

export function mk_query_string(qd: QueryDescriptor): string {
  let params: string[] = [];

  if (qd.filters.isEmpty() == false) {
    if (qd.filters.count() > 1) {
      params.push(`$filter=${qd.filters.map(mk_query_string_parentheses).join(' and ')}`);
    } else {
      params.push(`$filter=${qd.filters.join()}`);
    }
  }

  if (qd.expands.isEmpty() == false) {
    params.push(`$expand=${qd.expands.map(mk_rel_query_string).join(',')}`);
  }

  if (qd.select.isEmpty() == false) {
    params.push(`$select=${qd.select.join(',')}`);
  }

  if (qd.orderby.isEmpty() == false) {
    params.push(`$orderby=${qd.orderby.last()}`);
  }

  if (qd.skip != 'none') {
    params.push(`$skip=${qd.skip}`);
  }

  if (qd.take != 'none') {
    params.push(`$top=${qd.take}`);
  }

  if (qd.count == true) {
    params.push(`$count=true`);
  }

  return params.join('&');
}

export function mk_rel_query_string(rqd: QueryDescriptor): string {
  let expand: string = rqd.key;

  if (rqd.strict) {
    expand += '!';
  }

  if (!rqd.filters.isEmpty() || !rqd.orderby.isEmpty() || !rqd.select.isEmpty() || !rqd.expands.isEmpty() || rqd.skip != 'none' || rqd.take != 'none' || rqd.count != false) {
    expand += `(`;

    let operators = [];

    if (rqd.skip != 'none') {
      operators.push(`$skip=${rqd.skip}`);
    }

    if (rqd.take != 'none') {
      operators.push(`$top=${rqd.take}`);
    }

    if (rqd.count == true) {
      operators.push(`$count=true`);
    }

    if (rqd.orderby.isEmpty() == false) {
      operators.push(`$orderby=${rqd.orderby.join(',')}`);
    }

    if (rqd.select.isEmpty() == false) {
      operators.push(`$select=${rqd.select.join(',')}`);
    }

    if (rqd.filters.isEmpty() == false) {
      if (rqd.filters.count() > 1) {
        operators.push(`$filter=${rqd.filters.map(mk_query_string_parentheses).join(' and ')}`);
      } else {
        operators.push(`$filter=${rqd.filters.join()}`);
      }
    }

    if (rqd.expands.isEmpty() == false) {
      operators.push(`$expand=${rqd.expands.map(mk_rel_query_string).join(',')}`);
    }

    expand += operators.join(';') + ')';
  }

  return expand
}

/**
 * get property key name used in the expression function
 * 
 * @param exp expression function
 */
export function get_property_keys(exp: (...args: any[]) => any): string[] {
  let funcStr = exp.toString();
  const arg = new RegExp(/(return *|=> *?)([a-zA-Z_0-9]+)/).exec(funcStr)[2];

  let match: RegExpExecArray;
  const keys: string[] = [];
  const reg = new RegExp(arg + '\\.([a-zA-Z_0-9]+)');

  while (match = reg.exec(funcStr)) {
    funcStr = funcStr.replace(reg, '');
    keys.push(match[1]);
  }

  return keys;
}
