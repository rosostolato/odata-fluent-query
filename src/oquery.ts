import { FilterBuilderComplex, FilterExpresion, FilterBuilder } from "./filterbuilder";
import { OrderByBuilderComplex, OrderBy, OrderByProp } from "./orderbyBuilder";
import { getQueryKeys, getExpandType } from "./decorators";
import { List } from "immutable";

type QueryDescriptor = {
  skip: number | 'none';
  take: number | 'none';
  orderby: string;
  select: List<string>;
  filters: List<string>;
  expands: List<RelQueryDescriptor>;
  count: boolean;
}

type RelQueryDescriptor = {
  key: string
  skip: number | 'none'
  take: number | 'none'
  orderby: List<string>
  select: List<string>
  filters: List<string>
  expands: List<RelQueryDescriptor>,
  strict: boolean
}

type RelationsOf<Model extends object> = Pick<Model, {
  [P in keyof Model]: 
    Model[P] extends Date ? never : 
    Model[P] extends Uint8Array ? never : 
    Model[P] extends object | List<any> ? P : 
    never
}[keyof Model]>

type ExpandQueryComplex<T> = T extends (infer A)[]
  ? ExpandArrayQuery<A>
  : ExpandObjectQuery<T>

function mk_orderby_builder(entity: new () => any, prefix?: string) {
  const keys: string[] = getQueryKeys(entity.prototype);
  const orderMap: any = {};

  keys.forEach(key => {
    const type = getExpandType(entity, key as any);

    if (type) {
      orderMap[key] = (p?: string) => mk_orderby_builder(type, key);
    } else {
      orderMap[key] = new OrderByProp(`${prefix ? prefix + '/' : ''}${key}`);
    }
  });
  
  return orderMap;
}

