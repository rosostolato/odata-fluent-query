import { odataQuery } from '../src'
import { User } from './data/user'
import { Product } from './data/product'
import { Order } from './data/order'
import { OptionalEntity } from './data/optional-entity'

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

    it('should handle primitive numbers in mathematical operations', () => {
      const query = odataQuery<Product>()
        .compute(c => c.price.multiply(2).as('doublePrice'))
        .toString()
      
      expect(query).toBe("$compute=price mul 2 as doublePrice")
    })

    it('should handle compute expressions in mathematical operations', () => {
      const query = odataQuery<Product>()
        .compute(c => c.price.multiply(c.quantity).as('totalPrice'))
        .toString()
      
      expect(query).toBe("$compute=price mul quantity as totalPrice")
    })

    it('should handle primitive numbers in divide operations', () => {
      const query = odataQuery<Product>()
        .compute(c => c.price.divide(2).as('halfPrice'))
        .toString()
      
      expect(query).toBe("$compute=price div 2 as halfPrice")
    })

    it('should handle primitive numbers in add operations', () => {
      const query = odataQuery<Product>()
        .compute(c => c.price.add(100).as('priceWithSurcharge'))
        .toString()
      
      expect(query).toBe("$compute=price add 100 as priceWithSurcharge")
    })

    it('should handle primitive numbers in subtract operations', () => {
      const query = odataQuery<Product>()
        .compute(c => c.price.subtract(50).as('discountedPrice'))
        .toString()
      
      expect(query).toBe("$compute=price sub 50 as discountedPrice")
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
      
      expect(query).toBe("$compute=concat(concat(givenName,' '),'Test') as fullName")
    })

    it('should generate concat with multiple values', () => {
      const query = odataQuery<User>()
        .compute(c => c.givenName.concat(' ', 'Test', ' (', c.email, ')').as('displayName'))
        .toString()
      
      expect(query).toBe("$compute=concat(concat(concat(concat(concat(givenName,' '),'Test'),' ('),email),')') as displayName")
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
      
      expect(query).toBe("$compute=concat(concat(givenName,', '),'suffix') as fullName")
    })

    it('should work in expand queries', () => {
      const query = odataQuery<User>()
        .expand('posts', q => q
          .compute(c => c.content.concat(' - ', 'suffix').as('fullContent'))
          .select('id', 'content')
        )
        .toString()
      
      expect(query).toBe("$expand=posts($select=id,content;$compute=concat(concat(content,' - '),'suffix') as fullContent)")
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


  describe('boolean operations', () => {
    it('should generate and operation', () => {
      const query = odataQuery<User>()
        .compute(c => c.accountEnabled.and(true).as('isActiveAndTrue'))
        .toString()
      
      expect(query).toBe("$compute=accountEnabled and true as isActiveAndTrue")
    })

    it('should generate or operation', () => {
      const query = odataQuery<User>()
        .compute(c => c.accountEnabled.or(false).as('isActiveOrFalse'))
        .toString()
      
      expect(query).toBe("$compute=accountEnabled or false as isActiveOrFalse")
    })

    it('should generate not operation', () => {
      const query = odataQuery<User>()
        .compute(c => c.accountEnabled.not().as('isNotActive'))
        .toString()
      
      expect(query).toBe("$compute=not accountEnabled as isNotActive")
    })

    it('should generate equals operation', () => {
      const query = odataQuery<User>()
        .compute(c => c.accountEnabled.equals(true).as('isActive'))
        .toString()
      
      expect(query).toBe("$compute=accountEnabled eq true as isActive")
    })

    it('should generate notEquals operation', () => {
      const query = odataQuery<User>()
        .compute(c => c.accountEnabled.notEquals(false).as('isNotDisabled'))
        .toString()
      
      expect(query).toBe("$compute=accountEnabled ne false as isNotDisabled")
    })

    it('should handle primitive values in boolean operations', () => {
      const query = odataQuery<User>()
        .compute(c => c.accountEnabled.and(true).as('test'))
        .toString()
      
      expect(query).toBe("$compute=accountEnabled and true as test")
    })

    it('should handle compute expressions in boolean operations', () => {
      const query = odataQuery<User>()
        .compute(c => c.accountEnabled.and(c.accountEnabled).as('test'))
        .toString()
      
      expect(query).toBe("$compute=accountEnabled and accountEnabled as test")
    })

    it('should handle primitive values in or operations', () => {
      const query = odataQuery<User>()
        .compute(c => c.accountEnabled.or(false).as('test'))
        .toString()
      
      expect(query).toBe("$compute=accountEnabled or false as test")
    })

    it('should handle primitive values in equals operations', () => {
      const query = odataQuery<User>()
        .compute(c => c.accountEnabled.equals(true).as('test'))
        .toString()
      
      expect(query).toBe("$compute=accountEnabled eq true as test")
    })

    it('should handle primitive values in notEquals operations', () => {
      const query = odataQuery<User>()
        .compute(c => c.accountEnabled.notEquals(false).as('test'))
        .toString()
      
      expect(query).toBe("$compute=accountEnabled ne false as test")
    })

    it('should handle compute expressions in or operations', () => {
      const query = odataQuery<User>()
        .compute(c => c.accountEnabled.or(c.accountEnabled).as('test'))
        .toString()
      
      expect(query).toBe("$compute=accountEnabled or accountEnabled as test")
    })

    it('should handle compute expressions in equals operations', () => {
      const query = odataQuery<User>()
        .compute(c => c.accountEnabled.equals(c.accountEnabled).as('test'))
        .toString()
      
      expect(query).toBe("$compute=accountEnabled eq accountEnabled as test")
    })

    it('should handle compute expressions in notEquals operations', () => {
      const query = odataQuery<User>()
        .compute(c => c.accountEnabled.notEquals(c.accountEnabled).as('test'))
        .toString()
      
      expect(query).toBe("$compute=accountEnabled ne accountEnabled as test")
    })
  })

  describe('date operations', () => {
    it('should generate year operation', () => {
      const query = odataQuery<User>()
        .compute(c => c.birthDate.year().as('birthYear'))
        .toString()
      
      expect(query).toBe('$compute=year(birthDate) as birthYear')
    })

    it('should generate month operation', () => {
      const query = odataQuery<User>()
        .compute(c => c.birthDate.month().as('birthMonth'))
        .toString()
      
      expect(query).toBe('$compute=month(birthDate) as birthMonth')
    })

    it('should generate day operation', () => {
      const query = odataQuery<User>()
        .compute(c => c.birthDate.day().as('birthDay'))
        .toString()
      
      expect(query).toBe('$compute=day(birthDate) as birthDay')
    })

    it('should generate hour operation', () => {
      const query = odataQuery<User>()
        .compute(c => c.lastLogin.hour().as('loginHour'))
        .toString()
      
      expect(query).toBe('$compute=hour(lastLogin) as loginHour')
    })

    it('should generate minute operation', () => {
      const query = odataQuery<User>()
        .compute(c => c.lastLogin.minute().as('loginMinute'))
        .toString()
      
      expect(query).toBe('$compute=minute(lastLogin) as loginMinute')
    })

    it('should generate second operation', () => {
      const query = odataQuery<User>()
        .compute(c => c.lastLogin.second().as('loginSecond'))
        .toString()
      
      expect(query).toBe('$compute=second(lastLogin) as loginSecond')
    })

    it('should generate date operation', () => {
      const query = odataQuery<User>()
        .compute(c => c.lastLogin.date().as('loginDate'))
        .toString()
      
      expect(query).toBe('$compute=date(lastLogin) as loginDate')
    })

    it('should generate time operation', () => {
      const query = odataQuery<User>()
        .compute(c => c.lastLogin.time().as('loginTime'))
        .toString()
      
      expect(query).toBe('$compute=time(lastLogin) as loginTime')
    })
  })

  // These tests ensure type errors don't occur when using compute operations on optional properties
  describe('optional properties', () => {
    it('should handle compute operations on optional string properties', () => {
      const query = odataQuery<OptionalEntity>()
        .compute(c => c.optionalString.substring(0, 1).as('firstLetter'))
        .toString()
      
      expect(query).toBe('$compute=substring(optionalString,0,1) as firstLetter')
    })

    it('should handle compute operations on optional number properties', () => {
      const query = odataQuery<OptionalEntity>()
        .compute(c => c.optionalNumber.multiply(2).as('doubled'))
        .toString()
      
      expect(query).toBe('$compute=optionalNumber mul 2 as doubled')
    })

    it('should handle compute operations on optional boolean properties', () => {
      const query = odataQuery<OptionalEntity>()
        .compute(c => c.optionalBoolean.and(true).as('result'))
        .toString()
      
      expect(query).toBe('$compute=optionalBoolean and true as result')
    })

    it('should handle compute operations on optional date properties', () => {
      const query = odataQuery<OptionalEntity>()
        .compute(c => c.optionalDate.year().as('year'))
        .toString()
      
      expect(query).toBe('$compute=year(optionalDate) as year')
    })

    it('should handle compute operations on nullable string properties', () => {
      const query = odataQuery<OptionalEntity>()
        .compute(c => c.nullableString.length().as('length'))
        .toString()
      
      expect(query).toBe('$compute=length(nullableString) as length')
    })

    it('should handle compute operations on nullable number properties', () => {
      const query = odataQuery<OptionalEntity>()
        .compute(c => c.nullableNumber.add(10).as('added'))
        .toString()
      
      expect(query).toBe('$compute=nullableNumber add 10 as added')
    })

    it('should handle compute operations on optional nullable properties', () => {
      const query = odataQuery<OptionalEntity>()
        .compute(c => c.optionalNullableString.concat(' suffix').as('withSuffix'))
        .toString()
      
      expect(query).toBe("$compute=concat(optionalNullableString,' suffix') as withSuffix")
    })

    it('should allow chaining operations on optional properties', () => {
      const query = odataQuery<OptionalEntity>()
        .compute(c => c.optionalString.substring(0, 3).concat('...').as('short'))
        .toString()
      
      expect(query).toBe("$compute=concat(substring(optionalString,0,3),'...') as short")
    })

    it('should work with mixed optional and required properties', () => {
      const query = odataQuery<OptionalEntity>()
        .compute(c => c.optionalString.concat(' - ', c.requiredName).as('display'))
        .select('id', 'display')
        .toString()
      
      expect(query).toBe('$select=id,display&$compute=concat(concat(optionalString,\' - \'),requiredName) as display')
    })

    it('should handle multiple optional property compute operations', () => {
      const query = odataQuery<OptionalEntity>()
        .compute(c => c.optionalNumber.multiply(2).as('doubled'))
        .compute(c => c.optionalString.length().as('stringLength'))
        .toString()
      
      expect(query).toBe('$compute=optionalNumber mul 2 as doubled,length(optionalString) as stringLength')
    })

    it('should still work with existing User optional properties', () => {
      const query = odataQuery<User>()
        .compute(c => c.surname.substring(0, 1).as('firstLetter'))
        .toString()
      
      expect(query).toBe('$compute=substring(surname,0,1) as firstLetter')
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

    it('should handle concat with non-string, non-function values', () => {
      const query = odataQuery<User>()
        .compute(c => c.givenName.concat(' - ', null as never, ' test').as('withNull'))
        .toString()
      
      expect(query).toBe("$compute=concat(concat(concat(givenName,' - '),null),' test') as withNull")
    })

    it('should handle symbol access in proxy', () => {
      const query = odataQuery<User>()
        .compute(c => {
          const builder = c
          const symbolResult = builder[Symbol.iterator]
          expect(symbolResult).toBeUndefined()
          
          return c.givenName.as('name')
        })
        .toString()
      
      expect(query).toBe('$compute=givenName as name')
    })
  })
})