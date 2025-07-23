# Ordering with `orderBy`

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

// result: $select=username&$orderby=address/city
```

You can set the order mode by calling `desc()` or `asc()`.

```ts
odataQuery<User>().orderBy(u => u.id.desc())

// result: $orderby=id desc
```

You can also `orderBy` with key string.

```ts
odataQuery<User>().orderBy('id', 'desc')

// result: $orderby=id desc
``` 