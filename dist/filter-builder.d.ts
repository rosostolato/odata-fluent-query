export declare type IFilterBuilderTyped<T> = T extends Array<infer R> ? IFilterCollection<R> : T extends string ? IFilterString : T extends number ? IFilterNumber : T extends boolean ? IFilterBoolean : T extends Date ? IFilterDate : T extends Object ? IFilterBuilder<T> : never;
export declare type IFilterBuilder<T> = {
    [P in keyof T]: IFilterBuilderTyped<T[P]>;
};
export interface IFilterExpression {
    not(): IFilterExpression;
    and(exp: IFilterExpression): IFilterExpression;
    or(exp: IFilterExpression): IFilterExpression;
}
export declare class ComplexFilterExpresion implements IFilterExpression {
    protected readonly exp: string;
    constructor(exp: string);
    kind: 'expr';
    not: () => ComplexFilterExpresion;
    and: (exp: ComplexFilterExpresion) => ComplexFilterExpresion;
    or: (exp: ComplexFilterExpresion) => ComplexFilterExpresion;
    getFilterExpresion(checkParetheses?: boolean): string;
}
export declare const mk_exp: (exp: string) => ComplexFilterExpresion;
export interface IFilterDate {
    inTimeSpan(y: number, m?: number, d?: number, h?: number, mm?: number): IFilterExpression;
    isSame(d: string | Date | IFilterDate): IFilterExpression;
    isSame(d: number | Date | IFilterDate, g: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'): IFilterExpression;
    isAfter(d: string | Date | IFilterDate): IFilterExpression;
    isBefore(d: string | Date | IFilterDate): IFilterExpression;
}
export interface IStringOptions {
    /** @default false */
    caseInsensitive?: boolean;
}
export interface IFilterString {
    /** @deprecated use `notEquals(null)` instead */
    notNull(): IFilterExpression;
    contains(s: string | IFilterString, options?: IStringOptions): IFilterExpression;
    equals(s: string | IFilterString, options?: IStringOptions): IFilterExpression;
    notEquals(s: string | IFilterString, options?: IStringOptions): IFilterExpression;
    startsWith(s: string | IFilterString, options?: IStringOptions): IFilterExpression;
    endsWith(s: string | IFilterString, options?: IStringOptions): IFilterExpression;
    in(list: string[]): IFilterExpression;
}
export interface IFilterNumber {
    equals(n: number | IFilterNumber): IFilterExpression;
    notEquals(n: number | IFilterNumber): IFilterExpression;
    biggerThan(n: number | IFilterNumber): IFilterExpression;
    lessThan(n: number | IFilterNumber): IFilterExpression;
    in(list: number[]): IFilterExpression;
}
export interface IFilterBoolean {
    equals(b: boolean | IFilterBoolean): IFilterExpression;
    notEquals(b: boolean | IFilterBoolean): IFilterExpression;
}
export interface IFilterCollection<T> {
    empty(): IFilterExpression;
    notEmpty(): IFilterExpression;
    any(c: (_: IFilterBuilderTyped<T>) => IFilterExpression): IFilterExpression;
    all(c: (_: IFilterBuilderTyped<T>) => IFilterExpression): IFilterExpression;
}
export declare class FilterBuilder {
    protected readonly prefix: string;
    constructor(prefix: string);
    getPropName: () => string;
    inTimeSpan: (y: number, m?: number, d?: number, h?: number, mm?: number) => ComplexFilterExpresion;
    isSame: (x: string | number | Date | FilterBuilder, g?: "day" | "hour" | "minute" | "month" | "second" | "year") => ComplexFilterExpresion;
    isAfter: (d: string | Date | FilterBuilder) => ComplexFilterExpresion;
    isBefore: (d: string | Date | FilterBuilder) => ComplexFilterExpresion;
    protected dateToObject: (d: Date) => {
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
        second: number;
    };
    empty: () => ComplexFilterExpresion;
    notEmpty: () => ComplexFilterExpresion;
    any: (exp: (_: any) => ComplexFilterExpresion) => ComplexFilterExpresion;
    all: (exp: (_: any) => ComplexFilterExpresion) => ComplexFilterExpresion;
    /** @deprecated use `notEquals(null)` instead */
    notNull: () => ComplexFilterExpresion;
    contains: (s: any, opt?: IStringOptions) => ComplexFilterExpresion;
    startsWith: (s: string | FilterBuilder, opt?: IStringOptions) => ComplexFilterExpresion;
    endsWith: (s: string | FilterBuilder, opt?: IStringOptions) => ComplexFilterExpresion;
    biggerThan: (n: number | FilterBuilder) => ComplexFilterExpresion;
    lessThan: (n: number | FilterBuilder) => ComplexFilterExpresion;
    equals: (x: string | number | boolean | FilterBuilder, o: any) => ComplexFilterExpresion;
    notEquals: (x: string | number | boolean | FilterBuilder, o: any) => ComplexFilterExpresion;
    in: (arr: (string | number)[]) => ComplexFilterExpresion;
}
