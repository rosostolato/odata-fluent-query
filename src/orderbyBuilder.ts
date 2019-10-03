import { List } from "immutable";

export type OrderByBuilder<T> =
  T extends number | string | boolean | Date | Uint8Array ? OrderByProp :
  T extends List<infer R> ? R extends object ? OrderByBuilderComplex<R> : never :
  T extends Array<infer R> ? R extends object ? OrderByBuilderComplex<R> : never :
  T extends object ? OrderByBuilderComplex<T>
  : never;

export type OrderByBuilderComplex<T extends object> = {
  [P in keyof T]: OrderByBuilder<T[P]>;
} & {
  key<TKey extends keyof T>(key: TKey): OrderByBuilder<T[TKey]>;
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

  private key = (key: string) => new OrderByProp(`${this.order ? this.order + '/' : ''}${key}`);
}