# Grouping with `groupBy`

`groupBy` uses odata `$apply` method to group data by property with optional aggregations.

```ts
import { odataQuery } from 'odata-fluent-query'

odataQuery<User>().groupBy(['email']).toString()

// result: $apply=groupby((email))
```

It's posible to apply custom aggregations.

```ts
import { odataQuery } from 'odata-fluent-query'

odataQuery<User>()
  .groupBy(['email', 'surname'], a =>
    a.countdistinct('id', 'all').max('phoneNumbers', 'test')
  )
  .toString()

// result: $apply=groupby((email, surname), aggregate(id with countdistinct as all, phoneNumbers with max as test))
```

Available aggregation functions:
- `sum(property, alias)` - Sum of values
- `min(property, alias)` - Minimum value
- `max(property, alias)` - Maximum value  
- `average(property, alias)` - Average value
- `countdistinct(property, alias)` - Count distinct values
- `custom(property, aggregation, alias)` - Custom aggregation 