export function mk_query_string(qd: QueryDescriptor): string {
  let params: string[] = [];

  if (qd.filters.isEmpty() == false)
    params.push(`$filter=${qd.filters.join(' and ')}`);

  if (qd.expands.isEmpty() == false) {
    params.push(`$expand=${qd.expands.map(mk_rel_query_string).join(',')}`);
  }

  if (qd.select.isEmpty() == false) {
    params.push(`$select=${qd.select.join(',')}`);
  }

  if (qd.orderby) {
    params.push(`$orderby=${qd.orderby}`);
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

export function mk_rel_query_string(rqd: RelQueryDescriptor): string {
  let expand: string = rqd.key;

  if (rqd.strict) {
    expand += '!';
  }

  if (!rqd.filters.isEmpty() || !rqd.orderby.isEmpty() || !rqd.select.isEmpty() || !rqd.expands.isEmpty() || rqd.skip != 'none' || rqd.take != 'none') {
    expand += `(`;

    let operators = [];

    if (rqd.skip != 'none') {
      operators.push(`$skip=${rqd.skip}`);
    }

    if (rqd.take != 'none') {
      operators.push(`$top=${rqd.take}`);
    }

    if (rqd.orderby.isEmpty() == false) {
      operators.push(`$orderby=${rqd.orderby.join(',')}`);
    }

    if (rqd.select.isEmpty() == false) {
      operators.push(`$select=${rqd.select.join(',')}`);
    }

    if (rqd.filters.isEmpty() == false) {
      operators.push(`$filter=${rqd.filters.join(' and ')}`);
    }

    if (rqd.expands.isEmpty() == false) {
      operators.push(`$expand=${rqd.expands.map(mk_rel_query_string).join(',')}`);
    }

    expand += operators.join(';') + ')';
  }

  return expand
}

export class OQuery<T extends object> {
  protected queryDescriptor: QueryDescriptor;
  protected filterBuilder: FilterBuilderComplex<T>;
  protected orderby: OrderByBuilderComplex<T>;

  constructor(private entity: new () => T) {
    this.queryDescriptor = {
      filters: List<string>(),
      expands: List<RelQueryDescriptor>(),
      skip: 'none',
      take: 'none',
      orderby: '',
      select: List<string>(),
      count: false
    }
    
    this.orderby = mk_orderby_builder(entity);

    const keys: string[] = getQueryKeys(entity.prototype);
    const filterMap: any = {};
    keys.forEach(key => filterMap[key] = new FilterBuilder(key));
    this.filterBuilder = filterMap;
  }

  /**
   * Adds a $select operator to the OData query.
   * There is only one instance of $select, if you call multiple times it will take the last one.
   * 
   * @param keys the names of the properties you want to select.
   * 
   * @example q.select('id', 'title').
   */
  select<key extends keyof T>(...keys: key[]): OQuery<T> {
    this.queryDescriptor = {
      ...this.queryDescriptor,
      select: List(keys.map(String)),
      expands: this.queryDescriptor.expands.filter(e => keys.some(k => e.key == String(k))).toList()
    };

    return this;
  }

  /**
   * Adds a $filter operator to the OData query.
   * Multiple calls to Filter will be merged with `and`.
   * 
   * @param conditional a lambda that builds an expression from the builder.
   * 
   * @example q.filter(u => u.id.equals(1)).
   */
  filter(conditional: (_: FilterBuilderComplex<T>) => FilterExpresion): OQuery<T> {
    const expr = conditional(this.filterBuilder);
    if (expr.kind == 'none') {
      return this;
    }

    this.queryDescriptor = {
      ...this.queryDescriptor,
      filters: this.queryDescriptor.filters.push(expr.getFilterExpresion())
    };

    return this;
  }

  /**
   * Adds a $expand operator to the OData query.
   * Multiple calls to Expand will expand all the relations, e.g.: $expand=rel1(...),rel2(...).
   * The lambda in the second parameter allows you to build a complex inner query.
   * 
   * @param key the name of the relation.
   * @param query a lambda that build the subquery from the querybuilder.
   * 
   * @example q.exand('blogs', q => q.select('id', 'title')).
   */
  expand<key extends keyof RelationsOf<T>, U = T[key]>(
    key: key,
    query?: (_: ExpandQueryComplex<U>) => ExpandQueryComplex<U>
  ): OQuery<T> {
    const type = getExpandType(this.entity, key);
    let expand: any = new ExpandQuery(type, String(key));
    if (query) expand = query(expand);

    const des = expand['queryDescriptor'];

    this.queryDescriptor = {
      ...this.queryDescriptor,
      expands: this.queryDescriptor.expands.push(des)
    };

    return this;
  }

  /**
   * Adds a $orderby operator to the OData query.
   * Ordering over relations is supported (check you OData implementation for details).
   * 
   * @param expression a lambda that builds the orderby expression from the builder.
   * 
   * @example q.orderBy(u => u.blogs().id.desc()).
   */
  orderBy(expression: (ob: OrderByBuilderComplex<T>) => OrderBy): OQuery<T> {
    const orderby = expression(this.orderby).get();

    this.queryDescriptor = {
      ...this.queryDescriptor,
      orderby: orderby
    };

    return this;
  }

  /**
   * Adds a $skip and $top to the OData query.
   * The pageindex in zero-based. This method automatically adds $count=true to the query.
   * 
   * @param page page index ($skip).
   * @param pagesize page size ($top);
   * 
   * @example q.paginate(0, 50).
   */
  paginate(page: number, pagesize: number): OQuery<T>;

  /**
   * Adds a $skip and $top to the OData query.
   * The pageindex in zero-based.
   * 
   * @param page the object with the pagesize and page.
   * 
   * @example q.paginate({page: 0, pagesize: 10, count: false}).
   */
  paginate(page: { page: number, pagesize: number, count?: boolean }): OQuery<T>

  paginate(page: number|{ page: number, pagesize: number, count?: boolean }, pagesize?: number): OQuery<T> {
    let o: { page: number, pagesize: number, count?: boolean };
    
    if (typeof page === 'number') {
      o = {
        page,
        pagesize,
        count: true
      }
    } else {
      o = page;
    }

    this.queryDescriptor = {
      ...this.queryDescriptor,
      take: o.pagesize,
      skip: o.pagesize * o.page,
      count: o.count || true
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

export class ExpandQuery<T extends Object> {
  protected queryDescriptor: RelQueryDescriptor;
  protected filterBuilder: FilterBuilderComplex<T>;

  constructor (private entity: new () => T, key: string) {
    this.queryDescriptor = {
      key,
      skip: 'none',
      take: 'none',
      filters: List<string>(),
      orderby: List<string>(),
      select: List<string>(),
      expands: List(),
      strict: false
    }

    const keys: string[] = getQueryKeys(entity.prototype);
    const map: any = {};

    keys.forEach(key => map[key] = new FilterBuilder(key));
    this.filterBuilder = map;
  }

  /**
   * selects properties from the model.
   * @param keys the names of the properties.
   * 
   * @example q => q.select('id', 'title').
   */
  select<key extends keyof T>(...keys: key[]): ExpandQuery<T> {
    this.queryDescriptor = {
      ...this.queryDescriptor,
      select: List(keys.map(String))
    };

    return this;
  }

  /**
   * Adds a $filter operator to the OData query.
   * Multiple calls to Filter will be merged with `and`.
   * 
   * @param conditional a lambda that builds an expression from the builder.
   * 
   * @example q.Filter(u => u.Id.Equals(1)).
   */
  filter(conditional: (_: FilterBuilderComplex<T>) => FilterExpresion): ExpandQuery<T> {
    const expr = conditional(this.filterBuilder)
    if (expr.kind == 'none') {
      return this
    }

    this.queryDescriptor = {
      ...this.queryDescriptor,
      filters: this.queryDescriptor.filters.push(expr.getFilterExpresion())
    };

    return this;
  }

  /**
   * Adds a $expand operator to the OData query.
   * Multiple calls to Expand will expand all the relations, e.g.: $expand=rel1(...),rel2(...).
   * The lambda in the second parameter allows you to build a complex inner query.
   * 
   * @param key the name of the relation.
   * @param query   a lambda that build the subquery from the querybuilder.
   * 
   * @example q.exand('blogs', q => q.select('id', 'title')).
   */
  expand<key extends keyof RelationsOf<T>, U = T[key]>(
    key: key,
    query?: (_: ExpandQueryComplex<U>) => ExpandQueryComplex<U>
  ): ExpandQuery<T> {
    const type = getExpandType(this.entity, key);
    let expand: any = new ExpandQuery(type, String(key));
    if (query) expand = query(expand);

    const des = expand['queryDescriptor'];

    this.queryDescriptor = {
      ...this.queryDescriptor,
      expands: this.queryDescriptor.expands.push(des)
    };

    return this;
  }

  /**
   * Adds a $orderby operator to the OData query.
   * Ordering over relations is supported (check you OData implementation for details).
   * 
   * @param props the props and mode to sort on.
   * 
   * @example q.orderBy({prop: 'id', mode: 'desc'}).
   */
  orderBy(...props: { prop: keyof T, mode?: 'asc' | 'desc' }[]): ExpandQuery<T> {
    const orderby = props.map(s => `${s.prop}${s.mode ? ` ${s.mode}` : ''}`);

    this.queryDescriptor = {
      ...this.queryDescriptor,
      orderby: this.queryDescriptor.orderby.concat(orderby).toList()
    };

    return this;
  }

  /**
   * Adds a $skip and $top to the OData query.
   * The pageindex in zero-based. This method automatically adds $count=true to the query.
   * 
   * @param page page index ($skip).
   * @param pagesize page size ($top);
   * 
   * @example q.paginate(0, 50).
   */
  paginate(page: number, pagesize: number): ExpandQuery<T>;

  /**
   * Adds a $skip and $top to the OData query.
   * The pageindex in zero-based.
   * 
   * @param page the object with the pagesize and page.
   * 
   * @example q.paginate({page: 0, pagesize: 10, count: false}).
   */
  paginate(page: { page: number, pagesize: number }): ExpandQuery<T>

  paginate(page: number|{ page: number, pagesize: number }, pagesize?: number): ExpandQuery<T> {
    let o: { page: number, pagesize: number };
    
    if (typeof page === 'number') {
      o = {
        page,
        pagesize
      }
    } else {
      o = page;
    }

    this.queryDescriptor = {
      ...this.queryDescriptor,
      take: o.pagesize,
      skip: o.pagesize * o.page
    };

    return this;
  }
}

export interface ExpandObjectQuery<T extends Object> {
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
   * @param query   a lambda that build the subquery from the querybuilder.
   * 
   * @example q.exand('blogs', q => q.select('id', 'title')).
   */
  expand<key extends keyof RelationsOf<T>, U = T[key]>(
    key: key,
    query?: (_: ExpandQueryComplex<U>) => ExpandQueryComplex<U>
  ): ExpandObjectQuery<T>;
}

export interface ExpandArrayQuery<T extends Object> {
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
   * @param conditional a lambda that builds an expression from the builder.
   * 
   * @example q.Filter(u => u.Id.Equals(1)).
   */
  filter(conditional: (_: FilterBuilderComplex<T>) => FilterExpresion): ExpandArrayQuery<T>;

  /**
   * Adds a $orderby operator to the OData query.
   * Ordering over relations is supported (check you OData implementation for details).
   * 
   * @param props the props and mode to sort on.
   * 
   * @example q.orderBy({prop: 'id', mode: 'desc'}).
   */
  orderBy(...props: { prop: keyof T, mode?: 'asc' | 'desc' }[]): ExpandQuery<T>;

  /**
   * Adds a $expand operator to the OData query.
   * Multiple calls to Expand will expand all the relations, e.g.: $expand=rel1(...),rel2(...).
   * The lambda in the second parameter allows you to build a complex inner query.
   * 
   * @param key the name of the relation.
   * @param query   a lambda that build the subquery from the querybuilder.
   * 
   * @example q.exand('blogs', q => q.select('id', 'title')).
   */
  expand<key extends keyof RelationsOf<T>, U = T[key]>(
    key: key,
    query?: (_: ExpandQueryComplex<U>) => ExpandQueryComplex<U>
  ): ExpandArrayQuery<T>;
  
  /**
   * Adds a $skip and $top to the OData query.
   * The pageindex in zero-based. This method automatically adds $count=true to the query.
   * 
   * @param page page index ($skip).
   * @param pagesize page size ($top);
   * 
   * @example q.paginate(0, 50).
   */
  paginate(page: number, pagesize: number): ExpandQuery<T>;

  /**
   * Adds a $skip and $top to the OData query.
   * The pageindex in zero-based.
   * 
   * @param page the object with the pagesize and page.
   * 
   * @example q.paginate({page: 0, pagesize: 10, count: false}).
   */
  paginate(page: { page: number, pagesize: number }): ExpandQuery<T>;
}
