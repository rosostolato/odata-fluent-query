import { FilterBuilderComplex, FilterExpresion, FilterBuilder } from "./filterbuilder";
import { List } from "immutable";

type QueryDescriptor = {
  filters: List<string>;
  expands: List<any>; // RelQueryDescriptor
  skip: number | 'none';
  take: number | 'none';
  orderby: string;
  select: List<string>;
  count: boolean;
}

export class OQuery<T extends object> {
  protected queryDescriptor: QueryDescriptor;
  protected filterBuilder: FilterBuilderComplex<T>;

  constructor(entity: new () => T) {
    this.queryDescriptor = {
      filters: List<string>(),
      expands: List<any>(), // RelQueryDescriptor
      skip: 'none',
      take: 'none',
      orderby: '',
      select: List<string>(),
      count: false
    }

    const keys: string[] = entity.prototype.__keys || [];
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
   * @example q.Filter(u => u.Id.Equals(1)).
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

  toString(): string {
    let params: string[] = [];
    const qd = this.queryDescriptor;
  
    if (qd.filters.isEmpty() == false) {
      params.push(`$filter=${qd.filters.join(' and ')}`);
    }
  
    if (qd.expands.isEmpty() == false) {
      // params.push(`$expand=${qd.expands.map(mk_rel_query_string).join(',')}`)
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
}
