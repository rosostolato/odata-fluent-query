# Expanding with `expand`

`expand` is used to load the relationships of the model within the current query. This query can be used to filter, expand and select on the relation you are including.

```ts
import { odataQuery } from 'odata-fluent-query'

odataQuery<User>()
  .expand('blogs') // or .expand(u => u.blogs)
  .toString()

// result: $expand=blogs
```

All the query methods are available inside an "expand" call.

```ts
import { odataQuery } from 'odata-fluent-query'

odataQuery<User>()
  .expand('blogs', q =>
    q
      .select('id', 'title')
      .filter(b => b.public.equals(true))
      .orderBy('id')
      .paginate(10, 0)
  )
  .toString()

// result: $expand=blogs($top=10;$count=true;$orderby=id;$select=id,title;$filter=public eq true)
```

It's possible to nest "expand" calls inside each other.

```ts
import { odataQuery } from 'odata-fluent-query'

odataQuery<User>()
  .expand('blogs', q => q
    .select('id', 'title')
    .expand('reactions', q => q.select('id', 'title'))
  )
  .toString()

// result: $expand=blogs($select=id,title;$expand=reactions($select=id,title))
```

Key getters can easily get to deeper levels.

```ts
odataQuery<User>()
  .expand(
    u => u.blogs.reactions,
    q => q.select('id', 'title')
  )
  .toString()

// result: $expand=blogs/reactions($select=id,title)
```

## Navigation Properties vs Complex Types

In OData and this library, there's an important distinction between **navigation properties** and **complex types**:

### Complex Types (Always Included)

Complex types are embedded objects that are stored in the same database table and are always returned:

```ts
interface User {
  id: number
  email: string
  address: {
    // Complex type - always included
    street: string
    city: string
    zipCode: string
  }
  preferences: {
    // Complex type - always included
    theme: string
    notifications: boolean
  }
}
```

### Navigation Properties (Require `expand`)

Navigation properties are related entities stored in separate tables that require explicit `$expand` to include:

```ts
interface User {
  id: number
  email: string
  // Navigation properties (optional in TypeScript)
  orders?: Order[] // Requires .expand('orders')
  manager?: User // Requires .expand('manager')
  department?: Dept // Requires .expand('department')
}
```

**TypeScript Pattern**: Is recommended to use optional properties (`?`) for navigation properties to indicate they're only included when expanded.
