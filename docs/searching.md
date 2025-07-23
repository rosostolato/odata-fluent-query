# Searching with `search`

The `search` method implements the OData `$search` system query option, which allows full-text search across multiple properties of your entities. Unlike `filter`, which requires exact field matching, `search` provides more flexible text-based searching.

> **📋 Server Support**: The `$search` feature requires server-side implementation. Many OData servers support `$search`, but the exact search behavior depends on your server's search binder implementation.

## Basic Search Operations

The `search` method provides a simple, unified API using the `token()` method that automatically handles quoting based on the content, as OData spec requires search tokens with non-alpha characters to be wrapped in quotes:

```ts
import { odataQuery } from 'odata-fluent-query'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  isActive: boolean
}

// Simple text search (unquoted)
odataQuery<User>()
  .search(s => s.token('John'))
  .toString()

// result: $search=John

// Non-alpha search (quoted)
odataQuery<User>()
  .search(s => s.token('2022'))
  .toString()

// result: $search="2022"
```

## The `token()` Method

The `token()` method automatically determines whether quotes are needed based on the content:

```ts
// Simple text - no quotes
odataQuery<User>().search(s => s.token('technology'))
// result: $search=technology

// Numbers - automatically quoted
odataQuery<User>().search(s => s.token(2023))
// result: $search="2023"

// Special characters - automatically quoted
odataQuery<User>().search(s => s.token('user@domain.com'))
// result: $search="user@domain.com"
```

## Logical Operators

```ts
// AND operations with automatic quoting
odataQuery<User>()
  .search(s => s.token('bike').and('mountain'))
  .toString()
// result: $search=bike AND mountain

odataQuery<User>()
  .search(s => s.token('bike').and(2023))
  .toString()
// result: $search=bike AND "2023"

// OR operations
odataQuery<User>()
  .search(s => s.token('bike').or('car'))
  .toString()
// result: $search=bike OR car

// NOT operations
odataQuery<User>()
  .search(s => s.token('electronics').not())
  .toString()
// result: $search=NOT electronics
```

Search expressions support **proper OData precedence**: `Grouping → NOT → AND → OR`

```ts
// Mix simple text and quoted values
odataQuery<User>()
  .search(s => s.token('bike').and('mountain').or(2023))
  .toString()
// result: $search=bike AND mountain OR "2023"
```

## Combining Search with Other Query Options

```ts
// Search + Filter + Select
odataQuery<User>()
  .search(s => s.token('John'))
  .filter(u => u.isActive.equals(true))
  .select('id', 'email')
  .toString()
// result: $search=John&$filter=isActive eq true&$select=id,email
```

## Search in Expand Operations

```ts
// Search within expanded posts
odataQuery<User>()
  .expand('posts', q => q
    .search(s => s.token('OData'))
    .select('id', 'title')
  )
  .toString()
// result: $expand=posts($search=OData&$select=id,title)
```