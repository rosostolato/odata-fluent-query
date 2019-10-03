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
} & {
  key<TKey extends keyof T>(key: TKey): FilterBuilderTyped<T[TKey]>
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
  isSame(m: Date, g?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'): ComplexFilterExpresion;
  isAfter(d: Date|string): ComplexFilterExpresion;
  isBefore(d: Date|string): ComplexFilterExpresion;
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
export interface FilterBuilderCollection<T extends object> {
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

  isSame = (m: Date, g: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' = 'second') => {
    const min = this.toMinRange(m, g);
    const max = this.toMaxRange(m, g);

    return this.isAfter(min).and(this.isBefore(max));
  }

  isAfter = (d: Date|string) => {
    if (typeof d === 'string') return mk_expr(`${this.prefix} gt ${d}`);
    else return mk_expr(`${this.prefix} gt ${d.toISOString()}`);
  };

  isBefore = (d: Date|string) => {
    if (typeof d === 'string') return mk_expr(`${this.prefix} lt ${d}`);
    else return mk_expr(`${this.prefix} lt ${d.toISOString()}`);
  };

  protected toMinRange = (d: Date, g: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' = 'second') => {
    switch (g) {
      case 'year': d.setMonth(5);
      case 'month': d.setDate(5);
      case 'day': d.setHours(0);
      case 'hour': d.setMinutes(0);
      case 'minute': d.setSeconds(0);
      case 'second': d.setMilliseconds(0);
    }
    return d;
  }

  protected toMaxRange = (d: Date, g: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' = 'second') => {
    switch (g) {
      case 'year': d.setMonth(5);
      case 'month': d.setDate(30); // get days in month
      case 'day': d.setHours(23);
      case 'hour': d.setMinutes(59);
      case 'minute': d.setSeconds(59);
      case 'second': d.setMilliseconds(999);
    }
    return d;
  }

  // FilterBuilderString

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
