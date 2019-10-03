import { FilterBuilderComplex, FilterExpresion, FilterBuilder } from "./filterbuilder";
import { OrderByBuilderComplex, OrderBy, OrderByProp } from "./orderbyBuilder";
import { getQueryKeys, getExpandType } from "./decorators";
import { List } from "immutable";

type QueryDescriptor = {
  key?: string;
  skip: number | 'none';
  take: number | 'none';
  orderby: List<string>
  select: List<string>;
  filters: List<string>;
  expands: List<QueryDescriptor>;
  strict?: boolean;
  count?: boolean;
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
  const orderMap: any = {
    key: (key: string) => new OrderByProp(`${prefix ? prefix + '/' : ''}${key}`)
  };
  
  if (entity) {
    const keys: string[] = getQueryKeys(entity.prototype);
  
    keys.forEach(key => {
      const type = getExpandType(entity, key as any);
  
      if (type) {
        orderMap[key] = mk_orderby_builder(type, key);
      } else {
        orderMap[key] = new OrderByProp(`${prefix ? prefix + '/' : ''}${key}`);
      }
    });
  }
  
  return orderMap;
}

export class OQuery<T extends object> {
  protected queryDescriptor: QueryDescriptor;
  protected filterBuilder: FilterBuilderComplex<T>;
  protected orderby: OrderByBuilderComplex<T>;

  constructor();
  constructor(entity: new () => T);
  constructor(entity: new () => T, key: string);
  constructor(private entity?: new () => T, key?: string) {
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
    
    this.orderby = mk_orderby_builder(entity);

    // filterBuilder
    this.filterBuilder = {
      key: (key: string) => new FilterBuilder(key)
    } as any;
    
    if (entity) {
      getQueryKeys(entity.prototype).forEach(
        key => this.filterBuilder[key] = new FilterBuilder(key)
      );
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
  select<key extends keyof T>(...keys: key[]): OQuery<T> {
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
   * @param conditional a lambda that builds an expression from the builder.
   * 
   * @example q.filter(u => u.id.equals(1)).
   */
  filter(conditional: (_: FilterBuilderComplex<T>) => FilterExpresion): OQuery<T> {
    let expr: FilterExpresion
    
    try {
      expr = conditional(this.filterBuilder);
    } catch (e) {
      throw new Error(
        e.message +
        ".\n\nThis error occurs when @EnableQuery decorator is on your property.\n" +
        "You can add it to your prop or use the 'key' prop to select the property key string.\n"
      );
    }

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
    const type: any = getExpandType(this.entity, key);
    let expand: any = new OQuery(type, String(key));
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
      orderby: this.queryDescriptor.orderby.concat(orderby)
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
   * @example q.paginate({page: 0, pagesize: 50, count: false}).
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
   * @param expression a lambda that builds the orderby expression from the builder.
   * 
   * @example q.orderBy(u => u.blogs().id.desc()).
   */
  orderBy(expression: (ob: OrderByBuilderComplex<T>) => OrderBy): ExpandArrayQuery<T>;

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
  paginate(page: number, pagesize: number): ExpandArrayQuery<T>;

  /**
   * Adds a $skip and $top to the OData query.
   * The pageindex in zero-based.
   * 
   * @param page the object with the pagesize and page.
   * 
   * @example q.paginate({page: 0, pagesize: 50}).
   */
  paginate(page: { page: number, pagesize: number }): ExpandArrayQuery<T>;
}

export function mk_query_descriptor(baseuri: string, base?: Partial<QueryDescriptor>): QueryDescriptor {
  const empty: QueryDescriptor = {
    filters: List<string>(),
    expands: List<QueryDescriptor>(),
    skip: 'none',
    take: 'none',
    orderby: List<string>(),
    select: List<string>(),
    count: false
  }

  if (base != undefined) {
    return { ...empty, ...base }
  }
  return empty
}

export function mk_rel_query_descriptor(key: string, base?: Partial<QueryDescriptor>): QueryDescriptor {
  const empty: QueryDescriptor = {
    key,
    skip: 'none',
    take: 'none',
    filters: List<string>(),
    orderby: List<string>(),
    select: List<string>(),
    expands: List(),
    strict: false
  }

  if (base != undefined) {
    return { ...empty, ...base }
  }

  return empty
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

  if (qd.orderby.isEmpty() == false) {
    params.push(`$orderby=${qd.orderby.join(',')}`);
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
