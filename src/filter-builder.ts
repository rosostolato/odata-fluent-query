import { get_property_keys, mk_builder, get_param_key } from "./utils";

export type IFilterBuilderTyped<T> =
  T extends Array<infer R> ? IFilterCollection<R> :
  T extends string ? IFilterString :
  T extends number ? IFilterNumber :
  T extends boolean ? IFilterBoolean :
  T extends Date ? IFilterDate :
  T extends Object ? IFilterBuilder<T> :
  never;

export type IFilterBuilder<T> = {
  [P in keyof T]: IFilterBuilderTyped<T[P]>
}

export interface IFilterExpression {
  not(): IFilterExpression;
  and(exp: IFilterExpression): IFilterExpression;
  or(exp: IFilterExpression): IFilterExpression;
}

export class ComplexFilterExpresion implements IFilterExpression {
  constructor(protected readonly exp: string) { }

  kind: 'expr' = 'expr';
  not = () => mk_exp(`not (${this.exp})`);
  and = (exp: ComplexFilterExpresion) => mk_exp(`${this.getFilterExpresion()} and ${exp.getFilterExpresion(true)}`);
  or = (exp: ComplexFilterExpresion) => mk_exp(`${this.getFilterExpresion()} or ${exp.getFilterExpresion(true)}`);

  getFilterExpresion(checkParetheses = false) {
    if (!checkParetheses) return this.exp;

    if (this.exp.indexOf(' or ') > -1 || this.exp.indexOf(' and ') > -1) {
      return `(${this.exp})`;
    }

    return this.exp;
  }
}

export const mk_exp = (exp: string) => new ComplexFilterExpresion(exp);

