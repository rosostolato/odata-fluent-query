import { validate as isUUID } from 'uuid'
import { AnyObjectOfHandlers, FilterBuilder, QueryDescriptor, StringOptions } from '../models'
import { createQuery } from './create-query'

// Helper types for internal filter structures
interface ExpressionWithGet {
  _get(checkParentheses?: boolean): string
}

interface FilterWithKey {
  _key: string
  getPropName?: boolean
}

type FilterValue = string | number | boolean | Date | FilterWithKey | null

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

export function makeExp(exp: string): AnyObjectOfHandlers {
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
    and: (otherExp: ExpressionWithGet) => makeExp(`${_get()} and ${otherExp._get(true)}`),
    or: (otherExp: ExpressionWithGet) => makeExp(`${_get()} or ${otherExp._get(true)}`),
  }
}

function filterBuilder(key: string): FilterBuilder<unknown> {
  const arrFuncBuilder = (method: 'any' | 'all') => (exp: Function) => {
    const [arg] = getFuncArgs(exp)
    const builder = exp(makeFilter(arg))
    const expr = builder._get()

    return makeExp(`${key}/${method}(${arg}: ${expr})`)
  }

  const strFuncBuilder =
    (method: 'contains' | 'startswith' | 'endswith') =>
    (s: string | FilterWithKey, opt?: StringOptions) => {
      if (opt?.caseInsensitive) {
        return makeExp(
          `${method}(tolower(${key}), ${
            typeof s == 'string'
              ? `'${s.toLocaleLowerCase()}'`
              : `tolower(${s._key})`
          })`
        )
      } else if (typeof s !== 'string' && s.getPropName) {
        return makeExp(`${method}(${key}, ${s._key})`)
      } else {
        return makeExp(
          `${method}(${key}, ${typeof s == 'string' ? `'${s}'` : s})`
        )
      }
    }

  const equalityBuilder = (t: 'eq' | 'ne') => (val: FilterValue, opt?: StringOptions) => {
    if (val === undefined) {
      throw new Error(
        `Cannot filter by undefined value. OData only supports null values. Use null instead of undefined, or use .isNull() method for nullable checks.`
      )
    }

    switch (typeof val) {
      case 'string':
        if (isUUID(val) && !opt?.ignoreGuid) {
          return makeExp(`${key} ${t} ${val}`) // no quote around ${val}
        } else if (opt?.caseInsensitive) {
          return makeExp(`tolower(${key}) ${t} '${val.toLocaleLowerCase()}'`)
        } else {
          return makeExp(`${key} ${t} '${val}'`)
        }

      case 'number':
        return makeExp(`${key} ${t} ${val}`)

      case 'boolean':
        return makeExp(`${key} ${t} ${val}`)

      default:
        if (val instanceof Date) {
          return makeExp(`${key} ${t} ${val.toISOString()}`)
        } else if (val && typeof val === 'object' && '_key' in val && opt?.caseInsensitive) {
          return makeExp(`tolower(${key}) ${t} tolower(${val._key})`)
        } else if (val && typeof val === 'object' && '_key' in val) {
          return makeExp(`${key} ${t} ${val._key}`)
        } else {
          return makeExp(`${key} ${t} null`)
        }
    }
  }

  const dateComparison = (compare: 'ge' | 'gt' | 'le' | 'lt') => (d: string | Date | FilterWithKey) => {
    if (typeof d === 'string') return makeExp(`${key} ${compare} ${d}`)
    else if (d instanceof Date)
      return makeExp(`${key} ${compare} ${d.toISOString()}`)
    else return makeExp(`${key} ${compare} ${d._key}`)
  }

  const numberComparison = (compare: 'ge' | 'gt' | 'le' | 'lt') => (n: number | FilterWithKey) =>
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
      const exps = [`year(${key}) eq ${y}`]
      if (m != undefined) exps.push(`month(${key}) eq ${m}`)
      if (d != undefined) exps.push(`day(${key}) eq ${d}`)
      if (h != undefined) exps.push(`hour(${key}) eq ${h}`)
      if (mm != undefined) exps.push(`minute(${key}) eq ${mm}`)
      return makeExp('(' + exps.join(') and (') + ')')
    },

    isSame: (
      val: string | number | Date | FilterWithKey,
      g?: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
    ) => {
      if (typeof val === 'string') {
        return makeExp(`${key} eq ${val}`)
      } else if (typeof val === 'number') {
        return makeExp(`${g}(${key}) eq ${val}`)
      } else if (val instanceof Date) {
        if (g == null) {
          return makeExp(`${key} eq ${val.toISOString()}`)
        } else {
          const o = dateToObject(val)
          return makeExp(`${g}(${key}) eq ${o[g]}`)
        }
      } else {
        return makeExp(`${g}(${key}) eq ${g}(${val._key})`)
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
    isNull: () => makeExp(`${key} eq null`),
    notNull: () => makeExp(`${key} ne null`),
    contains: strFuncBuilder('contains'),
    startsWith: strFuncBuilder('startswith'),
    endsWith: strFuncBuilder('endswith'),
    tolower: () => makeFilter(`tolower(${key})`),
    toupper: () => makeFilter(`toupper(${key})`),
    length: () => makeFilter(`length(${key})`),
    trim: () => makeFilter(`trim(${key})`),
    indexof: (s: string) => makeFilter(`indexof(${key}, '${s}')`),
    substring: (n: number) => makeFilter(`substring(${key}, ${n})`),
    append: (s: string) => makeFilter(`concat(${key}, '${s}')`),
    prepend: (s: string) => makeFilter(`concat('${s}', ${key})`),

    //////////////////////
    // FilterBuilderNumber
    biggerThan: numberComparison('gt'),
    lessThan: numberComparison('lt'),
    biggerThanOrEqual: numberComparison('ge'),
    lessThanOrEqual: numberComparison('le'),

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

function makeFilter(prefix = ''): FilterBuilder<unknown> {
  return new Proxy(
    {},
    {
      get(_, prop) {
        const methods = filterBuilder(prefix)
        const key = prefix ? `${prefix}/${String(prop)}` : String(prop)

        return methods?.[prop as keyof typeof methods]
          ? methods[prop as keyof typeof methods]
          : makeFilter(String(key))
      },
    }
  )
}

type FilterFunction = (builder: FilterBuilder<unknown>) => ExpressionWithGet

export function createFilter(descriptor: QueryDescriptor) {
  return (
    keyOrExp: string | FilterFunction,
    exp?: FilterFunction
  ) => {
    const expr =
      typeof keyOrExp === 'string'
        ? exp!(filterBuilder(keyOrExp))
        : keyOrExp(makeFilter())

    return createQuery({
      ...descriptor,
      filters: descriptor.filters.concat(expr._get()),
    })
  }
}
