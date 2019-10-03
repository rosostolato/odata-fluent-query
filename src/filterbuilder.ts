import * as Moment from "moment";
// import { List } from "immutable";

export type FilterBuilderTyped<T> =
  T extends Uint8Array ? FilterBuilderBinary :
  T extends string ? FilterBuilderString :
  T extends number ? FilterBuilderNumber :
  T extends boolean ? FilterBuilderBoolean :
  T extends Date ? FilterBuilderDate :
  // T extends List<infer R> ? R extends object ? FilterBuilderCollection<R> : never :
  T extends object ? () => FilterBuilderComplex<T> :
  never;

export type FilterBuilderComplex<T extends object> = {
  [P in keyof T]: FilterBuilderTyped<T[P]>
}

export type FilterExpresion = FilterExpresionUnit | IFilterExpresion;

export class ComplexFilterExpresion implements IFilterExpresion {
  constructor(protected readonly exp: string) { }

  not = () => mk_expr(`not (${this.exp})`);
  and = (exp: IFilterExpresion) => mk_expr(`${this.getFilterExpresion()} and ${exp.getFilterExpresion()}`);
  or = (exp: IFilterExpresion) => mk_expr(`${this.getFilterExpresion()} or ${exp.getFilterExpresion()}`);
  getFilterExpresion = () => `(${this.exp})`;
  kind: 'expr' = 'expr';
}

export class FilterExpresionUnit {
  kind: 'none' = 'none';
  not = () => new FilterExpresionUnit();
  and = (exp: IFilterExpresion) => exp;
  or = (exp: IFilterExpresion) => exp;
}

export interface IFilterExpresion {
  kind: 'expr';
  not(): IFilterExpresion;
  and(exp: IFilterExpresion): IFilterExpresion;
  or(exp: IFilterExpresion): IFilterExpresion;
  getFilterExpresion(): string;
}

export const mk_expr_unit = () => new FilterExpresionUnit();
const mk_expr = (exp: string) => new ComplexFilterExpresion(exp);

export interface FilterBuilderBinary {}

export interface FilterBuilderDate {
  inTimeSpan(y: number, m?: number, d?: number, h?: number, mm?: number): ComplexFilterExpresion;
  isSame(m: Moment.Moment, g: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'): ComplexFilterExpresion;
  isAfter(d: Date): ComplexFilterExpresion;
  isBefore(d: Date): ComplexFilterExpresion;
}

export interface FilterBuilderString {
  getPropName(): string;
  equals(s: string | FilterBuilderString): ComplexFilterExpresion;
  contains(s: string | FilterBuilderString): ComplexFilterExpresion;
  notNull(): ComplexFilterExpresion;
  equalsCaseInsensitive(s: string | FilterBuilderString): ComplexFilterExpresion;
  notEquals(s: string | FilterBuilderString): ComplexFilterExpresion;
  notEqualsCaseInsensitive(s: string | FilterBuilderString): ComplexFilterExpresion;
  containsCaseInsensitive(s: string | FilterBuilderString): ComplexFilterExpresion;
  startsWith(s: string | FilterBuilderString): ComplexFilterExpresion;
  startsWithCaseInsensitive(s: string | FilterBuilderString): ComplexFilterExpresion;
  endsWith(s: string | FilterBuilderString): ComplexFilterExpresion;
  endsWithCaseInsensitive(s: string | FilterBuilderString): ComplexFilterExpresion;
}

export interface FilterBuilderNumber {
  getPropName(): string;
  equals(n: number | FilterBuilderNumber): ComplexFilterExpresion;
  notEquals(n: number | FilterBuilderNumber): ComplexFilterExpresion;
  biggerThan(n: number | FilterBuilderNumber): ComplexFilterExpresion;
  lessThan(n: number | FilterBuilderNumber): ComplexFilterExpresion;
}

export interface FilterBuilderBoolean {
  getPropName(): string;
  equals(b: boolean | FilterBuilderBoolean): ComplexFilterExpresion;
  notEquals(b: boolean | FilterBuilderBoolean): ComplexFilterExpresion;
}

export class FilterBuilder {
  constructor(protected readonly prefix: string) { }

