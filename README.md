# odata-fluent-query

**Clientside queries with extensive filtering and typesafe joins**

## Version 2.0.0 is out!

`ODataQuery` class now is a function written in lowercase `odataQuery` and it's not necessary to instantiate it anymore. This is basically the changes but it is a break change and might break your code if you don't refactor. Another change is that now queries are imutable, so every method will return a new instance.

```ts
new ODataQuery<T>() => odataQuery<T>()
```

This lib only generates the query string, so you need to use it with your own implementation of http request. There is no need to scaffold any pre build model.

- [Filtering with `Filter`](#filtering-with-filter)
- [Ordering with `orderBy`](#ordering-with-orderby)
- [Selecting with `select`](#selecting-properties-with-select)
- [Expanding with `expand`](#expanding-with-expand)
- [Development](#development)

## Filtering with `filter`

Every query exposes a method called `filter`. This method accepts a function as parameter that builds an expersion. For example:

```ts
import { odataQuery } from 'odata-fluent-query'

const query = odataQuery<User>()
  .filter(u => u.id.equals(1))
  .toString()

//$filter=id eq 1
```

Note that the parameter `u` is not of type `User`, but of the type `FilterBuider<User>`. The `FilterBuider` type is a very special and important type. It exposes for every property of the type `T` a `Filterbuilder` of that actual property. The FilterBuilders of the primitive types do expose the methods that return an instance of IFilterExpression.

```ts
export type FilterBuider<T> = {
  [P in keyof T]: FilterBuilderTyped<T[P]>
}
```

_The FilterBuider type from the sourcecode_

The `IFilterExpression` class exposes an API to alter and combine the existing expresion. Those are `not()`, `and()` and `or()`. For example:

```ts
.filter(u => u.username.contains('dave').not()) //where the username doest not contain dave

.filter(u => u.emailActivaed.equals(true).and(u.username.contains('dave')))
```

Calling `filter` multiple times on a query will merge the experions in a bigger expersion via the `and` operator. In this example you will get the users where `the id is not equal to 1 AND the username start with 'harry'`.

```ts
import { odataQuery } from 'odata-fluent-query'

const query = odataQuery<User>()
  .filter(u => u.id.notEquals(1))
  .filter(u => u.username.startsWith('Harry'))
  .toString()

//$filter=id eq 1 and startswith(username, 'Harry')
```

<!-- See [FILTER_BUILDER_API.md](./FILTER_BUILDER_API.md) for a complete list of all filteroperators -->

More examples:

```ts
.filter(u => not(u.id.equals(1))) //where the id is not 1

.filter(u => u.id.equals(1).and(
  u.username.startsWith('Harry') //where the id is 1 AND the username starts with 'harry'
)))

.filter(u => u.id.equals(1).and(
  u.username.startsWith('Harry') //where the id is 1 OR the username starts with 'harry'
)))

.filter(u => u.email.startswith(u.name)) //You can also use properties of the same type instead of just values
```

You can also use key selector passing the property key at the first parameter:

```ts
.filter('id', id => id.equals(1))
```

## Selecting properties with `select`

`select` is used to select a set of properties of your model:

```ts
import { odataQuery } from 'odata-fluent-query'

odataQuery<User>().select('id', 'username')
```

## Ordering with `orderBy`

`orderby` is used to order the result of your query. This method accepts a lamda to that return the property on witch you want to order.

```ts
new OQueryData<User>().orderBy(u => u.id)
```

It is posible to order on relations:

```ts
new OQueryData<User>().select('username').orderBy(u => u.address.city)
```

You can set the order mode by calling `Desc` or `Asc`.

```ts
new OQueryData<User>().orderBy(u => u.id.desc())
```

You can also `orderBy` with key string.

```ts
new OQueryData<User>().orderBy('id', 'desc')
```

## Expanding with `expand`

`expand` is used to load the relationships of the model within the current query. This query can be used to filter, expand and select on the relation you are including.

```ts
import { odataQuery } from 'odata-fluent-query'

const query = odataQuery<User>()
  .expand('blogs', q =>
    q.select('id', 'title').filter(b => b.public.equals(true))
  )
  .toString()

//$expand=blogs($select=id,title;$filter=public eq true)
```

_all the query methods are available inside an Expand call_

```ts
import { odataQuery } from 'odata-fluent-query'

const query = odataQuery<User>()
  .expand('blogs', q =>
    q
      .select('id', 'title')
      .filter(b => b.public.equals(true))
      .orderBy('id')
      .paginate(0, 10)
  )
  .toString()

//$expand=blogs($skip=0;$top=10;$orderby=id;$select=id,title;$filter=public eq true)
```

_it is posible to nest Expand calls inside each other_

```ts
import { odataQuery } from "odata-fluent-query";

const query = odataQuery<User>()
  .expand('blogs', q => q
    .select('id', 'title')
    .expand('reactions' q => q.select('id', 'title')
  ))
  .toString();

//$expand=blogs($select=id,title;$expand=reactions($select=id,title))
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
