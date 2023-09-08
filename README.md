# odata-fluent-query

**Client side queries with extensive filtering and typesafe joins**

This lib only generates the query string, so you need to use it with your own implementation of http request. There is no need to scaffold any pre build model.

- [Filtering with `filter`](#filtering-with-filter)
- [Ordering with `orderBy`](#ordering-with-orderby)
- [Selecting with `select`](#selecting-properties-with-select)
- [Expanding with `expand`](#expanding-with-expand)
- [Expanding with `groupBy`](#grouping-with-groupBy)
- [Paginating with `paginate`](#paginating-with-paginate)
- [Development](#development)

## Filtering with `filter`

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
.filter(u => u.username.contains('dave').not()) //where the username doest not contain dave

.filter(u => u.emailActivaed.equals(true).and(u.username.contains('dave')))
```

Calling `filter` multiple times will merge the expression in a bigger expression using the `and` operator. In this example you will get the users where "the id is not equal to 1 AND the username start with 'harry'".

```ts
import { odataQuery } from 'odata-fluent-query'

odataQuery<User>()
  .filter(u => u.id.notEquals(1))
  .filter(u => u.username.startsWith('Harry'))
  .toString()

// result: $filter=id eq 1 and startswith(username, 'Harry')
```

More filter examples:

```ts
odataQuery<User>().filter(u => not(u.id.equals(1))) //where the id is not 1

// result: $filter=id ne 1

odataQuery<User>().filter(u => u.id.equals(1).and(
  u.username.startsWith('Harry') //where the id is 1 AND the username starts with 'harry'
)))

// result: $filter=id eq 1 and startswith(username, 'harry')

odataQuery<User>().filter(u => u.id.equals(1).or(
  u.username.startsWith('Harry') //where the id is 1 OR the username starts with 'harry'
)))

// result: $filter=id eq 1 or startswith(username, 'harry')

odataQuery<User>().filter(u => u.email.startswith(u.name)) //You can also use properties of the same type instead of just values

// result: $filter=startswith(email, name)
```

You can also use "key selector" passing the property key at the first parameter.

```ts
odataQuery<User>().filter('id', id => id.equals(1))

// result: $filter=id eq 1
```

## Selecting properties with `select`

`select` is used to select a set of properties of your model:

```ts
import { odataQuery } from 'odata-fluent-query'

odataQuery<User>().select('id', 'username')

// result: $select=id,username
```

## Ordering with `orderBy`

`orderby` is used to order the result of your query. This method accepts a function that returns the property you want to order by.

```ts
odataQuery<User>().orderBy(u => u.id)

// result: $orderby=id
```

It is possible to order on relations:

```ts
odataQuery<User>()
  .select('username')
  .orderBy(u => u.address.city)

// result: $select=username;$orderby=address/city
```

You can set the order mode by calling `Desc` or `Asc`.

```ts
odataQuery<User>().orderBy(u => u.id.desc())

// result: $orderby=id desc
```

You can also `orderBy` with key string.

```ts
odataQuery<User>().orderBy('id', 'desc')

// result: $orderby=id desc
```

## Expanding with `expand`

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
      .paginate(0, 10)
  )
  .toString()

// result: $expand=blogs($skip=0;$top=10;$orderby=id;$select=id,title;$filter=public eq true)
```

It's possible to nest "expand" calls inside each other.

```ts
import { odataQuery } from "odata-fluent-query";

odataQuery<User>()
  .expand('blogs', q => q
    .select('id', 'title')
    .expand('reactions' q => q.select('id', 'title')
  ))
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

## Grouping with `groupBy`

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

## Paginating with `paginate`

`paginate` applies `$top`, `$skip` and `$count` automatically.

```ts
import { odataQuery } from 'odata-fluent-query'

odataQuery<User>().paginate(10).toString()

// result: $top=10&$count=true
```

Skip and top.

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

## Development

Dependencies are managed by using `npm`. To install all the dependencies run:

```sh
npm
```

To build the project run:

```sh
npm build
```

The output files will be placed in the `build` directory. This project contains unittest using `jest` and `ts-jest`. They are placed in the `test` directory. To run all the test run:

```sh
npm run test
```

After this you can open `coverage/lcov-report/index.html` in your browser to see all the details about you tests. To publish the package you can run:

```sh
npm publish
```
