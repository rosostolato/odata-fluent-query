import { StringOptions } from '../models/query-filter'
import { QueryDescriptor } from '../models/query-descriptor'
import { createQuery } from './create-query'

export function getFuncArgs(func: Function) {
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

export function makeExp(exp: string): any {
  const _get = (checkParetheses = false) => {
    if (!checkParetheses) return exp

    if (exp.indexOf(' or ') > -1 || exp.indexOf(' and ') > -1) {
      return `(${exp})`
    }

    return exp
  }

  return {
    _get,
    not: () => makeExp(`not (${exp})`),
    and: (exp: any) => makeExp(`${_get()} and ${exp._get(true)}`),
    or: (exp: any) => makeExp(`${_get()} or ${exp._get(true)}`),
  }
}

function filterBuilder(key: string) {
  const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  const arrFuncBuilder = (method: string, exp: Function) => {
    const [arg] = getFuncArgs(exp)
    const builder = exp(makeFilter(arg))
    const expr = builder._get()
    return makeExp(`${key}/${method}(${arg}: ${expr})`)
  }

  const strFuncBuilder = (method: string, s: any, opt?: StringOptions) => {
    if (opt?.caseInsensitive) {
      return makeExp(
        `${method}(tolower(${key}), ${
          typeof s == 'string'
            ? `'${s.toLocaleLowerCase()}'`
            : `tolower(${s._key})`
        })`
      )
    }

    if (s.getPropName) {
      return makeExp(`${method}(${key}, ${s._key})`)
    }

    return makeExp(`${method}(${key}, ${typeof s == 'string' ? `'${s}'` : s})`)
  }

  const equalityBuilder = (t: 'eq' | 'ne', x: any, opt?: StringOptions) => {
    switch (typeof x) {
      case 'string':
        if (isGuid.test(x)) {
          return makeExp(`${key} ${t} ${x}`) // no quote around ${x}
        }

        if (opt?.caseInsensitive) {
          return makeExp(`tolower(${key}) ${t} '${x.toLocaleLowerCase()}'`)
        }

        return makeExp(`${key} ${t} '${x}'`)

      case 'number':
        return makeExp(`${key} ${t} ${x}`)

      case 'boolean':
        return makeExp(`${key} ${t} ${x}`)

      default:
        if (x && opt?.caseInsensitive) {
          return makeExp(`tolower(${key}) ${t} tolower(${x._key})`)
        }

        return makeExp(`${key} ${t} ${x?._key || null}`)
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
    _key: key,

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
      return makeExp('(' + exps.join(') and (') + ')')
    },

    isSame: (
      x: any,
      g?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
    ) => {
      if (typeof x === 'string') {
        return makeExp(`${key} eq ${x}`)
      } else if (typeof x === 'number') {
        return makeExp(`${g}(${key}) eq ${x}`)
      } else if (x instanceof Date) {
        if (g == null) {
          return makeExp(`${key} eq ${x.toISOString()}`)
        } else {
          const o = dateToObject(x)
          return makeExp(`${g}(${key}) eq ${o[g]}`)
        }
      } else {
        return makeExp(`${g}(${key}) eq ${g}(${x._key})`)
      }
    },

    isAfter: (d: any) => {
      if (typeof d === 'string') return makeExp(`${key} gt ${d}`)
      else if (d instanceof Date) return makeExp(`${key} gt ${d.toISOString()}`)
      else return makeExp(`${key} gt ${d._key}`)
    },

    isBefore: (d: any) => {
      if (typeof d === 'string') return makeExp(`${key} lt ${d}`)
      else if (d instanceof Date) return makeExp(`${key} lt ${d.toISOString()}`)
      else return makeExp(`${key} gt ${d._key}`)
    },

    ////////////////
    // FilterBuilderArray
    empty: () => makeExp(`not ${key}/any()`),
    notEmpty: () => makeExp(`${key}/any()`),
    any: (exp: Function) => arrFuncBuilder('any', exp),
    all: (exp: Function) => arrFuncBuilder('all', exp),

    ///////////////////////
    // FilterBuilderString
    notNull: () => makeExp(`${key} ne null`),
    contains: (s: any, opt?: StringOptions) =>
      strFuncBuilder('contains', s, opt),
    startsWith: (s: any, opt?: StringOptions) =>
      strFuncBuilder('startswith', s, opt),
    endsWith: (s: any, opt?: StringOptions) =>
      strFuncBuilder('endswith', s, opt),

    ///////////////////////
    // FilterBuilderNumber
    biggerThan: (n: any) =>
      makeExp(`${key} gt ${typeof n == 'number' ? n : n._key}`),
    lessThan: (n: any) =>
      makeExp(`${key} lt ${typeof n == 'number' ? n : n._key}`),

    ////////////////////////////////
    // FilterBuilder Generic Methods
    equals: (x: any, opt?: StringOptions) => equalityBuilder('eq', x, opt),
    notEquals: (x: any, opt?: StringOptions) => equalityBuilder('ne', x, opt),

    in(arr: (number | string)[]) {
      const list = arr
        .map(x => (typeof x === 'string' ? `'${x}'` : x))
        .join(',')

      return makeExp(`${key} in (${list})`)
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

export function createFilter(descriptor: QueryDescriptor) {
  return (keyOrExp: any, exp?: any) => {
    const expr =
      typeof keyOrExp === 'string'
        ? exp(filterBuilder(keyOrExp))
        : keyOrExp(makeFilter())

    return createQuery({
      ...descriptor,
      filters: descriptor.filters.concat(expr._get()),
    })
  }
}
