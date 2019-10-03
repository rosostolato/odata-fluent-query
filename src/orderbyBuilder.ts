import { List } from "immutable";

export type OrderByBuilder<T> =
  T extends number | string | boolean | Date | Uint8Array ? OrderByProp :
  T extends List<infer R> ? R extends object ? ((prefix?: string) => OrderByBuilderComplex<R>) : never :
  T extends Array<infer R> ? R extends object ? ((prefix?: string) => OrderByBuilderComplex<R>) : never :
  T extends object ? ((prefix?: string) => OrderByBuilderComplex<T>)
  : never;

export type OrderByBuilderComplex<T extends object> = {
  [P in keyof T]: OrderByBuilder<T[P]>;
}

export interface OrderBy {
  get: () => string;
}

export class OrderWithAscOrDesc implements OrderBy {
  constructor(private readonly order: string) { }

  get = () => this.order;
}

export class OrderByProp implements OrderBy {
  constructor(private readonly order: string) { }

  get = () => this.order;
  Asc = () => new OrderWithAscOrDesc(this.order + ' asc');
  Desc = () => new OrderWithAscOrDesc(this.order + ' desc');
}