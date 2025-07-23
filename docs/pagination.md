# Paginating with `paginate`

`paginate` applies `$top`, `$skip` and `$count` automatically.

```ts
import { odataQuery } from 'odata-fluent-query'

odataQuery<User>().paginate(10).toString()

// result: $top=10&$count=true
```

Skip and top with page-based pagination.

```ts
import { odataQuery } from 'odata-fluent-query'

odataQuery<User>().paginate(25, 5).toString()

// result: $skip=125&$top=25&$count=true
```

Using object and setting `count` to false.

```ts
import { odataQuery } from 'odata-fluent-query'

odataQuery<User>().paginate({ page: 5, pagesize: 25, count: false }).toString()

// result: $skip=125&$top=25
``` 