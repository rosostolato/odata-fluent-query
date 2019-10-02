# odata-fluent-query

This is a fork of [typescript-odata-client](https://www.npmjs.com/package/typescript-odata-client)

The only difference is that this lib only generates the query string, so you can use it with your own implementation of http request.

**Clientside queries with extensive filtering and typesafe joins**

* [Development](#development)
* [Generating the QueryContext](#generating-the-querycontext)
* [Using the QueryContext](#using-the-querycontext)
* [Filtering with `Filter`](#filtering-with-filter)
* [Expanding with `Expand`](#expanding-with-expand)
* [Selecting properties with `Select`](#selecting-properties-with-select)
* [Ordering with `OrderBy`](#ordering-with-orderby)
* [Executing queries](#executing-queries)

> See also the [examples](./EXAMPLES.md) to see the library in action

> Looking for all the filteroperators? They are listed [here](./FILTER_BUILDER_API.md)

## Development

Dependencies are managed by using `yarn`. To install all the dependencies run:
```sh
yarn
```
To build the project run:
```sh
yarn build
```
The output files will be placed in the `build` directory. This project contains unittest using `jest` and `ts-jest`. They are placed in the `__test__` directory. To run all the test run:
```sh
yarn test
```
After this you can open `coverage/lcov-report/index.html` in your browser to see all the details about you tests. To publish the package you can run:
```sh
npm publish
```

## Generating the QueryContext

The querycontext can be generated with the [`ts-odata-scaffolder`](https://github.com/hoppinger/ts-odata-scaffolder). It has its own repo and readme.

## Using the QueryContext

```ts
import * as QueryContext from "./query_context"
```

The querycontext contains all the information about your Odata endpoint. This includes:
- The models of the backend
- The relationships between those types
- The available entitysets

A entityset is an entrypoint of the odata endpoint, those are the things that you use to start quering. The QueryContext exports them as `[Modelname]Query`. Those queries expose an api to build complex queries using the wellknow method like `Filter`, `Expand`, `Paginate`, etc. 

You should always call `Select` first on a query (it is also the only option typescript will let you pick). After this you get a `SelectedQuery` wich exposes all the other querybuilding methods. The `RelationQuery` and `SelectedRelationQuery` work in the same way. Those different queryclasses are a represatation of the different states a query goes through. 

```ts
import * as QueryContext from "./query_context"
QueryContext.UserQuery().Select('Id', 'UserName').ToList()
```

This query will give you a list with all the users. 

## Filtering with `Filter`

Every query exposes a method called `Filter`. This method accepts a function as parameter that builds an expersion. For example:

```ts
import * as QueryContext from "./query_context"
QueryContext.UserQuery()
  .Filter(u => u.Id.Equals(1))
  .First()
```

Note that the parameter `u` is not of type `User`, but of the type `FilterBuiderComplex<User>`. The `FilterBuiderComplex` type is a very special and important type. It exposes for every property of the type `T` a `Filterbuilder` of that actual property. The FilterBuilders of the primitive types do expose the methods that return an instance of FilterExpersion.

```ts
export type FilterBuiderComplex<T extends object> = {
  [P in keyof T]: FilterBuider<T[P]>
}
```
*the FilterBuiderComplex type from the sourcecode*

The `FilterExpersion` class exposes an API to alter and combine the existing expresion. Those are `Not()`, `And()` and `Or()`. For example:

```ts
.Filter(u => u.Username.Contains('dave').Not()) //where the username doest not contain dave

.Filter(u => u.EmailActivaed.Equals(true).And(u.Username.Contains('dave')))
```

Calling `Filter` multiple times on a query will merge the experions in a bigger expersion via the `and` operator. In this example you will get the users where `the id is not equal to 1 AND the username start with 'harry'`.

```ts
import * as QueryContext from "./query_context"
QueryContext.UserQuery()
  .Filter(u => u.Id.NotEquals(1))
  .Filter(u => u.Username.StartsWith('Harry'))
  .ToList()
```

See [FILTER_BUILDER_API.md](./FILTER_BUILDER_API.md) for a complete list of all filteroperators

More examples:
```ts
.Filter(u => Not(u.Id.Equals(1)))        // where the Id is not 1

.Filter(u => 
    u.Id.Equals(1)
  .And(
    u.Username.StartsWith('Harry')
)))                                     // where the Id is 1 AND the username starts with 'harry'

.Filter(u =>
    u.Id.Equals(1)
  .And(
    u.Username.StartsWith('Harry')
)))                                     // where the Id is 1 OR the username starts with 'harry'

.Filter(u => u.Email.Startswith(u.Name)) // You can also use properties of the same type instead of just values
```

## Expanding with `Expand`

`Expand` is used to load the relationships of the model within the current query. `Expand` is called with the name of the relationship you want to include and a lambda`Query<UnBoxed<TheRelation>> => Query<UnBoxed<TheRelation>>`. This query can be used to filter, expand and select on the relation you are including. Just like the regular Query class, you have to first call `Select` to get a `SelectedQuery` before you have acces to all the other methods.

```ts
import * as QueryContext from "./query_context"
QueryContext.UserQuery()
  .Select('Id')
  .Expand('Blogs', q => q
    .Select('Id', 'Title')
    .Filter(b => b.Public.Equals(true))
  )
  // This is now a Query<User & { Blogs: Pick<Blog, 'Id', 'Title'>[] }>
```

_all the query methods are available inside an Expand call_
```ts
QueryContext.UserQuery()
  .Select('Id')
  .Expand('Blogs', q => q
    .Select('Id', 'Title')
    .Filter(b => b.Public.Equals(true))
    .OrderBy({props: 'Id'})
    .Paginate({ page: 0, pagesize: 10})
  )
```

_it is posible to nest Expand calls inside each other_
```ts
import * as QueryContext from "./query_context"
QueryContext.UserQuery()
  .Select('Id')
  .Expand('Blogs', q => q
    .Select('Id', 'Title')
    .Expand('Reactions' q => q
      .Select('Id', 'Title')
  ))
```

There is also an `ExpandStrict` method to expand a relationship in the strict modus (with `$expand=rel!(...)`).

## Selecting properties with `Select`

`Select` is used to select a set of properties of your model:
```ts
import * as QueryContext from "./query_context"
QueryContext.UserQuery()
  .Select('Id', 'Username')
  // This is now a Query<Pick<User, 'Id' | 'Username'>>
```

## Ordering with `OrderBy`

`Orderby` is used to order the result of your query. This method accepts a lamda to that return the property on witch you want to order.
```ts
QueryContext.LectureQuery()
  .Select('Title')
  .OrderBy(l => l.Id)
```
It is posible to order on relations:
```ts
QueryContext.LectureQuery()
  .Select('Title')
  .OrderBy(l => l.TeachingActivities().Position)
```
You can set the order mode by calling `Desc` or `Asc`.
```ts
QueryContext.LectureQuery()
  .Select('Title')
  .OrderBy(l => l.Id.Desc())
```  

## Executing queries

There are multiple ways to execute a query. You can use `ToList` to get a promise of an `Immutable.List` with all the results. There is also the `First` method witch will give you a promise with the first item. `First` will reject the promise is their was no item found. An other option is the `Paginate` method witch accepts an object with the page and pagesize. 
```ts
type PaginationParams = { page: number, pagesize: number }
```
`Paginate` return a Promise of `Page<Model>` witch contains all the info about the pagination:
```ts
type Page<M> = {
  pagesize: number
  page: number
  items: List<M>
  totalCount: number
  totalPages: number
}
```

`First`, `ToList` and `Paginate` all accept a parameter with options to run the query. It's type is the following:
```ts
type QueryContext = {
  QueryParams?: Map<string, string>
  Fetch?: (url: string) => Promise<Response>
  Debug?: boolean
}
```
QueryParams can be used to add custom search params to the OData query (note that those shouldn't start with a '$'). Fetch allows you to alter the way the http call get executed. For example, set the fetch options:
```ts
QueryContext.CourseQuery()
  .Select('Id', 'Name')
  .First({Fetch: async url => fetch(url, {credentials: 'include'})})
```
Finally, setting Debug to true will log the query before execution.