  getPropName = () => this.prefix;

  // FilterBuilderDate

  inTimeSpan = (y: number, m?: number, d?: number, h?: number, mm?: number) => {
    let exps = [`year(${this.prefix}) eq ${y}`];
    if (m != undefined) exps.push(`month(${this.prefix}) eq ${m}`);
    if (d != undefined) exps.push(`day(${this.prefix}) eq ${d}`);
    if (h != undefined) exps.push(`hour(${this.prefix}) eq ${h}`);
    if (mm != undefined) exps.push(`minute(${this.prefix}) eq ${mm}`);
    return mk_expr('(' + exps.join(') and (') + ')');
  }

  isSame = (m: Moment.Moment, g: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' = 'second') => {
    const min = this.toMinRange(m, g);
    const max = this.toMaxRange(m, g);

    return this.isAfter(min.toDate()).and(this.isBefore(max.toDate()));
  }

  isAfter = (d: Date) => mk_expr(`${this.prefix} gt ${d.toISOString()}`);

  isBefore = (d: Date) => mk_expr(`${this.prefix} lt ${d.toISOString()}`);

  protected toMaxRange = (d: Moment.Moment, g: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' = 'second') => {
    if (g == 'second') {
      return d.clone()
        .set('millisecond', 999);
    }
    if (g == 'minute') {
      return d.clone()
        .set('millisecond', 999)
        .set('second', 59);
    }
    if (g == 'hour') {
      return d.clone()
        .set('millisecond', 999)
        .set('second', 59)
        .set('minute', 59);
    }
    if (g == 'day') {
      return d.clone()
        .set('millisecond', 999)
        .set('hours', 23)
        .set('minute', 59)
        .set('second', 59);
    }
    if (g == 'month') {
      const r = d.clone()
        .set('millisecond', 999)
        .set('second', 59)
        .set('minute', 59)
        .set('hour', 23);
      return r.set('date', r.daysInMonth());
    }
    if (g == 'year') {
      return d.clone()
        .set('month', 11)
        .set('date', 31)
        .set('millisecond', 999)
        .set('second', 59)
        .set('minute', 59)
        .set('hour', 23);
    }
    return d
  }

  protected toMinRange = (d: Moment.Moment, g: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' = 'second') => {
    if (g == 'second') {
      return d.clone()
        .set('millisecond', 0);
    }
    if (g == 'minute') {
      return d.clone()
        .set('millisecond', 0)
        .set('second', 0);
    }
    if (g == 'hour') {
      return d.clone()
        .set('millisecond', 0)
        .set('second', 0)
        .set('minute', 0);
    }
    if (g == 'day') {
      return d.clone()
        .set('millisecond', 0)
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0);
    }
    if (g == 'month') {
      return d.clone()
        .set('millisecond', 0)
        .set('second', 0)
        .set('minute', 0)
        .set('hour', 0)
        .set('day', 1);
    }
    if (g == 'year') {
      return d.clone()
        .set('month', 0)
        .set('date', 1)
        .set('millisecond', 0)
        .set('second', 0)
        .set('minute', 0)
        .set('hour', 0);
    }
    return d;
  }

  // FilterBuilderString

  // Equals = (s: string | FilterBuilder) => mk_expr(`${this.prefix} eq ${typeof s == 'string' ? `'${s}'` : s.GetPropName()}`)

  // NotEquals = (s: string | FilterBuilder) => mk_expr(`${this.prefix} ne ${typeof s == 'string' ? `'${s}'` : s.GetPropName()}`)

  contains = (s: string | FilterBuilder) => mk_expr(`contains(${this.prefix}, ${typeof s == 'string' ? `'${s}'` : s.getPropName()})`);

  notNull = () => mk_expr(`${this.prefix} ne null`);

  equalsCaseInsensitive = (s: string | FilterBuilder) => mk_expr(`tolower(${this.prefix}) eq ${
    typeof s == 'string'
      ? `'${s.toLocaleLowerCase()}'`
      : `tolower(${s.getPropName()})`
    }`);

