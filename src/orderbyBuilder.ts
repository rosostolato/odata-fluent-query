import { List } from "immutable";

export type OrderByBuilder<T> =
  T extends number | string | boolean | Date | Uint8Array ? OrderByProp :
  T extends List<infer R> ? R extends object ? OrderByBuilderComplex<R> : never :
  T extends Array<infer R> ? R extends object ? OrderByBuilderComplex<R> : never :
  T extends object ? OrderByBuilderComplex<T>
  : never;

export type OrderByBuilderComplex<T extends object> = {
  [P in keyof T]: OrderByBuilder<T[P]>;
}

export interface OrderBy {
  get: () => string;
}

export class OrderWithAscOrDesc implements OrderBy {
  constructor(private readonly key: string) { }

  get = () => this.key;
}

export class OrderByProp implements OrderBy {
  constructor(private readonly key: string) { }

  get() {
    return this.key;
  }

  asc() {
    return new OrderWithAscOrDesc(this.key + ' asc');
  }
  
  desc() {
    return new OrderWithAscOrDesc(this.key + ' desc');
  }
}