import { FilterExpression } from '../models/filter'
import { QueryDescriptor } from '../models/query-descriptor'
import { createQuery } from './create-query'

interface ComplexFilterExpression extends FilterExpression {
  getFilterExpresion(checkParetheses?: boolean): string
}

function mk_exp(exp: string): ComplexFilterExpression {
  const getFilterExpresion = (checkParetheses = false) => {
    if (!checkParetheses) return exp

    if (exp.indexOf(' or ') > -1 || exp.indexOf(' and ') > -1) {
      return `(${exp})`
    }

    return exp
  }

  return {
    not: () => mk_exp(`not (${exp})`),
    and: (exp: ComplexFilterExpression) =>
      mk_exp(`${getFilterExpresion()} and ${exp.getFilterExpresion(true)}`),
    or: (exp: ComplexFilterExpression) =>
      mk_exp(`${getFilterExpresion()} or ${exp.getFilterExpresion(true)}`),
    getFilterExpresion,
  }
}

function filterBuilder(key: string) {
  const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  // for equals or notEquals
  const eqOrNe = (t: 'eq' | 'ne', x: any, options?: any) => {
    switch (typeof x) {
      case 'string':
        if (isGuid.test(x)) {
          return mk_exp(`${key} ${t} ${x}`) // no quote around ${x}
        }

        if (options?.caseInsensitive) {
          return mk_exp(`tolower(${key}) ${t} '${x.toLocaleLowerCase()}'`)
        }

        return mk_exp(`${key} ${t} '${x}'`)

      case 'number':
        return mk_exp(`${key} ${t} ${x}`)

      case 'boolean':
        return mk_exp(`${key} ${t} ${x}`)

      default:
        if (x && options?.caseInsensitive) {
          return mk_exp(`tolower(${key}) ${t} tolower(${x.$key})`)
        }

        return mk_exp(`${key} ${t} ${x?.$key || key}`)
    }
  }

  return makeFilter(key, {
    $key: key,

    ////////////////////////////////
    // FilterBuilder Generic Methods
    equals(x: any, options?: any) {
      return eqOrNe('eq', x, options)
    },
    notEquals(x: any, options?: any) {
      return eqOrNe('ne', x, options)
    },
    in(arr: (number | string)[]) {
      const list = arr
        .map((x) => (typeof x === 'string' ? `'${x}'` : x))
        .join(',')

      return mk_exp(`${key} in (${list})`)
    },
  })
}

function makeFilter(prefix = '', methods?: any) {
  return new Proxy(
    {},
    {
      get(_, prop) {
        const key = prefix ? `${prefix}/${String(prop)}` : String(prop)
        return methods?.[prop] ? methods[prop] : filterBuilder(String(key))
      },
    }
  )
}

export function createFilter<T>(descriptor: QueryDescriptor): any {
  return (keyOrExp: any, exp?: any) => {
    const expr =
      typeof keyOrExp === 'string'
        ? exp(filterBuilder(keyOrExp))
        : keyOrExp(makeFilter())

    const filters = [...descriptor.filters, expr.getFilterExpresion()]
    return createQuery({ ...descriptor, filters })
  }
}