  notEqualsCaseInsensitive = (s: string | FilterBuilder) => mk_expr(`tolower(${this.prefix}) ne ${
    typeof s == 'string'
      ? `'${s.toLocaleLowerCase()}'`
      : `tolower(${s.getPropName()})`
    }`);

  containsCaseInsensitive = (s: string | FilterBuilder) => mk_expr(`contains(tolower(${this.prefix}), ${
    typeof s == 'string'
      ? `'${s.toLocaleLowerCase()}'`
      : `tolower(${s.getPropName()})`
    })`);

  startsWith = (s: string | FilterBuilder) => mk_expr(`startswith(${this.prefix}, ${typeof s == 'string' ? `'${s}'` : s.getPropName()})`);

  startsWithCaseInsensitive = (s: string | FilterBuilder) => mk_expr(`startswith(tolower(${this.prefix}), ${
    typeof s == 'string'
      ? `'${s.toLocaleLowerCase()}'`
      : `tolower(${s.getPropName()})`
    })`);

  endsWith = (s: string | FilterBuilder) => mk_expr(`endswith(${this.prefix}, ${typeof s == 'string' ? `'${s}'` : s.getPropName()})`);

  endsWithCaseInsensitive = (s: string | FilterBuilder) => mk_expr(`endswith(tolower(${this.prefix}), ${
    typeof s == 'string'
      ? `'${s.toLocaleLowerCase()}'`
      : `tolower(${s.getPropName()})`
    })`);

  // FilterBuilderNumber

  // Equals = (n: number | FilterBuilder) => mk_expr(`${this.prefix} eq ${
  //   typeof n == 'number'
  //     ? n
  //     : n.GetPropName()
  //   }`)

  // NotEquals = (n: number | FilterBuilder) => mk_expr(`${this.prefix} ne ${
  //   typeof n == 'number'
  //     ? n
  //     : this.GetPropName()
  //   }`)

  biggerThan = (n: number | FilterBuilder) => mk_expr(`${this.prefix} gt ${
    typeof n == 'number'
      ? n
      : n.getPropName()
    }`);

  lessThan = (n: number | FilterBuilder) => mk_expr(`${this.prefix} lt ${
    typeof n == 'number'
      ? n
      : n.getPropName()
    }`);

  // FilterBuilder Generic Methods

  equals = (x: string|FilterBuilder | number|FilterBuilder | boolean|FilterBuilder) => {
    switch (typeof x) {
      case 'string':
      return mk_expr(`${this.prefix} eq '${x}'`);

      case 'number':
      return mk_expr(`${this.prefix} eq ${x}`);

      case 'boolean':
      return mk_expr(`${this.prefix} eq ${x}`);

      default:
      return mk_expr(`${this.prefix} eq ${x.getPropName()}`);
    }
  };

  notEquals = (x: string|FilterBuilder | number|FilterBuilder | boolean|FilterBuilder) => {
    switch (typeof x) {
      case 'string':
      return mk_expr(`${this.prefix} eq '${x}'`);

      case 'number':
      return mk_expr(`${this.prefix} eq ${x}`);

      case 'boolean':
      return mk_expr(`${this.prefix} eq ${x}`);

      default:
      return mk_expr(`${this.prefix} eq ${x.getPropName()}`);
    }
  };
}

// export class FilterBuilderCollection<T extends object> {
//   constructor(
//     protected readonly prefix: string,
//     protected readonly filterBuilder: (prefix: string) => FilterBuilderComplex<T>
//   ) { }

//   NotEmpty = () => mk_expr(`${this.prefix}/any()`)

//   Any = (c: (_: FilterBuilderComplex<T>) => IFilterExpresion) => mk_expr(`${this.prefix}/any(x:${c(this.filterBuilder('x')).GetFilterExpresion()})`)

//   All = (c: (_: FilterBuilderComplex<T>) => IFilterExpresion) => mk_expr(`${this.prefix}/all(x:${c(this.filterBuilder('x')).GetFilterExpresion()})`)
// }
