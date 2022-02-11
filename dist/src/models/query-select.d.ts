export declare type SelectParams<T, Tkey> = Array<Tkey | ((exp: SelectBuilder<T>) => SelectExpression)>;
export declare type SelectBuilder<T> = {
    [P in keyof T]-?: SelectBuilderType<T[P]>;
};
export declare type SelectBuilderType<T> = T extends Array<infer R> ? SelectBuilder<R> : T extends string ? SelectExpression : T extends number ? SelectExpression : T extends boolean ? SelectExpression : T extends Date ? SelectExpression : T extends Object ? SelectBuilder<T> : SelectExpression;
export interface SelectExpression {
}
