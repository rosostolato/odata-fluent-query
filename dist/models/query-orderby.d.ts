export declare type OrderByBuilder<T> = {
    [P in keyof T]: OrderByBuilderTyped<T[P]>;
};
export declare type OrderByBuilderTyped<T> = T extends Array<infer R> ? R extends Object ? OrderByBuilder<R> : never : T extends number | string | boolean | Date | Uint8Array ? OrderBy : T extends Object ? OrderByBuilder<T> : never;
export interface OrderBy {
    asc(): OrderByExpression;
    desc(): OrderByExpression;
}
export interface OrderByExpression {
}
