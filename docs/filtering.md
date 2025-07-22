# Filtering with `filter`

Every query exposes a method called `filter`. This method accepts a function as parameter that builds an expression.

```ts
import { odataQuery } from 'odata-fluent-query'

odataQuery<User>()
  .filter(u => u.id.equals(1))
  .toString()

// result: $filter=id eq 1
```

Note that the parameter `u` is not a `User` type but `FilterBuider<User>`. The `FilterBuider` will exposes all properties from `T` as `FilterBuilderType` to provide all filter functions based on its property type which can be:
- `FilterCollection`
- `FilterString`
- `FilterNumber`
- `FilterBoolean`
- `FilterDate`
- `FilterBuilder`

Check out all the available methods [here](https://github.com/rosostolato/odata-fluent-query/blob/master/src/models/query-filter.ts).

```ts
export type FilterBuider<T> = {
  [P in keyof T]: FilterBuilderType<T[P]>
}
```

You can modify/combine expressions using `not()`, `and()` and `or()`.

```ts
.filter(u => u.username.contains('dave').not()) // where the username doest not contain dave

.filter(u => u.emailActivaed.equals(true).and(u.username.contains('dave')))
```

Calling `filter` multiple times will merge the expression in a bigger expression using the `and` operator. In this example you will get the users where "the id is not equal to 1 AND the username start with 'harry'".

```ts
import { odataQuery } from 'odata-fluent-query'

odataQuery<User>()
  .filter(u => u.id.notEquals(1))
  .filter(u => u.username.startsWith('Harry'))
  .toString()

// result: $filter=id ne 1 and startswith(username, 'Harry')
```

More filter examples:

```ts
odataQuery<User>().filter(u => u.id.equals(1).not()) // where the id is not 1

// result: $filter=not (id eq 1)

odataQuery<User>().filter(u => u.id.equals(1).and(
  u.username.startsWith('Harry') // where the id is 1 AND the username starts with 'harry'
))

// result: $filter=id eq 1 and startswith(username, 'Harry')

odataQuery<User>().filter(u => u.id.equals(1).or(
  u.username.startsWith('Harry') // where the id is 1 OR the username starts with 'harry'
))

// result: $filter=id eq 1 or startswith(username, 'Harry')

odataQuery<User>().filter(u => u.email.startsWith(u.name)) // You can also use properties of the same type instead of just values

// result: $filter=startswith(email, name)
```

You can also use "key selector" passing the property key at the first parameter.

```ts
odataQuery<User>().filter('id', id => id.equals(1))

// result: $filter=id eq 1
``` 