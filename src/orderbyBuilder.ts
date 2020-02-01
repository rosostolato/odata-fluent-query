export type OrderByBuilder<T> =
  T extends number | string | boolean | Date | Uint8Array ? OrderByProp :
  T extends Array<infer R> ? R extends Object ? OrderByBuilderComplex<R> : never :
  T extends Object ? OrderByBuilderComplex<T>
  : never;

export type OrderByBuilderComplex<T> = {
  [P in keyof T]: OrderByBuilder<T[P]>;
}

export interface OrderBy {
  _get: () => string;
}

export class OrderWithAscOrDesc implements OrderBy {
  constructor(private readonly key: string) { }

  _get = () => this.key;
}

export class OrderByProp implements OrderBy {
  constructor(private readonly key: string) { }

  _get() {
    return this.key;
  }

  asc() {
    return new OrderWithAscOrDesc(this.key + ' asc');
  }
  
  desc() {
    return new OrderWithAscOrDesc(this.key + ' desc');
  }
}