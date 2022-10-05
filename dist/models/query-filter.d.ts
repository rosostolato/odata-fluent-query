export declare type FilterBuilder<T> = {
    [P in keyof T]-?: FilterBuilderProp<T[P]>;
};
export declare type FilterBuilderProp<T> = null extends T ? FilterBuilderType<T> & FilterNullable : FilterBuilderType<T>;
export declare type FilterBuilderType<T> = T extends Array<infer R> ? FilterCollection<R> : T extends string ? FilterString : T extends number ? FilterNumber : T extends boolean ? FilterBoolean : T extends Date ? FilterDate : T extends Object ? FilterBuilder<T> : never;
export interface StringOptions {
    /** Applies `tolower` method to the property */
    caseInsensitive?: boolean;
    /** Ignores Guid type casting */
    ignoreGuid?: boolean;
}
export interface FilterExpression {
    not(): FilterExpression;
    and(exp: FilterExpression): FilterExpression;
    or(exp: FilterExpression): FilterExpression;
}
export interface FilterDate {
    inTimeSpan(y: number, m?: number, d?: number, h?: number, mm?: number): FilterExpression;
    isSame(d: string | Date | FilterDate): FilterExpression;
    isSame(d: number | Date | FilterDate, g: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'): FilterExpression;
    isAfter(d: string | Date | FilterDate): FilterExpression;
    isAfterOrEqual(d: string | Date | FilterDate): FilterExpression;
    isBefore(d: string | Date | FilterDate): FilterExpression;
    isBeforeOrEqual(d: string | Date | FilterDate): FilterExpression;
}
export interface FilterString {
    contains(s: string | FilterString, options?: StringOptions): FilterExpression;
    equals(s: string | FilterString, options?: StringOptions): FilterExpression;
    notEquals(s: string | FilterString, options?: StringOptions): FilterExpression;
    startsWith(s: string | FilterString, options?: StringOptions): FilterExpression;
    endsWith(s: string | FilterString, options?: StringOptions): FilterExpression;
    in(list: string[]): FilterExpression;
}
export interface FilterNumber {
    equals(n: number | FilterNumber): FilterExpression;
    notEquals(n: number | FilterNumber): FilterExpression;
    biggerThan(n: number | FilterNumber): FilterExpression;
    biggerOrEqualThan(n: number | FilterNumber): FilterExpression;
    lessThan(n: number | FilterNumber): FilterExpression;
    lessOrEqualThan(n: number | FilterNumber): FilterExpression;
    in(list: number[]): FilterExpression;
}
export interface FilterBoolean {
    equals(b: boolean | FilterBoolean): FilterExpression;
    notEquals(b: boolean | FilterBoolean): FilterExpression;
}
export interface FilterNullable {
    isNull(): FilterExpression;
    notNull(): FilterExpression;
}
export interface FilterCollection<T> {
    empty(): FilterExpression;
    notEmpty(): FilterExpression;
    any(c: (arg: FilterBuilderProp<T>) => FilterExpression): FilterExpression;
    all(c: (arg: FilterBuilderProp<T>) => FilterExpression): FilterExpression;
}
