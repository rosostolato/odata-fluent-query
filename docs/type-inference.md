# Type Inference with `typeof query.type`

The `type` property provides TypeScript type inference for OData query results, allowing you to get the exact type that your API will return based on the query operations you've applied.

## Basic Usage

```ts
import { odataQuery } from 'odata-fluent-query'

interface User {
  id: number
  email: string
  name: string
  isActive: boolean
}

// Get the type for a select query
const query = odataQuery<User>().select('id', 'email')
type UserResponse = typeof query.type // Pick<User, 'id' | 'email'>

// Use in HTTP requests
const response = await fetch(`/api/users?${query.toString()}`)
const users: UserResponse[] = await response.json()
// users is typed as { id: number, email: string }[]
```

## Complex Types vs Navigation Properties

The type system automatically distinguishes between **complex types** (embedded objects) and **navigation properties** (related entities) using TypeScript's optional property syntax:

### Interface Design Pattern

```ts
interface User {
  // Required properties = Complex types (always included)
  id: number
  email: string
  name: string
  address: {           // Complex type - always included
    street: string
    city: string
    zipCode: string
  }
  preferences: {       // Complex type - always included
    theme: string
    notifications: boolean
  }
  
  // Optional properties = Navigation properties (only included if expanded)
  orders?: Order[]     // Navigation property - requires $expand
  manager?: User       // Navigation property - requires $expand
  department?: Dept    // Navigation property - requires $expand
}
```

### Behavior Examples

```ts
// No expand - only gets required properties (complex types)
const query1 = odataQuery<User>().select('id', 'email', 'address')
type Result1 = typeof query1.type
// Result: { id: number; email: string; address: { street: string; city: string; zipCode: string } }

// With expand - includes navigation properties
const query2 = odataQuery<User>().select('id', 'orders').expand('orders')
type Result2 = typeof query2.type 
// Result: { id: number; orders: Order[] }

// Mixed - complex types included, navigation properties only if expanded
const query3 = odataQuery<User>().expand('manager')
type Result3 = typeof query3.type
// Result: { id: number; email: string; name: string; address: {...}; preferences: {...}; manager: User }
```

### Why This Approach?

This design pattern aligns with OData behavior:
- **Complex types** are stored in the same table and always returned
- **Navigation properties** are related entities that require explicit `$expand` to include
- **Optional properties** naturally represent "might not be present" which matches navigation property behavior

## Real-World Examples

### Function Return Types

```ts
function getUserIdAndEmail() {
  const query = odataQuery<User>().select('id', 'email')
  type UserResponse = typeof query.type
  
  return http.get<UserResponse>(`/Users?${query.toString()}`)
}

// The return type is automatically inferred as Promise<Pick<User, 'id' | 'email'>[]>
```

### With Computed Fields

```ts
function getUserWithDisplayName() {
  const query = odataQuery<User>()
    .compute(c => c.firstName.concat(' ', c.lastName).as('fullName'))
    .select('id', 'email', 'fullName')
  
  type UserResponse = typeof query.type
  // Type: Pick<User & { fullName: string }, 'id' | 'email' | 'fullName'>
  
  return http.get<UserResponse>(`/Users?${query.toString()}`)
}
```

### Complex Queries

```ts
interface Product {
  id: number
  name: string
  price: number
  category: string
  inStock: boolean
}

function getProductSummary() {
  const query = odataQuery<Product>()
    .compute(c => c.price.multiply(0.9).as('discountedPrice'))
    .compute(c => c.name.concat(' (', c.category, ')').as('displayName'))
    .filter(p => p.inStock.equals(true))
    .select('id', 'displayName', 'discountedPrice')
    .orderBy('displayName')
  
  type ProductSummary = typeof query.type
  // Type: Pick<Product & { discountedPrice: number, displayName: string }, 'id' | 'displayName' | 'discountedPrice'>
  
  return http.get<ProductSummary>(`/Products?${query.toString()}`)
}
```

## How It Works

The `type` property uses TypeScript's type system to track transformations through the fluent interface:

1. **Select Operations**: Creates a `Pick<T, selected_keys>` type containing only the selected properties
2. **Compute Operations**: Adds computed fields with their inferred types to the result type
3. **Other Operations**: Filter, orderBy, etc. don't change the result type, only the data returned

## Type Transformations

### No Select (Full Object)

```ts
const query = odataQuery<User>()
  .filter(u => u.isActive.equals(true))

type Result = typeof query.type // User (full object)
```

### With Select

```ts
const query = odataQuery<User>()
  .select('id', 'name')

type Result = typeof query.type // Pick<User, 'id' | 'name'>
```

### With Compute Only

```ts
const query = odataQuery<User>()
  .compute(c => c.firstName.concat(' ', c.lastName).as('fullName'))

type Result = typeof query.type // User & { fullName: string }
```

### Select + Compute

```ts
const query = odataQuery<User>()
  .compute(c => c.score.multiply(100).as('percentage'))
  .select('id', 'name', 'percentage')

type Result = typeof query.type // Pick<User & { percentage: number }, 'id' | 'name' | 'percentage'>
```

## Benefits

1. **Type Safety**: Ensures your code matches what the API actually returns
2. **IntelliSense**: Get autocomplete for only the fields that will be returned
3. **Refactoring Safety**: Changes to queries automatically update dependent types
4. **Documentation**: Types serve as documentation for what each query returns

## Best Practices

### Use in Service Functions

```ts
class UserService {
  async getActiveUsers() {
    const query = odataQuery<User>()
      .filter(u => u.isActive.equals(true))
      .select('id', 'email', 'name')
    
    type ActiveUser = typeof query.type
    
    const response = await this.http.get<ActiveUser[]>(`/Users?${query.toString()}`)
    return response.data
  }
}
```

### Create Type Aliases

```ts
// Define common query result types
const userSummaryQuery = odataQuery<User>().select('id', 'name', 'email')
export type UserSummary = typeof userSummaryQuery.type

const userDetailQuery = odataQuery<User>()
  .compute(c => c.firstName.concat(' ', c.lastName).as('displayName'))
  .select('id', 'email', 'displayName', 'isActive')
export type UserDetail = typeof userDetailQuery.type
```

## Limitations

- Currently supports select and compute operations
- Expand type inference is simplified and returns the full expanded object
- Complex nested selects within expands are not yet fully supported

Future versions will expand type inference to cover more advanced scenarios including complex expand operations and aggregate functions. 