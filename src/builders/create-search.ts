import { QueryDescriptor } from '../models'
import { SearchBuilder, SearchExpression, SearchExpressionInternal } from '../models/query-search'
import { createQuery } from './create-query'


function makeSearchExp(expression: string): SearchExpressionInternal {
  return {
    _get: () => expression,
    not: () => makeSearchExp(`NOT ${expression}`),
    and: (phrase: string) => makeSearchExp(`${expression} AND ${phrase}`),
    or: (phrase: string) => makeSearchExp(`${expression} OR ${phrase}`),
  }
}

function makeSearchBuilder(): SearchBuilder {
  return {
    phrase: (phrase: string) => makeSearchExp(phrase),
    token: (value: number | boolean | string) =>  makeSearchExp(`"${String(value)}"`)
    ,
  }
}

export function createSearch(descriptor: QueryDescriptor) {
  return (exp: (builder: SearchBuilder) => SearchExpression) => {
    const builder = makeSearchBuilder()
    const expression = exp(builder) as SearchExpressionInternal
    
    return createQuery({
      ...descriptor,
      search: expression._get(),
    })
  }
}