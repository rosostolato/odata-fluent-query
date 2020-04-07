export declare type IOrderByBuilderTyped<T> = T extends Array<infer R> ? R extends Object ? IOrderByBuilder<R> : never : T extends number | string | boolean | Date | Uint8Array ? IOrderBy : T extends Object ? IOrderByBuilder<T> : never;
export declare type IOrderByBuilder<T> = {
    [P in keyof T]: IOrderByBuilderTyped<T[P]>;
};
export interface IOrderBy {
    asc(): IOrderByExpression;
    desc(): IOrderByExpression;
}
export interface IOrderByExpression {
    get: () => string;
}
export declare class OrderByBuilder implements IOrderBy, IOrderByExpression {
    private readonly key;
    constructor(key: string);
    get: () => string;
    asc(): OrderByBuilder;
    desc(): OrderByBuilder;
}
