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
import { odataQuery } from "odata-fluent-query";

odataQuery<User>()
  .expand('blogs', q => q
    .select('id', 'title')
    .expand('reactions', q => q.select('id', 'title'))
  )
  .toString();

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