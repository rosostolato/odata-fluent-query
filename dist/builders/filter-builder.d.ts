import { FilterExpression, StringOptions } from '../models/query-filter';
export declare function mk_builder(keys: string[], builderType: any): any;
export declare class ComplexFilterExpresion implements FilterExpression {
    protected readonly exp: string;
    constructor(exp: string);
    kind: 'expr';
    not: () => ComplexFilterExpresion;
    and: (exp: ComplexFilterExpresion) => ComplexFilterExpresion;
    or: (exp: ComplexFilterExpresion) => ComplexFilterExpresion;
    getFilterExpresion(checkParetheses?: boolean): string;
}
export declare class FilterBuilder {
    protected readonly prefix: string;
    constructor(prefix: string);
    getPropName: () => string;
    inTimeSpan: (y: number, m?: number, d?: number, h?: number, mm?: number) => ComplexFilterExpresion;
    isSame: (x: string | number | Date | FilterBuilder, g?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second') => ComplexFilterExpresion;
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
    notNull: () => ComplexFilterExpresion;
    contains: (s: any | FilterBuilder, opt?: StringOptions) => ComplexFilterExpresion;
    startsWith: (s: string | FilterBuilder, opt?: StringOptions) => ComplexFilterExpresion;
    endsWith: (s: string | FilterBuilder, opt?: StringOptions) => ComplexFilterExpresion;
    biggerThan: (n: number | FilterBuilder) => ComplexFilterExpresion;
    lessThan: (n: number | FilterBuilder) => ComplexFilterExpresion;
    equals: (x: string | number | boolean | FilterBuilder, o: any) => ComplexFilterExpresion;
    notEquals: (x: string | number | boolean | FilterBuilder, o: any) => ComplexFilterExpresion;
    in: (arr: (number | string)[]) => ComplexFilterExpresion;
}
