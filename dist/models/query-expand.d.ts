import { ODataQuery } from './odata-query';
type Primitive = number | string | Boolean | Date | Uint8Array;
export type ExpandParam<T, U> = (exp: ExpandBuilder<T>) => ExpandBuilder<U>;
export type ExpandBuilder<T> = {
    [K in keyof T as NonNullable<T[K]> extends Primitive ? never : K]-?: NonNullable<T[K]> extends Array<infer R> ? NonNullable<R> extends Primitive ? ExpandExpression : ExpandBuilder<R> : ExpandBuilder<NonNullable<T[K]>>;
};
export interface ExpandExpression {
}
export type ExpandKey<T> = Pick<T, {
    [K in keyof T]: NonNullable<Required<T>[K]> extends number | string | Boolean | Date | Uint8Array ? never : K;
}[keyof T]>;
export type ExpandQueryComplex<T> = T extends Array<infer U> ? ExpandArrayQuery<U> : T extends Object ? ExpandObjectQuery<T> : never;
export type ExpandObjectQuery<T> = Pick<ODataQuery<T>, 'select' | 'expand'>;
export type ExpandArrayQuery<T> = Omit<ODataQuery<T>, 'toString' | 'toObject'>;
export {};
