export type OrderByBuilderTyped<T> =
  T extends number | string | boolean | Date | Uint8Array ? OrderByBuilder :
  T extends Array<infer R> ? R extends Object ? OrderByBuilderComplex<R> : never :
  T extends Object ? OrderByBuilderComplex<T>
  : never;

export type OrderByBuilderComplex<T> = {
  [P in keyof T]: OrderByBuilderTyped<T[P]>;
}

export interface OrderBy {
  _get: () => string;
}

export class OrderWithAscOrDesc implements OrderBy {
  constructor(private readonly key: string) { }

  _get = () => this.key;
}

export class OrderByBuilder implements OrderBy {
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