import { FilterExpression, StringOptions } from '../models/filter'

// maker functions
const nullBuilder = {
  getPropName: () => 'null',
}

const mk_exp = (exp: string) => new ComplexFilterExpresion(exp)

const get_param_key = (exp: (...args: any[]) => any) =>
  new RegExp(/(return *|=> *?)([a-zA-Z0-9_\$]+)/).exec(exp.toString())[2]

const get_property_keys = (exp: (...args: any[]) => any) => {
  let funcStr = exp.toString()

  // key name used in expression
  const key = get_param_key(exp)

  let match: RegExpExecArray
  const keys: string[] = []
  const regex = new RegExp(key + '\\s*(\\.[a-zA-Z_0-9\\$]+)+\\b(?!\\()')

  // gets all properties of the used key
  while ((match = regex.exec(funcStr))) {
    funcStr = funcStr.replace(regex, '')
    keys.push(match[0].slice(key.length).trim().slice(1))
  }

  // return matched keys
  return keys
}

export function mk_builder(keys: string[], builderType: any) {
  const set = (obj, path, value) => {
    if (Object(obj) !== obj) return obj
    if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []

    path
      .slice(0, -1)
      .reduce(
        (a, c, i) =>
          Object(a[c]) === a[c]
            ? a[c]
            : (a[c] = Math.abs(path[i + 1]) >> 0 === +path[i + 1] ? [] : {}),
        obj
      )[path[path.length - 1]] = value

    return obj
  }

  const builder: any = {}
  keys.forEach((k) => set(builder, k, new builderType(k.split('.').join('/'))))
  return builder
}

// builders
export class ComplexFilterExpresion implements FilterExpression {
  constructor(protected readonly exp: string) {}

  kind: 'expr' = 'expr'
  not = () => mk_exp(`not (${this.exp})`)
  and = (exp: ComplexFilterExpresion) =>
    mk_exp(`${this.getFilterExpresion()} and ${exp.getFilterExpresion(true)}`)
  or = (exp: ComplexFilterExpresion) =>
    mk_exp(`${this.getFilterExpresion()} or ${exp.getFilterExpresion(true)}`)

  getFilterExpresion(checkParetheses = false) {
    if (!checkParetheses) return this.exp

    if (this.exp.indexOf(' or ') > -1 || this.exp.indexOf(' and ') > -1) {
      return `(${this.exp})`
    }

    return this.exp
  }
}

export class FilterBuilder {
  constructor(protected readonly prefix: string) {}

  getPropName = () => this.prefix

  /////////////////////
  // FilterBuilderDate
  inTimeSpan = (y: number, m?: number, d?: number, h?: number, mm?: number) => {
    let exps = [`year(${this.prefix}) eq ${y}`]
    if (m != undefined) exps.push(`month(${this.prefix}) eq ${m}`)
    if (d != undefined) exps.push(`day(${this.prefix}) eq ${d}`)
    if (h != undefined) exps.push(`hour(${this.prefix}) eq ${h}`)
    if (mm != undefined) exps.push(`minute(${this.prefix}) eq ${mm}`)
    return mk_exp('(' + exps.join(') and (') + ')')
  }

  isSame = (
    x: string | number | Date | FilterBuilder,
    g?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
  ) => {
    if (typeof x === 'string') {
      return mk_exp(`${this.prefix} eq ${x}`)
    } else if (typeof x === 'number') {
      return mk_exp(`${g}(${this.prefix}) eq ${x}`)
    } else if (x instanceof Date) {
      if (g == null) {
        return mk_exp(`${this.prefix} eq ${x.toISOString()}`)
      } else {
        const o = this.dateToObject(x)
        return mk_exp(`${g}(${this.prefix}) eq ${o[g]}`)
      }
    } else {
      return mk_exp(`${g}(${this.prefix}) eq ${g}(${x.getPropName()})`)
    }
  }

  isAfter = (d: string | Date | FilterBuilder) => {
    if (typeof d === 'string') return mk_exp(`${this.prefix} gt ${d}`)
    else if (d instanceof Date)
      return mk_exp(`${this.prefix} gt ${d.toISOString()}`)
    else return mk_exp(`${this.prefix} gt ${d.getPropName()}`)
  }

  isBefore = (d: string | Date | FilterBuilder) => {
    if (typeof d === 'string') return mk_exp(`${this.prefix} lt ${d}`)
    else if (d instanceof Date)
      return mk_exp(`${this.prefix} lt ${d.toISOString()}`)
    else return mk_exp(`${this.prefix} gt ${d.getPropName()}`)
  }

