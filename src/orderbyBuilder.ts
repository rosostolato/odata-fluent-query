export type IOrderByBuilderTyped<T> =
  T extends Array<infer R> ? R extends Object ? IOrderByBuilder<R> : never :
  T extends number | string | boolean | Date | Uint8Array ? IOrderBy :
  T extends Object ? IOrderByBuilder<T>
  : never;

export type IOrderByBuilder<T> = {
  [P in keyof T]: IOrderByBuilderTyped<T[P]>;
}

export interface IOrderBy {
  asc(): IOrderByExpression;
  desc(): IOrderByExpression;
}

export interface IOrderByExpression {
  get: () => string;
}

export class OrderByBuilder implements IOrderBy, IOrderByExpression {
  constructor(private readonly key: string) { }

  get = () => this.key;

  asc() {
    return new OrderByBuilder(this.key + ' asc');
  }
  
  desc() {
    return new OrderByBuilder(this.key + ' desc');
  }
}