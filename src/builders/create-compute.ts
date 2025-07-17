import { QueryDescriptor } from '../models'
import { ComputeBuilder, ComputeExpression, ComputeNumber, ComputeString } from '../models/query-compute'
import { createQuery } from './create-query'

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

function createComputeBuilder<T>(): ComputeBuilder<T> {
  return new Proxy({} as ComputeBuilder<T>, {
    get(_target, prop) {
      if (typeof prop === 'symbol') return undefined
      
      return getComputeProperty(prop.toString())
    }
  })
}

function getComputeProperty(propertyPath: string): unknown {
  return {
    as: <K extends string>(alias: K) => ({
      toString: () => `${propertyPath} as ${alias}`,
      _alias: alias,
      _type: undefined
    }),
    toString: () => propertyPath,
    substring: (start: number, length?: number) => {
      const args = length !== undefined ? `${start},${length}` : start.toString()

      return getComputeProperty(`substring(${propertyPath},${args})`)
    },
    length: () => getComputeProperty(`length(${propertyPath})`),
    concat: (...values: (string | ComputeString | ComputeExpression)[]) => {
      const args = values.map(v => {
        if (typeof v === 'string') {
          return `'${v}'`
        } else if (v && typeof v.toString === 'function') {
          return v.toString()
        } else {
          return v
        }
      })
      
      return getComputeProperty(`concat(${propertyPath},${args.join(',')})`)
    },
    multiply: (value: number | ComputeNumber | ComputeExpression) => 
      getComputeProperty(`${propertyPath} mul ${value.toString()}`)
    ,
    divide: (value: number | ComputeNumber | ComputeExpression) => 
      getComputeProperty(`${propertyPath} div ${value.toString()}`)
    ,
    add: (value: number | ComputeNumber | ComputeExpression) => 
      getComputeProperty(`${propertyPath} add ${value.toString()}`)
    ,
    subtract: (value: number | ComputeNumber | ComputeExpression) => 
      getComputeProperty(`${propertyPath} sub ${value.toString()}`),
    year: () => getComputeProperty(`year(${propertyPath})`),
    month: () => getComputeProperty(`month(${propertyPath})`),
    day: () => getComputeProperty(`day(${propertyPath})`),
    hour: () => getComputeProperty(`hour(${propertyPath})`),
    minute: () => getComputeProperty(`minute(${propertyPath})`),
    second: () => getComputeProperty(`second(${propertyPath})`),
    date: () => getComputeProperty(`date(${propertyPath})`),
    time: () => getComputeProperty(`time(${propertyPath})`),
  }
}

