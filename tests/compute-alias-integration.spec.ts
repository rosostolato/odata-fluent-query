import { odataQuery } from '../src'
import { Product } from './data/product'

describe('testing compute alias integration', () => {
  it('should allow selecting computed aliases', () => {
    const query = odataQuery<Product>()
      .compute(c => c.price.multiply(c.quantity).as('totalPrice'))
      .select('id', 'name', 'totalPrice')
      .toString()
    
    expect(query).toBe('$select=id,name,totalPrice&$compute=price mul quantity as totalPrice')
  })

  it('should allow filtering by computed aliases', () => {
    const query = odataQuery<Product>()
      .compute(c => c.price.multiply(c.quantity).as('totalPrice'))
      .filter(p => p.totalPrice.biggerThan(100))
      .toString()
    
    expect(query).toBe('$filter=totalPrice gt 100&$compute=price mul quantity as totalPrice')
  })

  it('should allow ordering by computed aliases', () => {
    const query = odataQuery<Product>()
      .compute(c => c.price.multiply(c.quantity).as('totalPrice'))
      .orderBy('totalPrice', 'desc')
      .toString()
    
    expect(query).toBe('$orderby=totalPrice desc&$compute=price mul quantity as totalPrice')
  })

  it('should support multiple computed aliases in subsequent operations', () => {
    const query = odataQuery<Product>()
      .compute(c => c.price.multiply(c.quantity).as('totalPrice'))
      .compute(c => c.name.substring(0, 5).as('shortName'))
      .select('id', 'totalPrice', 'shortName')
      .filter(p => p.totalPrice.biggerThan(50))
      .orderBy('shortName')
      .toString()
    
    expect(query).toBe('$filter=totalPrice gt 50&$select=id,totalPrice,shortName&$orderby=shortName&$compute=price mul quantity as totalPrice,substring(name,0,5) as shortName')
  })

  // This section is primarily for TypeScript compilation - if these compile, types are correct
  it('should infer correct types for computed aliases', () => {
    const query = odataQuery<Product>()
      .compute(c => c.price.multiply(c.quantity).as('totalPrice'))
      .compute(c => c.name.substring(0, 5).as('shortName'))
    
    // These should all compile without TypeScript errors:
    query.select('id', 'name', 'totalPrice', 'shortName')
    query.filter(p => p.totalPrice.biggerThan(100))
    query.filter(p => p.shortName.contains('test'))
    query.orderBy('totalPrice')
    query.orderBy('shortName')
    
    expect(true).toBe(true) // If we reach here, TypeScript compilation succeeded
  })
})