export type SelectParams<T, Tkey> = Array<Tkey | ((exp: SelectBuilder<T>) => SelectExpression)>;
export type SelectBuilder<T> = {
    [P in keyof T]-?: SelectBuilderType<T[P]>;
};
export type SelectBuilderType<T> = T extends Array<infer R> ? SelectBuilder<R> : T extends string | number | boolean | Date ? SelectExpression : T extends Object ? SelectBuilder<T> : SelectExpression;
export interface SelectExpression {
}
