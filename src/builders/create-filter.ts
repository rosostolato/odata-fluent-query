import { QueryDescriptor, StringOptions } from '../models'
import { createQuery } from './create-query'
import isUUID from 'validator/lib/isUUID'

export function getFuncArgs(func: Function): string[] {
  const [, , paramStr] = /(function)?(.*?)(?=[={])/.exec(func.toString()) ?? []
  return (paramStr ?? '')
    .replace('=>', '')
    .replace('(', '')
    .replace(')', '')
    .split(',')
    .map(s => s.trim())
}

export function dateToObject(d: Date) {
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

export function makeExp(exp: string): any {
  const _get = (checkParetheses = false) => {
    if (!checkParetheses) {
      return exp
    } else if (exp.indexOf(' or ') > -1 || exp.indexOf(' and ') > -1) {
      return `(${exp})`
    } else {
      return exp
    }
  }

  return {
    _get,
    not: () => makeExp(`not (${exp})`),
    and: (exp: any) => makeExp(`${_get()} and ${exp._get(true)}`),
    or: (exp: any) => makeExp(`${_get()} or ${exp._get(true)}`),
  }
}

function filterBuilder(key: string) {
  const arrFuncBuilder = (method: 'any' | 'all') => (exp: Function) => {
    const [arg] = getFuncArgs(exp)
    const builder = exp(makeFilter(arg))
    const expr = builder._get()
    return makeExp(`${key}/${method}(${arg}: ${expr})`)
  }

  const strFuncBuilder =
    (method: 'contains' | 'startswith' | 'endswith') =>
    (s: any, opt?: StringOptions) => {
      if (opt?.caseInsensitive) {
        return makeExp(
          `${method}(tolower(${key}), ${
            typeof s == 'string'
              ? `'${s.toLocaleLowerCase()}'`
              : `tolower(${s._key})`
          })`
        )
      } else if (s.getPropName) {
        return makeExp(`${method}(${key}, ${s._key})`)
      } else {
        return makeExp(
          `${method}(${key}, ${typeof s == 'string' ? `'${s}'` : s})`
        )
      }
    }

  const equalityBuilder = (t: 'eq' | 'ne') => (x: any, opt?: StringOptions) => {
    switch (typeof x) {
      case 'string':
        if (isUUID(x) && !opt?.ignoreGuid) {
          return makeExp(`${key} ${t} ${x}`) // no quote around ${x}
        } else if (opt?.caseInsensitive) {
          return makeExp(`tolower(${key}) ${t} '${x.toLocaleLowerCase()}'`)
        } else {
          return makeExp(`${key} ${t} '${x}'`)
        }

      case 'number':
        return makeExp(`${key} ${t} ${x}`)

      case 'boolean':
        return makeExp(`${key} ${t} ${x}`)

      default:
        if (x && opt?.caseInsensitive) {
          return makeExp(`tolower(${key}) ${t} tolower(${x._key})`)
        } else {
          return makeExp(`${key} ${t} ${x?._key || null}`)
        }
    }
  }

  const dateComparison = (compare: 'ge' | 'gt' | 'le' | 'lt') => (d: any) => {
    if (typeof d === 'string') return makeExp(`${key} ${compare} ${d}`)
    else if (d instanceof Date)
      return makeExp(`${key} ${compare} ${d.toISOString()}`)
    else return makeExp(`${key} ${compare} ${d._key}`)
  }

  const numberComparison = (compare: 'ge' | 'gt' | 'le' | 'lt') => (n: any) =>
    makeExp(`${key} ${compare} ${typeof n == 'number' ? n : n._key}`)

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

    isAfter: dateComparison('gt'),
    isBefore: dateComparison('lt'),
    isAfterOrEqual: dateComparison('ge'),
    isBeforeOrEqual: dateComparison('le'),

    /////////////////////
    // FilterBuilderArray
    empty: () => makeExp(`not ${key}/any()`),
    notEmpty: () => makeExp(`${key}/any()`),
    any: arrFuncBuilder('any'),
    all: arrFuncBuilder('all'),

    //////////////////////
    // FilterBuilderString
    notNull: () => makeExp(`${key} ne null`),
    contains: strFuncBuilder('contains'),
    startsWith: strFuncBuilder('startswith'),
    endsWith: strFuncBuilder('endswith'),

    //////////////////////
    // FilterBuilderNumber
    biggerThan: numberComparison('gt'),
    lessThan: numberComparison('lt'),
    biggerOrEqualThan: numberComparison('ge'),
    lessOrEqualThan: numberComparison('le'),

    ////////////////////////////////
    // FilterBuilder Generic Methods
    equals: equalityBuilder('eq'),
    notEquals: equalityBuilder('ne'),

    in(arr: (number | string)[]) {
      const list = arr
        .map(x => (typeof x === 'string' ? `'${x}'` : x))
        .join(',')
      return makeExp(`${key} in (${list})`)
    },
  }
}

function makeFilter(prefix = ''): any {
  return new Proxy(
    {},
    {
      get(_, prop) {
        const methods: any = filterBuilder(prefix)
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
