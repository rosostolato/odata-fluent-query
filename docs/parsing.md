# Parsing Query Strings with `fromString`

The `fromString()` static method allows you to parse existing OData query strings back into query objects. This is useful for working with URLs, bookmarks, or any scenario where you need to parse an existing query string.

## Basic Usage

```ts
import { odataQuery } from 'odata-fluent-query'

// Parse a simple query string
const query = odataQuery.fromString<User>("$filter=id eq 1&$select=name,email")

console.log(query.toString())
// Result: $filter=id eq 1&$select=name,email

// Convert to object format
console.log(query.toObject())
// Result: { $filter: "id eq 1", $select: "name,email" }
```

## Supported Query Parameters

The `fromString()` method supports all OData query parameters:

```ts
// All supported parameters
const queryString = "$filter=isActive eq true&$select=id,name,email&$orderby=name desc&$expand=posts($select=title)&$skip=10&$top=5&$count=true&$compute=firstName concat lastName as fullName"

const query = odataQuery.fromString<User>(queryString)

// The parsed query can be further modified
const modifiedQuery = query
  .filter(u => u.email.contains('@company.com'))  // Add additional filter
  .orderBy(u => u.id)                             // Change ordering
  .toString()
```

## Complex Queries with Expand

```ts
// Parse nested expand queries
const complexQuery = odataQuery.fromString<User>(
  "$expand=posts($select=title,content;$filter=isPublished eq true;$orderby=publishDate desc)&$select=id,name"
)

// Continue building the query
complexQuery
  .expand('address', q => q.select('street', 'city'))
  .filter(u => u.isActive.equals(true))
  .toString()
```

## Working with Encoded Query Strings

```ts
// Handle URL-encoded query strings
const encodedQuery = "$filter=name%20eq%20'John%20Doe'&$select=id,email"
const query = odataQuery.fromString<User>(encodedQuery)

console.log(query.toString())
// Result: $filter=name eq 'John Doe'&$select=id,email
```

## Round-trip Compatibility

```ts
// Perfect round-trip compatibility
const originalQuery = odataQuery<User>()
  .filter(u => u.isActive.equals(true))
  .select('id', 'name', 'email')
  .orderBy(u => u.name)
  .toString()

const parsedQuery = odataQuery.fromString<User>(originalQuery)

console.log(parsedQuery.toString() === originalQuery)
// Result: true (functionally equivalent, parameter order follows OData spec)
```

## Error Handling

The `fromString()` method is designed to be robust and handle malformed input gracefully:

```ts
// Handles empty or invalid input gracefully
const emptyQuery = odataQuery.fromString<User>("")
console.log(emptyQuery.toString())
// Result: "" (empty query)

// Skips invalid parameters
const partiallyInvalid = odataQuery.fromString<User>("$filter=id eq 1&invalid=ignored&$select=name")
console.log(partiallyInvalid.toString())
// Result: "$filter=id eq 1&$select=name" (invalid parameter ignored)
```

## Use Cases

The `fromString()` method is particularly useful for:

- **URL parsing**: Extract query parameters from browser URLs
- **API integration**: Parse queries from external systems
- **Query modification**: Start with an existing query and modify it
- **Testing**: Create test queries from string representations
- **Bookmarking**: Save and restore query states
- **Data serialization**: Convert between query strings and JSON objects using `toObject()`

```ts
// Example: Parse URL query parameters
const urlParams = new URLSearchParams(window.location.search)
const odataQueryString = urlParams.get('$filter') + '&' + urlParams.get('$select')
const query = odataQuery.fromString<User>(odataQueryString)

// Use as query string
console.log(query.toString()) // For API requests

// Or convert to object for storage/transmission
const queryObject = query.toObject()
localStorage.setItem('savedQuery', JSON.stringify(queryObject))
``` 