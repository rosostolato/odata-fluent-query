import { StringOptions } from '../models/filter'
import { QueryDescriptor } from '../models/query-descriptor'
import { createQuery } from './create-query'

function getFuncArgs(func: Function) {
  return (func + '')
    .replace(/[/][/].*$/gm, '') // strip single-line comments
    .replace(/\s+/g, '') // strip white space
    .replace(/[/][*][^/*]*[*][/]/g, '') // strip multi-line comments
    .split('){', 1)[0]
    .replace(/^[^(]*[(]/, '') // extract the parameters
    .replace(/=[^,]+/g, '') // strip any ES6 defaults
    .split(',')
    .filter(Boolean) // split & filter [""]
}

function mk_exp(exp: string): any {
  const getFilterExpresion = (checkParetheses = false) => {
    if (!checkParetheses) return exp

    if (exp.indexOf(' or ') > -1 || exp.indexOf(' and ') > -1) {
      return `(${exp})`
    }

    return exp
  }

  return {
    not: () => mk_exp(`not (${exp})`),
    and: (exp: any) =>
      mk_exp(`${getFilterExpresion()} and ${exp.getFilterExpresion(true)}`),
    or: (exp: any) =>
      mk_exp(`${getFilterExpresion()} or ${exp.getFilterExpresion(true)}`),
    getFilterExpresion,
  }
}

function filterBuilder(key: string) {
  const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  const arrFuncBuilder = (method: string, exp: Function) => {
    const [arg] = getFuncArgs(exp)
    const builder = exp(makeFilter(arg))
    const expr = builder.getFilterExpresion()
    return mk_exp(`${key}/${method}(${arg}: ${expr})`)
  }

  const strFuncBuilder = (method: string, s: any, opt?: StringOptions) => {
    if (opt?.caseInsensitive) {
      return mk_exp(
        `${method}(tolower(${key}), ${
          typeof s == 'string'
            ? `'${s.toLocaleLowerCase()}'`
            : `tolower(${s.$$key})`
        })`
      )
    }

    if (s.getPropName) {
      return mk_exp(`${method}(${key}, ${s.$$key})`)
    }

    return mk_exp(`${method}(${key}, ${typeof s == 'string' ? `'${s}'` : s})`)
  }

  const equalityBuilder = (t: 'eq' | 'ne', x: any, opt?: StringOptions) => {
    switch (typeof x) {
      case 'string':
        if (isGuid.test(x)) {
          return mk_exp(`${key} ${t} ${x}`) // no quote around ${x}
        }

        if (opt?.caseInsensitive) {
          return mk_exp(`tolower(${key}) ${t} '${x.toLocaleLowerCase()}'`)
        }

        return mk_exp(`${key} ${t} '${x}'`)

      case 'number':
        return mk_exp(`${key} ${t} ${x}`)

      case 'boolean':
        return mk_exp(`${key} ${t} ${x}`)

      default:
        if (x && opt?.caseInsensitive) {
          return mk_exp(`tolower(${key}) ${t} tolower(${x.$$key})`)
        }

        return mk_exp(`${key} ${t} ${x?.$$key || key}`)
    }
  }

  const dateToObject = (d: Date) => {
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

  return {
    $$key: key,

    /////////////////////
    // FilterBuilderDate
    inTimeSpan: (
      y: number,
      m?: number,
      d?: number,
      h?: number,
      mm?: number
    ) => {
      let exps = [`year(${key}) eq ${y}`]
      if (m != undefined) exps.push(`month(${key}) eq ${m}`)
      if (d != undefined) exps.push(`day(${key}) eq ${d}`)
      if (h != undefined) exps.push(`hour(${key}) eq ${h}`)
      if (mm != undefined) exps.push(`minute(${key}) eq ${mm}`)
      return mk_exp('(' + exps.join(') and (') + ')')
    },

    isSame: (
      x: any,
      g?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
    ) => {
      if (typeof x === 'string') {
        return mk_exp(`${key} eq ${x}`)
      } else if (typeof x === 'number') {
        return mk_exp(`${g}(${key}) eq ${x}`)
      } else if (x instanceof Date) {
        if (g == null) {
          return mk_exp(`${key} eq ${x.toISOString()}`)
        } else {
          const o = dateToObject(x)
          return mk_exp(`${g}(${key}) eq ${o[g]}`)
        }
      } else {
        return mk_exp(`${g}(${key}) eq ${g}(${x.$$key})`)
      }
    },

    isAfter: (d: any) => {
      if (typeof d === 'string') return mk_exp(`${key} gt ${d}`)
      else if (d instanceof Date) return mk_exp(`${key} gt ${d.toISOString()}`)
      else return mk_exp(`${key} gt ${d.$$key}`)
    },

    isBefore: (d: any) => {
      if (typeof d === 'string') return mk_exp(`${key} lt ${d}`)
      else if (d instanceof Date) return mk_exp(`${key} lt ${d.toISOString()}`)
      else return mk_exp(`${key} gt ${d.$$key}`)
    },

    ////////////////
    // FilterBuilderArray
    empty: () => mk_exp(`not ${key}/any()`),
    notEmpty: () => mk_exp(`${key}/any()`),
    any: (exp: Function) => arrFuncBuilder('any', exp),
    all: (exp: Function) => arrFuncBuilder('all', exp),

    ///////////////////////
    // FilterBuilderString
    notNull: () => mk_exp(`${key} ne null`),
    contains: (s: any, opt?: StringOptions) =>
      strFuncBuilder('contains', s, opt),
    startsWith: (s: any, opt?: StringOptions) =>
      strFuncBuilder('startswith', s, opt),
    endsWith: (s: any, opt?: StringOptions) =>
      strFuncBuilder('endswith', s, opt),

    ///////////////////////
    // FilterBuilderNumber
    biggerThan: (n: any) =>
      mk_exp(`${key} gt ${typeof n == 'number' ? n : n.$$key}`),
    lessThan: (n: any) =>
      mk_exp(`${key} lt ${typeof n == 'number' ? n : n.$$key}`),

    ////////////////////////////////
    // FilterBuilder Generic Methods
    equals: (x: any, opt?: StringOptions) => equalityBuilder('eq', x, opt),
    notEquals: (x: any, opt?: StringOptions) => equalityBuilder('ne', x, opt),

    in(arr: (number | string)[]) {
      const list = arr
        .map((x) => (typeof x === 'string' ? `'${x}'` : x))
        .join(',')

      return mk_exp(`${key} in (${list})`)
    },
  }
}

function makeFilter(prefix = '') {
  return new Proxy(
    {},
    {
      get(_, prop) {
        const methods = filterBuilder(prefix)
        const key = prefix ? `${prefix}/${String(prop)}` : String(prop)
        return methods?.[prop] ? methods[prop] : makeFilter(String(key))
      },
    }
  )
}

export function createFilter(descriptor: QueryDescriptor): any {
  return (keyOrExp: any, exp?: any) => {
    const expr =
      typeof keyOrExp === 'string'
        ? exp(filterBuilder(keyOrExp))
        : keyOrExp(makeFilter())

    const filters = [...descriptor.filters, expr.getFilterExpresion()]
    return createQuery({ ...descriptor, filters })
  }
}
