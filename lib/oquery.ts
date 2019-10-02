import { FilterBuilderComplex, FilterExpresion, FilterBuilder } from "./filterbuilder";
import { getPropertyKeys, getPropertyType } from "./decorators";
import { List } from "immutable";

type QueryDescriptor = {
  filters: List<string>;
  expands: List<RelQueryDescriptor>;
  skip: number | 'none';
  take: number | 'none';
  orderby: string;
  select: List<string>;
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

export class OQuery<T extends object> {
  protected queryDescriptor: QueryDescriptor;
  protected filterBuilder: FilterBuilderComplex<T>;

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

    const keys: string[] = getPropertyKeys(entity.prototype);
    const map: any = {};

    keys.forEach(key => map[key] = new FilterBuilder(key));
    this.filterBuilder = map;
  }

  /**
   * Adds a $select operator to the OData query.
   * There is only one instance of $select, if you call multiple times it will take the last one.
   * 
   * @param keys the names of the properties you want to select.
   * 
   * @example q.select('Id', 'Title').
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
  // expand<key extends keyof RelationsOf<T>, U = T[key]>(
  //   key: key,
  //   query?: (_: ExpandQuery<U>) => ExpandQuery<U>
  // ): OQuery<T>;
  expand<key extends keyof RelationsOf<T>, U = T[key]>(
    key: key,
    query?: (_: ExpandQuery<U>) => ExpandQuery<U>
  ): OQuery<T> {
    const type = getPropertyType(this.entity, key);
    let expand = new ExpandQuery(String(key), type);

    if (query) {
      // @ts-ignore
      expand = query(expand);
    }

    const des = expand['queryDescriptor'];

    this.queryDescriptor = {
      ...this.queryDescriptor,
      expands: this.queryDescriptor.expands.push(des)
    };

    return this;
  }

  toString(): string {
    let params: string[] = [];
    const qd = this.queryDescriptor;
  
    if (qd.filters.isEmpty() == false) {
      params.push(`$filter=${qd.filters.join(' and ')}`);
    }
  
    if (qd.expands.isEmpty() == false) {
      params.push(`$expand=${qd.expands.map(this.makeRelQueryString).join(',')}`)
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
      params.push(`$top=${qd.take}`)
    }
  
    if (qd.count == true) {
      params.push(`$count=true`);
    }
  
    return `${params.join('&')}`
  }

  private makeRelQueryString(rqd: RelQueryDescriptor): string {
    let expand: string = rqd.key;
  
    if (rqd.strict) {
      expand += '!';
    }
  
    if (!rqd.filters.isEmpty() || !rqd.orderby.isEmpty() || !rqd.select.isEmpty() || rqd.skip != 'none' || rqd.take != 'none') {
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
        operators.push(`$expand=${rqd.expands.map(this.makeRelQueryString).join(',')}`);
      }
  
      expand += operators.join(';') + ')';
    }
  
    return expand
  }
}

export class ExpandQuery<T extends Object> {
  protected queryDescriptor: RelQueryDescriptor;
  protected filterBuilder: FilterBuilderComplex<T>;

  constructor (key: string, private entity: new () => T) {
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

    const keys: string[] = getPropertyKeys(entity.prototype);
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
}

export class SelectedRelationQuery<T extends object, R extends object> {
}

// export type RelationBuilder<T extends object> = {
//   [P in keyof T]: () => ExpandQuery<
//     ObjectOrUnit<UnBoxed<T[P]>>,
//     UnBoxed<ObjectOrUnit<T[P]>>
//   >
// };

export type UnBoxed<T> = T extends any[] ? T[0] : T extends List<infer R> ? R : T

export type RelationsOf<Model extends object> = Pick<Model, {
  [P in keyof Model]: 
    Model[P] extends Date ? never : 
    Model[P] extends Uint8Array ? never : 
    Model[P] extends object | List<any> ? P : 
    never
}[keyof Model]>

export type PropertiesOf<Model extends object> = Pick<Model, {
  [P in keyof Model]: Model[P] extends string | number | boolean | Date | Uint8Array ? P : never
}[keyof Model]>

export type ObjectOrUnit<T> = T extends object ? T : {}

export type InherentBoxing<From, To> =
  From extends List<any> ? List<To> :
  From extends any[] ? To[] :
  To

export type InferQueryResult<T> =
  T extends SelectedRelationQuery<any, infer R> ? R : never
