import * as Moment from "moment"
import { List } from "immutable"

export type FilterBuilder<T> =
  T extends Uint8Array ? FilterBuilderBinary :
  T extends string ? FilterBuilderString :
  T extends number ? FilterBuilderNumber :
  T extends boolean ? FilterBuilderBoolean :
  T extends Date ? FilterBuilderDate :
  T extends List<infer R> ? R extends object ? FilterBuilderCollection<R> : never :
  T extends object ? () => FilterBuilderComplex<T> :
  never

export type FilterBuilderComplex<T extends object> = {
  [P in keyof T]: FilterBuilder<T[P]>
}

export interface IFilterExpresion {
  kind: 'expr'
  Not: () => IFilterExpresion
  And: (exp: IFilterExpresion) => IFilterExpresion
  Or: (exp: IFilterExpresion) => IFilterExpresion
  GetFilterExpresion: () => string
}

export type FilterExpresion = FilterExpresionUnit | IFilterExpresion

export class ComplexFilterExpresion implements IFilterExpresion {
  constructor(protected readonly exp: string) { }
  Not = () => mk_expr(`not (${this.exp})`)
  And = (exp: IFilterExpresion) => mk_expr(`${this.GetFilterExpresion()} and ${exp.GetFilterExpresion()}`)
  Or = (exp: IFilterExpresion) => mk_expr(`${this.GetFilterExpresion()} or ${exp.GetFilterExpresion()}`)
  GetFilterExpresion = () => `(${this.exp})`
  kind: 'expr' = 'expr'
}

export class FilterExpresionUnit {
  kind: 'none' = 'none'
  Not = () => new FilterExpresionUnit()
  And = (exp: IFilterExpresion) => exp
  Or = (exp: IFilterExpresion) => exp
}

export const mk_expr_unit = () => new FilterExpresionUnit()

const mk_expr = (exp: string) => new ComplexFilterExpresion(exp)

export class FilterBuilderBinary {
  constructor(protected readonly prefix: string) { }
}

export class FilterBuilderDate {
  constructor(protected readonly prefix: string) { }

  InTimeSpan = (y: number, m?: number, d?: number, h?: number, mm?: number) => {
    let exps = [`year(${this.prefix}) eq ${y}`]
    if (m != undefined) exps.push(`month(${this.prefix}) eq ${m}`)
    if (d != undefined) exps.push(`day(${this.prefix}) eq ${d}`)
    if (h != undefined) exps.push(`hour(${this.prefix}) eq ${h}`)
    if (mm != undefined) exps.push(`minute(${this.prefix}) eq ${mm}`)
    return mk_expr('(' + exps.join(') and (') + ')')
  }

  IsSame = (m: Moment.Moment, g: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' = 'second') => {
    const min = this.ToMinRange(m, g)
    const max = this.ToMaxRange(m, g)

    return this.IsAfter(min.toDate()).And(this.IsBefore(max.toDate()))
  }

  IsAfter = (d: Date) => mk_expr(`${this.prefix} gt ${d.toISOString()}`)

  IsBefore = (d: Date) => mk_expr(`${this.prefix} lt ${d.toISOString()}`)

  protected ToMaxRange = (d: Moment.Moment, g: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' = 'second') => {
    if (g == 'second') {
      return d.clone()
        .set('millisecond', 999)
    }
    if (g == 'minute') {
      return d.clone()
        .set('millisecond', 999)
        .set('second', 59)
    }
    if (g == 'hour') {
      return d.clone()
        .set('millisecond', 999)
        .set('second', 59)
        .set('minute', 59)
    }
    if (g == 'day') {
      return d.clone()
        .set('millisecond', 999)
        .set('hours', 23)
        .set('minute', 59)
        .set('second', 59)
    }
    if (g == 'month') {
      const r = d.clone()
        .set('millisecond', 999)
        .set('second', 59)
        .set('minute', 59)
        .set('hour', 23)
      return r.set('date', r.daysInMonth())
    }
    if (g == 'year') {
      return d.clone()
        .set('month', 11)
        .set('date', 31)
        .set('millisecond', 999)
        .set('second', 59)
        .set('minute', 59)
        .set('hour', 23)
    }
    return d
  }

  protected ToMinRange = (d: Moment.Moment, g: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' = 'second') => {
    if (g == 'second') {
      return d.clone()
        .set('millisecond', 0)
    }
    if (g == 'minute') {
      return d.clone()
        .set('millisecond', 0)
        .set('second', 0)
    }
    if (g == 'hour') {
      return d.clone()
        .set('millisecond', 0)
        .set('second', 0)
        .set('minute', 0)
    }
    if (g == 'day') {
      return d.clone()
        .set('millisecond', 0)
        .set('hour', 0)
        .set('minute', 0)
        .set('second', 0)
    }
    if (g == 'month') {
      return d.clone()
        .set('millisecond', 0)
        .set('second', 0)
        .set('minute', 0)
        .set('hour', 0)
        .set('day', 1)
    }
    if (g == 'year') {
      return d.clone()
        .set('month', 0)
        .set('date', 1)
        .set('millisecond', 0)
        .set('second', 0)
        .set('minute', 0)
        .set('hour', 0)
    }
    return d
  }
}

