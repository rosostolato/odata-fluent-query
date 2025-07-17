import { QueryDescriptor } from '../models'
import { ComputeBuilder, ComputeExpression, ComputeNumber, ComputeString } from '../models/query-compute'
import { createQuery } from './create-query'

function getComputeExpression(propertyPath: string): unknown {
  return {
    as: <TAlias extends string>(alias: TAlias) => ({
      toString: () => `${propertyPath} as ${alias}`,
      _alias: alias,
      _type: undefined
    }),
    toString: () => propertyPath,
    substring: (start: number, length?: number) => {
      const args = length !== undefined ? `${start},${length}` : start.toString()

      return getComputeExpression(`substring(${propertyPath},${args})`)
    },
    length: () => getComputeExpression(`length(${propertyPath})`),
    concat: (...values: (string | ComputeString | ComputeExpression)[]) => {
      const args = values.map(v => {
        if (typeof v === 'string') return `'${v}'`
        if (v && typeof v.toString === 'function') return v.toString()

        return v
      })
      
      // AVJ: below we have to handle the fact that OData concat
      // requires nested concat calls for multiple arguments
      // beyond just two. This will allow a user to pass many arguments
      // to `.concat` and the nesting will be done behind the scenes.
      if (args.length === 1) {
        return getComputeExpression(`concat(${propertyPath},${args[0]})`)
      } else {
        let result = `concat(${propertyPath},${args[0]})`

        for (let i = 1; i < args.length; i++) {
          result = `concat(${result},${args[i]})`
        }

        return getComputeExpression(result)
      }
    },
    multiply: (value: number | ComputeNumber | ComputeExpression) => 
      getComputeExpression(`${propertyPath} mul ${value.toString()}`)
    ,
    divide: (value: number | ComputeNumber | ComputeExpression) => 
      getComputeExpression(`${propertyPath} div ${value.toString()}`)
    ,
    add: (value: number | ComputeNumber | ComputeExpression) => 
      getComputeExpression(`${propertyPath} add ${value.toString()}`)
    ,
    subtract: (value: number | ComputeNumber | ComputeExpression) => 
      getComputeExpression(`${propertyPath} sub ${value.toString()}`),
    year: () => getComputeExpression(`year(${propertyPath})`),
    month: () => getComputeExpression(`month(${propertyPath})`),
    day: () => getComputeExpression(`day(${propertyPath})`),
    hour: () => getComputeExpression(`hour(${propertyPath})`),
    minute: () => getComputeExpression(`minute(${propertyPath})`),
    second: () => getComputeExpression(`second(${propertyPath})`),
    date: () => getComputeExpression(`date(${propertyPath})`),
    time: () => getComputeExpression(`time(${propertyPath})`),
  }
}

function createComputeBuilder<T>(): ComputeBuilder<T> {
  return new Proxy({} as ComputeBuilder<T>, {
    get(_target, prop) {
      if (typeof prop === 'symbol') return undefined
      
      return getComputeExpression(prop.toString())
    }
  })
}

export function createCompute<T>(descriptor: QueryDescriptor) {
  return (
    exp: (builder: ComputeBuilder<T>) => ComputeExpression
  ) => {
    const builder = createComputeBuilder<T>()
    const expression = exp(builder)
    
    const newDescriptor = {
      ...descriptor,
      compute: [...descriptor.compute, expression.toString()]
    }
    
    return createQuery(newDescriptor)
  }
}