  protected dateToObject = (d: Date) => {
    if (typeof d === 'string') {
      d = new Date(d)
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
  empty = () => mk_exp(`not ${this.prefix}/any()`)

  notEmpty = () => mk_exp(`${this.prefix}/any()`)

  any = (exp: (_: any) => ComplexFilterExpresion) => {
    const key = get_param_key(exp)
    const props = get_property_keys(exp)

    if (props.length) {
      const builder = exp(mk_builder(props, FilterBuilder))
      const expr = builder.getFilterExpresion()
      return mk_exp(`${this.prefix}/any(${key}:${key}/${expr})`)
    } else {
      const builder = exp(new FilterBuilder(key))
      const expr = builder.getFilterExpresion()
      return mk_exp(`${this.prefix}/any(${key}:${expr})`)
    }
  }

  all = (exp: (_: any) => ComplexFilterExpresion) => {
    const key = get_param_key(exp)
    const keys = get_property_keys(exp)

    if (keys.length) {
      const builder = exp(mk_builder(keys, FilterBuilder))
      const expr = builder.getFilterExpresion()
      return mk_exp(`${this.prefix}/all(${key}:${key}/${expr})`)
    } else {
      const builder = exp(new FilterBuilder(key))
      const expr = builder.getFilterExpresion()
      return mk_exp(`${this.prefix}/all(${key}:${expr})`)
    }
  }

  ///////////////////////
  // FilterBuilderString
  notNull = () => mk_exp(`${this.prefix} ne null`)

  contains = (s: any | FilterBuilder, opt?: StringOptions) => {
    if (opt && opt.caseInsensitive) {
      return mk_exp(
        `contains(tolower(${this.prefix}), ${
          typeof s == 'string'
            ? `'${s.toLocaleLowerCase()}'`
            : `tolower(${s.getPropName()})`
        })`
      )
    }

    if (s.getPropName) {
      return mk_exp(`contains(${this.prefix}, ${s.getPropName()})`)
    }

    return mk_exp(
      `contains(${this.prefix}, ${typeof s == 'string' ? `'${s}'` : s})`
    )
  }

  startsWith = (s: string | FilterBuilder, opt?: StringOptions) => {
    if (opt && opt.caseInsensitive) {
      return mk_exp(
        `startswith(tolower(${this.prefix}), ${
          typeof s == 'string'
            ? `'${s.toLocaleLowerCase()}'`
            : `tolower(${s.getPropName()})`
        })`
      )
    }

    return mk_exp(
      `startswith(${this.prefix}, ${
        typeof s == 'string' ? `'${s}'` : s.getPropName()
      })`
    )
  }

  endsWith = (s: string | FilterBuilder, opt?: StringOptions) => {
    if (opt && opt.caseInsensitive) {
      return mk_exp(
        `endswith(tolower(${this.prefix}), ${
          typeof s == 'string'
            ? `'${s.toLocaleLowerCase()}'`
            : `tolower(${s.getPropName()})`
        })`
      )
    }

    return mk_exp(
      `endswith(${this.prefix}, ${
        typeof s == 'string' ? `'${s}'` : s.getPropName()
      })`
    )
  }

  ///////////////////////
  // FilterBuilderNumber

  biggerThan = (n: number | FilterBuilder) =>
    mk_exp(`${this.prefix} gt ${typeof n == 'number' ? n : n.getPropName()}`)

  lessThan = (n: number | FilterBuilder) =>
    mk_exp(`${this.prefix} lt ${typeof n == 'number' ? n : n.getPropName()}`)

  ////////////////////////////////
  // FilterBuilder Generic Methods
  equals = (x: string | number | boolean | FilterBuilder, o: any) => {
    switch (typeof x) {
      case 'string':
        if (
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            x
          )
        ) {
          // is a Guid?
          return mk_exp(`${this.prefix} eq ${x}`) // no quote around ${x}
        }

        if (o && o.caseInsensitive) {
          return mk_exp(`tolower(${this.prefix}) eq '${x.toLocaleLowerCase()}'`)
        }

        return mk_exp(`${this.prefix} eq '${x}'`)

      case 'number':
        return mk_exp(`${this.prefix} eq ${x}`)

      case 'boolean':
        return mk_exp(`${this.prefix} eq ${x}`)

      default:
        if (o && x && o.caseInsensitive) {
          return mk_exp(
            `tolower(${this.prefix}) eq tolower(${x.getPropName()})`
          )
        }

        return mk_exp(`${this.prefix} eq ${(x || nullBuilder).getPropName()}`)
    }
  }

  notEquals = (x: string | number | boolean | FilterBuilder, o: any) => {
    switch (typeof x) {
      case 'string':
        if (
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            x
          )
        ) {
          // is a Guid?
          return mk_exp(`${this.prefix} ne ${x}`) // no quote around ${x}
        }

        if (o && o.caseInsensitive) {
          return mk_exp(`tolower(${this.prefix}) ne '${x.toLocaleLowerCase()}'`)
        }

        return mk_exp(`${this.prefix} ne '${x}'`)

      case 'number':
        return mk_exp(`${this.prefix} ne ${x}`)

      case 'boolean':
        return mk_exp(`${this.prefix} ne ${x}`)

      default:
        if (o && o.caseInsensitive) {
          return mk_exp(
            `tolower(${this.prefix}) ne tolower(${x.getPropName()})`
          )
        }

        return mk_exp(`${this.prefix} ne ${(x || nullBuilder).getPropName()}`)
    }
  };

  in = (arr: (number | string)[]) => {
    const list = arr
      .map((x) => (typeof x === 'string' ? `'${x}'` : x))
      .join(',')

    return mk_exp(`${this.prefix} in (${list})`)
  }
}