export interface IFilterDate {
  inTimeSpan(y: number, m?: number, d?: number, h?: number, mm?: number): IFilterExpression;
  isSame(d: string|Date|IFilterDate): IFilterExpression;
  isSame(d: number|Date|IFilterDate, g: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'): IFilterExpression;
  isAfter(d: string|Date|IFilterDate): IFilterExpression;
  isBefore(d: string|Date|IFilterDate): IFilterExpression;
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

const nullBuilder = {
  getPropName: () => 'null'
};

export class FilterBuilder {
  constructor(protected readonly prefix: string) { }

  getPropName = () => this.prefix;

  /////////////////////
  // FilterBuilderDate

  inTimeSpan = (y: number, m?: number, d?: number, h?: number, mm?: number) => {
    let exps = [`year(${this.prefix}) eq ${y}`];
    if (m != undefined) exps.push(`month(${this.prefix}) eq ${m}`);
    if (d != undefined) exps.push(`day(${this.prefix}) eq ${d}`);
    if (h != undefined) exps.push(`hour(${this.prefix}) eq ${h}`);
    if (mm != undefined) exps.push(`minute(${this.prefix}) eq ${mm}`);
    return mk_exp('(' + exps.join(') and (') + ')');
  }

  isSame = (x: string|number|Date|FilterBuilder, g?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second') => {
    if (typeof x === 'string') {
      return mk_exp(`${this.prefix} eq ${x}`);
    }

    else if (typeof x === 'number') {
      return mk_exp(`${g}(${this.prefix}) eq ${x}`);
    }
    
    else if (x instanceof Date) {
      if (g == null) {
        return mk_exp(`${this.prefix} eq ${x.toISOString()}`);
      } else {
        const o = this.dateToObject(x);
        return mk_exp(`${g}(${this.prefix}) eq ${o[g]}`);
      }
    }

    else {
      return mk_exp(`${g}(${this.prefix}) eq ${g}(${x.getPropName()})`);
    }
  }

  isAfter = (d: string|Date|FilterBuilder) => {
    if (typeof d === 'string') return mk_exp(`${this.prefix} gt ${d}`);
    else if (d instanceof Date) return mk_exp(`${this.prefix} gt ${d.toISOString()}`);
    else return mk_exp(`${this.prefix} gt ${d.getPropName()}`);
  };

  isBefore = (d: string|Date|FilterBuilder) => {
    if (typeof d === 'string') return mk_exp(`${this.prefix} lt ${d}`);
    else if (d instanceof Date) return mk_exp(`${this.prefix} lt ${d.toISOString()}`);
    else return mk_exp(`${this.prefix} gt ${d.getPropName()}`);
  };

  protected dateToObject = (d: Date) => {
    if (typeof d === 'string') {
      d = new Date(d);
    }

    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getFullYear(),
      hour: d.getFullYear(),
      minute: d.getFullYear(),
      second: d.getFullYear(),
    }
  }
  
  ////////////////
  // FilterBuilderArray

  empty = () => mk_exp(`not ${this.prefix}/any()`);
  
  notEmpty = () => mk_exp(`${this.prefix}/any()`);

  any = (exp: (_: any) => ComplexFilterExpresion) => {
    const key = get_param_key(exp);
    const props = get_property_keys(exp);
    
    if (props.length) {
      const builder = exp(mk_builder(props, FilterBuilder));
      const expr = builder.getFilterExpresion();
      return mk_exp(`${this.prefix}/any(${key}:${key}/${expr})`);
    } else {
      const builder = exp(new FilterBuilder(key));
      const expr = builder.getFilterExpresion();
      return mk_exp(`${this.prefix}/any(${key}:${expr})`);
    }
  };

  all = (exp: (_: any) => ComplexFilterExpresion) => {
    const key = get_param_key(exp);
    const keys = get_property_keys(exp);
    
    if (keys.length) {
      const builder = exp(mk_builder(keys, FilterBuilder));
      const expr = builder.getFilterExpresion();
      return mk_exp(`${this.prefix}/all(${key}:${key}/${expr})`);
    } else {
      const builder = exp(new FilterBuilder(key));
      const expr = builder.getFilterExpresion();
      return mk_exp(`${this.prefix}/all(${key}:${expr})`);
    }
  };

  ///////////////////////
  // FilterBuilderString

  /** @deprecated use `notEquals(null)` instead */
  notNull = () => mk_exp(`${this.prefix} ne null`);

  contains = (s: any|FilterBuilder, opt?: IStringOptions) => {
    if (opt && opt.caseInsensitive) {
      return mk_exp(`contains(tolower(${this.prefix}), ${typeof s == 'string'
        ? `'${s.toLocaleLowerCase()}'`
        : `tolower(${s.getPropName()})`})`);
    }

    if (s.getPropName) {
      return mk_exp(`contains(${this.prefix}, ${s.getPropName()})`);
    }

    return mk_exp(`contains(${this.prefix}, ${typeof s == 'string' ? `'${s}'` : s})`);
  };

  startsWith = (s: string|FilterBuilder, opt?: IStringOptions) => {
    if (opt && opt.caseInsensitive) {
      return mk_exp(`startswith(tolower(${this.prefix}), ${typeof s == 'string'
        ? `'${s.toLocaleLowerCase()}'`
        : `tolower(${s.getPropName()})`})`);
    }

    return mk_exp(`startswith(${this.prefix}, ${typeof s == 'string' ? `'${s}'` : s.getPropName()})`);
  };

  endsWith = (s: string|FilterBuilder, opt?: IStringOptions) => {
    if (opt && opt.caseInsensitive) {
      return mk_exp(`endswith(tolower(${this.prefix}), ${typeof s == 'string'
        ? `'${s.toLocaleLowerCase()}'`
        : `tolower(${s.getPropName()})`})`);
    }

    return mk_exp(`endswith(${this.prefix}, ${typeof s == 'string' ? `'${s}'` : s.getPropName()})`);
  };

  ///////////////////////
  // FilterBuilderNumber

  biggerThan = (n: number|FilterBuilder) => mk_exp(`${this.prefix} gt ${
    typeof n == 'number'
      ? n
      : n.getPropName()
    }`);

  lessThan = (n: number|FilterBuilder) => mk_exp(`${this.prefix} lt ${
    typeof n == 'number'
      ? n
      : n.getPropName()
    }`);

  ////////////////////////////////
  // FilterBuilder Generic Methods

  equals = (x: string|number|boolean|FilterBuilder, o: any) => {
    switch (typeof x) {
      case 'string':
      if (o && o.caseInsensitive) {
        return mk_exp(`tolower(${this.prefix}) eq '${x.toLocaleLowerCase()}'`);
      }

      return mk_exp(`${this.prefix} eq '${x}'`);

      case 'number':
      return mk_exp(`${this.prefix} eq ${x}`);

      case 'boolean':
      return mk_exp(`${this.prefix} eq ${x}`);

      default:
      if (o && x && o.caseInsensitive) {
        return mk_exp(`tolower(${this.prefix}) eq tolower(${x.getPropName()})`);
      }

      return mk_exp(`${this.prefix} eq ${(x || nullBuilder).getPropName()}`);
    }
  };

  notEquals = (x: string|number|boolean|FilterBuilder, o: any) => {
    switch (typeof x) {
      case 'string':
      if (o && o.caseInsensitive) {
        return mk_exp(`tolower(${this.prefix}) ne '${x.toLocaleLowerCase()}'`);
      }

      return mk_exp(`${this.prefix} ne '${x}'`);

      case 'number':
      return mk_exp(`${this.prefix} ne ${x}`);

      case 'boolean':
      return mk_exp(`${this.prefix} ne ${x}`);

      default:
      if (o && o.caseInsensitive) {
        return mk_exp(`tolower(${this.prefix}) ne tolower(${x.getPropName()})`);
      }

      return mk_exp(`${this.prefix} ne ${(x || nullBuilder).getPropName()}`);
    }
  };

  in = (arr: (number|string)[]) => {
    const list = arr
      .map(x => typeof x === 'string' ? `'${x}'` : x)
      .join(',');

    return mk_exp(`${this.prefix} in (${list})`);
  }
}