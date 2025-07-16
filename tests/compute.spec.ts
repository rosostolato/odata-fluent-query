import { odataQuery } from '../src'
import { User } from './data/user'
import { Product } from './data/product'
import { Order } from './data/order'

describe('testing compute operations', () => {
  describe('mathematical operations', () => {
    it('should generate multiply operation', () => {
      const query = odataQuery<Product>()
        .compute(c => c.price.multiply(c.quantity).as('totalPrice'))
        .toString()
      
      expect(query).toBe('$compute=price mul quantity as totalPrice')
    })

    it('should generate divide operation', () => {
      const query = odataQuery<Product>()
        .compute(c => c.price.divide(c.quantity).as('unitPrice'))
        .toString()
      
      expect(query).toBe('$compute=price div quantity as unitPrice')
    })

    it('should generate add operation', () => {
      const query = odataQuery<Product>()
        .compute(c => c.price.add(c.taxRate).as('priceWithTax'))
        .toString()
      
      expect(query).toBe('$compute=price add taxRate as priceWithTax')
    })

    it('should generate subtract operation', () => {
      const query = odataQuery<Product>()
        .compute(c => c.price.subtract(c.discountRate).as('discountedPrice'))
        .toString()
      
      expect(query).toBe('$compute=price sub discountRate as discountedPrice')
    })

    it('should support mathematical operations with numbers', () => {
      const query = odataQuery<Product>()
        .compute(c => c.price.multiply(1.2).as('priceWithMarkup'))
        .toString()
      
      expect(query).toBe('$compute=price mul 1.2 as priceWithMarkup')
    })

    it('should support complex mathematical expressions', () => {
      const query = odataQuery<Order>()
        .compute(c => c.subtotal.add(c.shipping).subtract(c.discount).as('finalTotal'))
        .toString()
      
      expect(query).toBe('$compute=subtotal add shipping sub discount as finalTotal')
    })
  })

  describe('string operations', () => {
    it('should generate substring operation', () => {
      const query = odataQuery<User>()
        .compute(c => c.givenName.substring(0, 1).as('firstChar'))
        .toString()
      
      expect(query).toBe('$compute=substring(givenName,0,1) as firstChar')
    })

    it('should generate substring operation with start only', () => {
      const query = odataQuery<User>()
        .compute(c => c.givenName.substring(1).as('withoutFirst'))
        .toString()
      
      expect(query).toBe('$compute=substring(givenName,1) as withoutFirst')
    })

    it('should generate length operation', () => {
      const query = odataQuery<User>()
        .compute(c => c.givenName.length().as('nameLength'))
        .toString()
      
      expect(query).toBe('$compute=length(givenName) as nameLength')
    })

    it('should generate concat operation', () => {
      const query = odataQuery<User>()
        .compute(c => c.givenName.concat(' ', 'Test').as('fullName'))
        .toString()
      
      expect(query).toBe("$compute=concat(givenName,' ','Test') as fullName")
    })

    it('should generate concat with multiple values', () => {
      const query = odataQuery<User>()
        .compute(c => c.givenName.concat(' ', 'Test', ' (', c.email, ')').as('displayName'))
        .toString()
      
      expect(query).toBe("$compute=concat(givenName,' ','Test',' (',email,')') as displayName")
    })
  })

  describe('multiple compute operations', () => {
    it('should support multiple compute calls', () => {
      const query = odataQuery<Product>()
        .compute(c => c.price.multiply(c.quantity).as('totalPrice'))
        .compute(c => c.taxRate.add(0.1).as('newTaxRate'))
        .toString()
      
      expect(query).toBe('$compute=price mul quantity as totalPrice,taxRate add 0.1 as newTaxRate')
    })

    it('should combine compute with other operations', () => {
      const query = odataQuery<Product>()
        .compute(c => c.price.multiply(c.quantity).as('totalPrice'))
        .select('id', 'name')
        .filter(p => p.price.biggerThan(100))
        .toString()
      
      expect(query).toBe('$filter=price gt 100&$select=id,name&$compute=price mul quantity as totalPrice')
    })
  })

  describe('complex scenarios', () => {
    it('should work with nested properties', () => {
      const query = odataQuery<User>()
        .compute(c => c.givenName.concat(', ', 'suffix').as('fullName'))
        .toString()
      
      expect(query).toBe("$compute=concat(givenName,', ','suffix') as fullName")
    })

    it('should work in expand queries', () => {
      const query = odataQuery<User>()
        .expand('posts', q => q
          .compute(c => c.content.concat(' - ', 'suffix').as('fullContent'))
          .select('id', 'content')
        )
        .toString()
      
      expect(query).toBe("$expand=posts($select=id,content;$compute=concat(content,' - ','suffix') as fullContent)")
    })
  })

  describe('toObject method', () => {
    it('should include compute in object output', () => {
      const query = odataQuery<Product>()
        .compute(c => c.price.multiply(c.quantity).as('totalPrice'))
        .compute(c => c.name.substring(0, 5).as('shortName'))
        .toObject()
      
      expect(query).toEqual({
        $compute: 'price mul quantity as totalPrice,substring(name,0,5) as shortName'
      })
    })

    it('should include compute with other operations in object output', () => {
      const query = odataQuery<Product>()
        .compute(c => c.price.multiply(c.quantity).as('totalPrice'))
        .select('id', 'name')
        .toObject()
      
      expect(query).toEqual({
        $compute: 'price mul quantity as totalPrice',
        $select: 'id,name'
      })
    })
  })

  describe('edge cases', () => {
    it('should handle empty compute gracefully', () => {
      const query = odataQuery<Product>()
        .select('id', 'name')
        .toString()
      
      expect(query).toBe('$select=id,name')
    })

    it('should handle chained mathematical operations', () => {
      const query = odataQuery<Product>()
        .compute(c => c.price.multiply(c.quantity).add(c.taxRate).as('totalWithTax'))
        .toString()
      
      expect(query).toBe('$compute=price mul quantity add taxRate as totalWithTax')
    })

    it('should handle chained string operations', () => {
      const query = odataQuery<User>()
        .compute(c => c.givenName.substring(0, 1).concat('X').as('initials'))
        .toString()
      
      expect(query).toBe("$compute=concat(substring(givenName,0,1),'X') as initials")
    })
  })
})