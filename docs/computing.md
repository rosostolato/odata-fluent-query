# Computing with `compute`

The `compute` method allows you to create computed properties using mathematical operations, string functions and boolean operations. Computed aliases are **type-safe** and can be used in subsequent `select`, `filter`, and `orderBy` operations.

> **📋 Compatibility Note**: The `$compute` feature requires **OData 4.01** or later. For .NET servers, this means **Microsoft.AspNetCore.OData 8.0.6+** or **Microsoft.AspNetCore.OData 9.0+**. Verify your OData server supports the `$compute` query option before using this feature.

## Mathematical Operations

```ts
import { odataQuery } from 'odata-fluent-query'

interface Product {
  id: number
  price: number
  quantity: number
  taxRate: number
}

// Basic mathematical operations
odataQuery<Product>()
  .compute(c => c.price.multiply(c.quantity).as('totalPrice'))
  .toString()

// result: $compute=price mul quantity as totalPrice

// Complex mathematical expressions
odataQuery<Product>()
  .compute(c => c.price.multiply(c.quantity).add(c.taxRate).as('totalWithTax'))
  .toString()

// result: $compute=price mul quantity add taxRate as totalWithTax
```

Available mathematical operations:
- `multiply(value)` - Multiplication (uses OData `mul` operator)
- `divide(value)` - Division (uses OData `div` operator)  
- `add(value)` - Addition (uses OData `add` operator)
- `subtract(value)` - Subtraction (uses OData `sub` operator)

## String Operations

```ts
interface User {
  firstName: string
  lastName: string
  email: string
}

// String concatenation
odataQuery<User>()
  .compute(c => c.firstName.concat(' ', c.lastName).as('fullName'))
  .toString()

// result: $compute=concat(concat(firstName,' '),lastName) as fullName

// String functions
odataQuery<User>()
  .compute(c => c.firstName.substring(0, 1).as('firstInitial'))
  .compute(c => c.email.length().as('emailLength'))
  .toString()

// result: $compute=substring(firstName,0,1) as firstInitial,length(email) as emailLength
```

Available string operations:
- `concat(...values)` - String concatenation
- `substring(start, length?)` - Extract substring
- `length()` - Get string length

## Boolean Operations

```ts
interface User {
  id: number
  isActive: boolean
  isVerified: boolean
  surname: string
}

// Boolean logical operations
odataQuery<User>()
  .compute(c => c.isActive.and(c.isVerified).as('isActiveAndVerified'))
  .toString()

// result: $compute=isActive and isVerified as isActiveAndVerified

// Boolean comparisons
odataQuery<User>()
  .compute(c => c.surname.equals('Doe').as('isJohnDoe'))
  .toString()

// result: $compute=surname eq 'Doe' as isJohnDoe
```

Available boolean operations:
- `and(value)` - Logical AND operation
- `or(value)` - Logical OR operation
- `not()` - Logical NOT operation
- `equals(value)` - Equality comparison
- `notEquals(value)` - Inequality comparison

## Date Operations

```ts
interface User {
  birthDate: Date
  lastLogin: Date
}

// Extract date components
odataQuery<User>()
  .compute(c => c.birthDate.year().as('birthYear'))
  .compute(c => c.lastLogin.month().as('loginMonth'))
  .toString()

// result: $compute=year(birthDate) as birthYear,month(lastLogin) as loginMonth
```

Available date operations:
- `year()` - Extract year component
- `month()` - Extract month component (1-12)
- `day()` - Extract day component (1-31)
- `hour()` - Extract hour component (0-23)
- `minute()` - Extract minute component (0-59)
- `second()` - Extract second component (0-59)
- `date()` - Extract date portion only
- `time()` - Extract time portion only

## Type-Safe Computed Aliases

The most powerful feature of `compute` is that computed aliases become **type-safe properties** that can be used in subsequent operations:

```ts
interface Product {
  id: number
  name: string
  price: number
  quantity: number
}

const query = odataQuery<Product>()
  .compute(c => c.price.multiply(c.quantity).as('totalPrice'))    // Creates totalPrice: number
  .compute(c => c.name.substring(0, 5).as('shortName'))          // Creates shortName: string

// Now you can use the computed aliases with full type safety and IntelliSense:
query
  .select('id', 'name', 'totalPrice', 'shortName')              // ✅ Type-safe selection
  .filter(p => p.totalPrice.biggerThan(100))                    // ✅ Type-safe filtering  
  .filter(p => p.shortName.contains('prod'))                    // ✅ Type-safe string operations
  .orderBy('totalPrice', 'desc')                                // ✅ Type-safe ordering
  .toString()

// result: $filter=totalPrice gt 100 and contains(shortName,'prod')&$select=id,name,totalPrice,shortName&$orderby=totalPrice desc&$compute=price mul quantity as totalPrice,substring(name,0,5) as shortName
```

## Multiple Compute Operations

You can chain multiple `compute` calls to create several computed properties:

```ts
odataQuery<Product>()
  .compute(c => c.price.multiply(c.quantity).as('subtotal'))
  .compute(c => c.subtotal.multiply(1.1).as('totalWithTax'))    // Use previous computed property
  .select('id', 'subtotal', 'totalWithTax')
  .toString()

// result: $select=id,subtotal,totalWithTax&$compute=price mul quantity as subtotal,subtotal mul 1.1 as totalWithTax
```

## Compute in Expand Operations

Computed properties also work within `expand` operations:

```ts
odataQuery<User>()
  .expand('posts', q => q
    .compute(c => c.title.concat(' - ', c.category).as('fullTitle'))
    .select('id', 'fullTitle')
    .filter(p => p.fullTitle.contains('tech'))
  )
  .toString()

// result: $expand=posts($filter=contains(fullTitle,'tech')&$select=id,fullTitle;$compute=concat(title,' - ',category) as fullTitle)
``` 