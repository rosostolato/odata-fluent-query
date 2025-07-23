# Selecting properties with `select`

`select` is used to select a set of properties of your model:

```ts
import { odataQuery } from 'odata-fluent-query'

odataQuery<User>().select('id', 'username')

// result: $select=id,username
``` 