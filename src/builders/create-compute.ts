import { QueryDescriptor } from '../models'
import { ComputeBuilder, ComputeExpression, createComputeProperty } from '../models/query-compute'
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
      if (typeof prop === 'symbol') {
        return undefined
      }
      
      return createComputeProperty(prop.toString())
    }
  })
}