# odata-fluent-query

> **A modern, type-safe OData query builder for TypeScript/JavaScript**

![npm version](https://badge.fury.io/js/odata-fluent-query.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue)
![Node](https://img.shields.io/badge/Node-18+-green)
![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen)

✨ **Version 3.0** - Fully modernized and production-ready

**Client side queries with extensive filtering and typesafe joins**

This lib only generates the query string, so you need to use it with your own implementation of http request. There is no need to scaffold any pre build model.

## Features

- 🎯 **Full TypeScript support** with built-in type definitions
- 🔒 **Type-safe queries** with IntelliSense support
- 🚀 **Modern ES2022** target for optimal performance
- ✅ **100% test coverage** with 282 comprehensive tests
- 📦 **Minimal dependencies** with only validator as a runtime dependency
- 🔧 **Fluent API** for readable query building
- 🔄 **Parse existing query strings** with `fromString()` method

## Installation

```bash
npm install odata-fluent-query
```

**Requirements:**
- Node.js 18+
- TypeScript 5.0+ (optional, but recommended)

## TypeScript Support

This package includes built-in TypeScript definitions and provides full type safety:

```ts
interface User {
  id: number
  email: string
  isActive: boolean
  posts: Post[]
}

// Full intellisense and type checking
const query = odataQuery<User>()
  .filter(u => u.email.contains('test'))  // ✅ Type-safe
  .select('id', 'email')                  // ✅ Only valid properties
  .orderBy(u => u.isActive)               // ✅ Correct types
  .toString()

// Result: "$filter=contains(email,'test')&$select=id,email&$orderby=isActive"
```

## Quick Start

```ts
import { odataQuery } from 'odata-fluent-query'

// Simple filter
const query = odataQuery<User>()
  .filter(u => u.id.equals(1))
  .toString()
// Result: $filter=id eq 1

// Complex query with multiple operations
const complexQuery = odataQuery<User>()
  .select('id', 'email', 'username')
  .filter(u => u.isActive.equals(true).and(u.email.contains('@company.com')))
  .orderBy(u => u.username)
  .paginate(10, 0)
  .toString()
```

## Documentation

### Core Features

- **[Filtering](docs/filtering.md)** - Advanced filtering with type-safe expressions
- **[Selecting](docs/selecting.md)** - Choose specific properties to return
- **[Ordering](docs/ordering.md)** - Sort results with complex ordering rules
- **[Expanding](docs/expanding.md)** - Include related data with nested queries
- **[Computing](docs/computing.md)** - Create computed properties with type safety
- **[Searching](docs/searching.md)** - Full-text search with automatic quoting
- **[Grouping](docs/grouping.md)** - Group data with aggregations
- **[Pagination](docs/pagination.md)** - Handle large datasets with pagination
- **[Parsing](docs/parsing.md)** - Parse existing query strings back to objects

## Development

**Requirements:**
- Node.js 18+
- npm 8+

**Setup:**
```bash
npm install
```

**Build:**
```bash
npm run build        # Build the project
npm run build:watch  # Build in watch mode
```

**Testing:**
```bash
npm test                # Run tests
npm run test:coverage   # Run with coverage report
npm run test:watch      # Run tests in watch mode
npm run test:debug      # Debug tests
```

**Code Quality:**
```bash
npm run lint           # Check code style
npm run lint:fix       # Auto-fix linting issues
npm run ci             # Full CI check (build + test + coverage)
```

**Publishing:**
```bash
npm run ci             # Verify everything works
npm publish            # Publish to npm (runs CI automatically)
```

The output files will be placed in the `dist` directory. This project contains comprehensive unit tests using `jest` and `ts-jest`. 

After running tests with coverage, you can open `coverage/lcov-report/index.html` in your browser to see detailed coverage reports.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm run ci`)
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

MIT - see [LICENSE](LICENSE) file for details.
