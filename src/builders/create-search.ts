import { QueryDescriptor } from '../models'
import { SearchBuilder, SearchExpression, SearchExpressionInternal } from '../models/query-search'
import { createQuery } from './create-query'

function shouldAddTokenQuotes(value: string): boolean {
  return !/^[a-zA-Z\s]+$/.test(value)
}

function processToken(value: number | boolean | string): string {
  if (typeof value === 'number' || typeof value === 'boolean') {
    return `"${String(value)}"`
  }

  const stringValue = String(value);
  
  return shouldAddTokenQuotes(stringValue) ? `"${stringValue}"` : stringValue
}

function makeSearchExp(expression: string): SearchExpressionInternal {
  return {
    _get: () => expression,
    not: () => makeSearchExp(`NOT ${expression}`),
    and: (value: string) => {
      const processedValue = processToken(value)
      
      return makeSearchExp(`${expression} AND ${processedValue}`)
    },
    or: (value: string) => {
      const processedValue = processToken(value)

      return makeSearchExp(`${expression} OR ${processedValue}`)
    },
  }
}

function makeSearchBuilder(): SearchBuilder {
  return {
    token: (value: number | boolean | string) => {
      const stringValue = processToken(value)
      
      return makeSearchExp(stringValue)
    },
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