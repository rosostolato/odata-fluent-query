import { QueryDescriptor } from '../models'
import { ComputeBuilder, ComputeExpression, ComputeNumber, ComputeString, ComputeBoolean } from '../models/query-compute'
import { createQuery } from './create-query'

function computeBuilder(propertyPath: string): ComputeBuilder<unknown> {
  return {
    as: <TAlias extends string>(alias: TAlias) => ({
      toString: () => `${propertyPath} as ${alias}`,
    }),
    toString: () => propertyPath,
    substring: (start: number, length?: number) => {
      const args = length !== undefined ? `${start},${length}` : start.toString()

      return computeBuilder(`substring(${propertyPath},${args})`)
    },
    length: () => computeBuilder(`length(${propertyPath})`),
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
        return computeBuilder(`concat(${propertyPath},${args[0]})`)
      } else {
        let result = `concat(${propertyPath},${args[0]})`

        for (let i = 1; i < args.length; i++) {
          result = `concat(${result},${args[i]})`
        }

        return computeBuilder(result)
      }
    },
    and: (value: boolean | ComputeBoolean | ComputeExpression) => 
      computeBuilder(`${propertyPath} and ${typeof value === 'boolean' ? value : value.toString()}`),
    or: (value: boolean | ComputeBoolean | ComputeExpression) => 
      computeBuilder(`${propertyPath} or ${typeof value === 'boolean' ? value : value.toString()}`),
    not: () => computeBuilder(`not ${propertyPath}`),
    equals: (value: boolean | ComputeBoolean | ComputeExpression) => 
      computeBuilder(`${propertyPath} eq ${typeof value === 'boolean' ? value : value.toString()}`),
    notEquals: (value: boolean | ComputeBoolean | ComputeExpression) => 
      computeBuilder(`${propertyPath} ne ${typeof value === 'boolean' ? value : value.toString()}`),
    multiply: (value: number | ComputeNumber | ComputeExpression) => 
      computeBuilder(`${propertyPath} mul ${typeof value === 'number' ? value : value.toString()}`)
    ,
    divide: (value: number | ComputeNumber | ComputeExpression) => 
      computeBuilder(`${propertyPath} div ${typeof value === 'number' ? value : value.toString()}`)
    ,
    add: (value: number | ComputeNumber | ComputeExpression) => 
      computeBuilder(`${propertyPath} add ${typeof value === 'number' ? value : value.toString()}`)
    ,
    subtract: (value: number | ComputeNumber | ComputeExpression) => 
      computeBuilder(`${propertyPath} sub ${typeof value === 'number' ? value : value.toString()}`),
    year: () => computeBuilder(`year(${propertyPath})`),
    month: () => computeBuilder(`month(${propertyPath})`),
    day: () => computeBuilder(`day(${propertyPath})`),
    hour: () => computeBuilder(`hour(${propertyPath})`),
    minute: () => computeBuilder(`minute(${propertyPath})`),
    second: () => computeBuilder(`second(${propertyPath})`),
    date: () => computeBuilder(`date(${propertyPath})`),
    time: () => computeBuilder(`time(${propertyPath})`)
  }
}

function makeCompute<T>(): ComputeBuilder<T> {
  return new Proxy({} as ComputeBuilder<T>, {
    get(_target, prop) {
      if (typeof prop === 'symbol') return undefined
      
      return computeBuilder(prop.toString())
    }
  })
}

export function createCompute<T>(descriptor: QueryDescriptor) {
  return (
    exp: (builder: ComputeBuilder<T>) => ComputeExpression
  ) => {
    const builder = makeCompute<T>()
    const expression = exp(builder)
    
    const newDescriptor = {
      ...descriptor,
      compute: [...descriptor.compute, expression.toString()]
    }
    
    return createQuery(newDescriptor)
  }
}

