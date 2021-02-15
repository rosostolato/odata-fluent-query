import { FilterExpression, StringOptions } from '../models';
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
    inTimeSpan: (y: number, m?: number | undefined, d?: number | undefined, h?: number | undefined, mm?: number | undefined) => ComplexFilterExpresion;
    isSame: (x: string | number | Date | FilterBuilder, g?: "day" | "hour" | "minute" | "month" | "second" | "year" | undefined) => ComplexFilterExpresion;
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
    contains: (s: any | FilterBuilder, opt?: StringOptions | undefined) => ComplexFilterExpresion;
    startsWith: (s: string | FilterBuilder, opt?: StringOptions | undefined) => ComplexFilterExpresion;
    endsWith: (s: string | FilterBuilder, opt?: StringOptions | undefined) => ComplexFilterExpresion;
    biggerThan: (n: number | FilterBuilder) => ComplexFilterExpresion;
    lessThan: (n: number | FilterBuilder) => ComplexFilterExpresion;
    equals: (x: string | number | boolean | FilterBuilder, o: any) => ComplexFilterExpresion;
    notEquals: (x: string | number | boolean | FilterBuilder, o: any) => ComplexFilterExpresion;
    in: (arr: (number | string)[]) => ComplexFilterExpresion;
}