export class FilterBuilderString {
  constructor(protected readonly prefix: string) { }

  GetPropName = () => this.prefix

  Equals = (s: string | FilterBuilderString) => mk_expr(`${this.prefix} eq ${typeof s == 'string' ? `'${s}'` : s.GetPropName()}`)

  Contains = (s: string | FilterBuilderString) => mk_expr(`contains(${this.prefix}, ${typeof s == 'string' ? `'${s}'` : s.GetPropName()})`)

  NotNull = () => mk_expr(`${this.prefix} ne null`)

  EqualsCaseInsensitive = (s: string | FilterBuilderString) => mk_expr(`tolower(${this.prefix}) eq ${
    typeof s == 'string'
      ? `'${s.toLocaleLowerCase()}'`
      : `tolower(${s.GetPropName()})`
    }`)

  NotEquals = (s: string | FilterBuilderString) => mk_expr(`${this.prefix} ne ${typeof s == 'string' ? `'${s}'` : s.GetPropName()}`)

  NotEqualsCaseInsensitive = (s: string | FilterBuilderString) => mk_expr(`tolower(${this.prefix}) ne ${
    typeof s == 'string'
      ? `'${s.toLocaleLowerCase()}'`
      : `tolower(${s.GetPropName()})`
    }`)

  ContainsCaseInsensitive = (s: string | FilterBuilderString) => mk_expr(`contains(tolower(${this.prefix}), ${
    typeof s == 'string'
      ? `'${s.toLocaleLowerCase()}'`
      : `tolower(${s.GetPropName()})`
    })`)

  StartsWith = (s: string | FilterBuilderString) => mk_expr(`startswith(${this.prefix}, ${typeof s == 'string' ? `'${s}'` : s.GetPropName()})`)

  StartsWithCaseInsensitive = (s: string | FilterBuilderString) => mk_expr(`startswith(tolower(${this.prefix}), ${
    typeof s == 'string'
      ? `'${s.toLocaleLowerCase()}'`
      : `tolower(${s.GetPropName()})`
    })`)

  EndsWith = (s: string | FilterBuilderString) => mk_expr(`endswith(${this.prefix}, ${typeof s == 'string' ? `'${s}'` : s.GetPropName()})`)

  EndsWithCaseInsensitive = (s: string | FilterBuilderString) => mk_expr(`endswith(tolower(${this.prefix}), ${
    typeof s == 'string'
      ? `'${s.toLocaleLowerCase()}'`
      : `tolower(${s.GetPropName()})`
    })`)
}

export class FilterBuilderNumber {
  constructor(protected readonly prefix: string) { }

  GetPropName = () => this.prefix

  Equals = (n: number | FilterBuilderNumber) => mk_expr(`${this.prefix} eq ${
    typeof n == 'number'
      ? n
      : n.GetPropName()
    }`)

  NotEquals = (n: number | FilterBuilderNumber) => mk_expr(`${this.prefix} ne ${
    typeof n == 'number'
      ? n
      : this.GetPropName()
    }`)

  BiggerThan = (n: number | FilterBuilderNumber) => mk_expr(`${this.prefix} gt ${
    typeof n == 'number'
      ? n
      : n.GetPropName()
    }`)

  LessThan = (n: number | FilterBuilderNumber) => mk_expr(`${this.prefix} lt ${
    typeof n == 'number'
      ? n
      : n.GetPropName()
    }`)
}

export class FilterBuilderBoolean {
  constructor(protected readonly prefix: string) { }

  GetPropName = () => this.prefix

  Equals = (b: boolean | FilterBuilderBoolean) => mk_expr(`${this.prefix} eq ${
    typeof b == 'boolean'
      ? b
      : b.GetPropName()
    }`)

  NotEquals = (b: boolean | FilterBuilderBoolean) => mk_expr(`${this.prefix} ne ${
    typeof b == 'boolean'
      ? b
      : b.GetPropName()
    }`)
}

export class FilterBuilderCollection<T extends object> {
  constructor(
    protected readonly prefix: string,
    protected readonly filterBuilder: (prefix: string) => FilterBuilderComplex<T>
  ) { }

  NotEmpty = () => mk_expr(`${this.prefix}/any()`)

  Any = (c: (_: FilterBuilderComplex<T>) => IFilterExpresion) => mk_expr(`${this.prefix}/any(x:${c(this.filterBuilder('x')).GetFilterExpresion()})`)

  All = (c: (_: FilterBuilderComplex<T>) => IFilterExpresion) => mk_expr(`${this.prefix}/all(x:${c(this.filterBuilder('x')).GetFilterExpresion()})`)
}