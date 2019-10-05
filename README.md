# odata-fluent-query

This is a fork of [typescript-odata-client](https://www.npmjs.com/package/typescript-odata-client)

The difference is that this lib only generates the query string, so you can use it with your own implementation of http request.
And there is no need to scaffold any pre build model, this one uses the function string to get property keys.

> **WARNING**: needs more testigs, still under development. Please be free to contribute on github.

**Clientside queries with extensive filtering and typesafe joins**

* [Development](#development)
* [Filtering with `Filter`](#filtering-with-filter)
* [Expanding with `expand`](#expanding-with-expand)
* [Selecting properties with `select`](#selecting-properties-with-select)
* [Ordering with `orderBy`](#ordering-with-orderby)

<!-- > See also the [examples](./EXAMPLES.md) to see the library in action

> Looking for all the filteroperators? They are listed [here](./FILTER_BUILDER_API.md) -->

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

## Filtering with `filter`

Every query exposes a method called `filter`. This method accepts a function as parameter that builds an expersion. For example:

```ts
import { OQuery } as QueryContext from "odata-fluent-query";

const query = new OQuery<User>()
  .filter(u => u.id.equals(1))
  .toString();

// $filter=(id eq 1)
```

Note that the parameter `u` is not of type `User`, but of the type `FilterBuiderComplex<User>`. The `FilterBuiderComplex` type is a very special and important type. It exposes for every property of the type `T` a `Filterbuilder` of that actual property. The FilterBuilders of the primitive types do expose the methods that return an instance of FilterExpersion.

```ts
export type FilterBuiderComplex<T extends object> = {
  [P in keyof T]: FilterBuider<T[P]>
}
```
*the FilterBuiderComplex type from the sourcecode*

The `FilterExpersion` class exposes an API to alter and combine the existing expresion. Those are `not()`, `and()` and `or()`. For example:

```ts
.filter(u => u.username.contains('dave').not()) //where the username doest not contain dave

.filter(u => u.emailActivaed.equals(true).and(u.username.contains('dave')))
```

Calling `filter` multiple times on a query will merge the experions in a bigger expersion via the `and` operator. In this example you will get the users where `the id is not equal to 1 AND the username start with 'harry'`.

```ts
import { OQuery } as QueryContext from "odata-fluent-query";

const query = new OQuery<User>()
  .filter(u => u.id.notEquals(1))
  .filter(u => u.username.startsWith('Harry'))
  .toString()

// $filter=(id eq 1) and (startswith(username, 'Harry'))
```

<!-- See [FILTER_BUILDER_API.md](./FILTER_BUILDER_API.md) for a complete list of all filteroperators -->

More examples:
```ts
.filter(u => not(u.id.equals(1))) // where the id is not 1

.filter(u => u.id.equals(1).and(
  u.username.startsWith('Harry') // where the id is 1 AND the username starts with 'harry'
)))                                     

.filter(u => u.id.equals(1).and(
  u.username.startsWith('Harry') // where the id is 1 OR the username starts with 'harry'
)))                                     

.filter(u => u.email.startswith(u.name)) // You can also use properties of the same type instead of just values
```

You can also select the key with a string at the first parameter:
```ts
.filter('id', id => id.equals(1))
```

## Expanding with `expand`

`expand` is used to load the relationships of the model within the current query. This query can be used to filter, expand and select on the relation you are including.

```ts
import { OQuery } as QueryContext from "odata-fluent-query";

const query = new OQuery<User>()
  .expand('blogs', q => q
    .select('id', 'title')
    .filter(b => b.public.equals(true))
  )
  .toString();
  
// $expand=blogs($select=id,title;$filter=(public eq true))
```

_all the query methods are available inside an Expand call_
```ts
import { OQuery } from "odata-fluent-query";

const query = new OQuery<User>()
  .expand('blogs', q => q
    .select('id', 'title')
    .filter(b => b.public.equals(true))
    .orderBy('id')
    .paginate(0, 10)
  )
  .toString();

// $expand=blogs($skip=0;$top=10;$orderby=id;$select=id,title;$filter=(public eq true))
```

_it is posible to nest Expand calls inside each other_
```ts
import { OQuery } from "odata-fluent-query";

const query = new OQuery<User>()
  .expand('blogs', q => q
    .select('id', 'title')
    .expand('reactions' q => q
      .select('id', 'title')
  ))
  .toString();

// $expand=blogs($select=id,title;$expand=reactions($select=id,title))
```

<!-- There is also an `ExpandStrict` method to expand a relationship in the strict modus (with `$expand=rel!(...)`). -->

## Selecting properties with `select`

`select` is used to select a set of properties of your model:
```ts
import { OQuery } from "odata-fluent-query";

new OQuery<Query>().select('id', 'Username');
```

## Ordering with `orderBy`

`orderby` is used to order the result of your query. This method accepts a lamda to that return the property on witch you want to order.
```ts
new OData().orderBy(l => l.id)
```
<!-- It is posible to order on relations:
```ts
new OData()
  .select('title')
  .orderBy(l => l.teachingActivities.position)
``` -->
You can set the order mode by calling `Desc` or `Asc`.
```ts
new OData().orderBy(l => l.id.desc())
```  
You can also `orderBy` with key string.
```ts
new OData().orderBy('id', 'desc')
```