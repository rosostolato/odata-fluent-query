import { List, Map } from "immutable";
import { EntityParser, parseCollection, parseEntity } from "./deserilisation";
import { FilterBuilderComplex, FilterExpresion } from "./filterbuilder";
import { OrderByBuilder, OrderBy, OrderByBuilderComplex } from "./orderbyBuilder";

type QueryDescriptor = {
  filters: List<string>
  expands: List<RelQueryDescriptor>
  skip: number | 'none'
  take: number | 'none'
  orderby: string
  select: List<string>
  baseuri: string
  count: boolean
}

type RelQueryDescriptor = {
  key: string
  skip: number | 'none'
  take: number | 'none'
  orderby: List<string>
  select: List<string>
  filters: List<string>
  expands: List<RelQueryDescriptor>,
  strict: boolean
}

type Page<M> = {
  pagesize: number
  page: number
  items: List<M>
  totalCount: number
  totalPages: number
  isComplete: boolean
}

type QueryContext = {
  QueryParams?: Map<string, string>
  Fetch?: (url: string) => Promise<Response>
  Debug?: boolean
}

const buildParams = (ps: Map<string, string>): string =>
  ps.map((val, key) => `${key}=${val}`).join('&')

export function mk_query_descriptor(baseuri: string, base?: Partial<QueryDescriptor>): QueryDescriptor {
  const empty: QueryDescriptor = {
    filters: List<string>(),
    expands: List<RelQueryDescriptor>(),
    skip: 'none',
    take: 'none',
    orderby: '',
    select: List<string>(),
    baseuri,
    count: false
  }

  if (base != undefined) {
    return { ...empty, ...base }
  }
  return empty
}

export function mk_rel_query_descriptor(key: string, base?: Partial<RelQueryDescriptor>): RelQueryDescriptor {
  const empty: RelQueryDescriptor = {
    filters: List<string>(),
    skip: 'none',
    take: 'none',
    orderby: List<string>(),
    select: List<string>(),
    key,
    expands: List(),
    strict: false
  }

  if (base != undefined) {
    return { ...empty, ...base }
  }
  return empty
}

export function mk_query_string(qd: QueryDescriptor): string {
  let params: string[] = []

  if (qd.filters.isEmpty() == false)
    params.push(`$filter=${qd.filters.join(' and ')}`)

  if (qd.expands.isEmpty() == false) {
    params.push(`$expand=${qd.expands.map(mk_rel_query_string).join(',')}`)
  }

  if (qd.select.isEmpty() == false) {
    params.push(`$select=${qd.select.join(',')}`)
  }

  if (qd.orderby) {
    params.push(`$orderby=${qd.orderby}`)
  }

  if (qd.skip != 'none') {
    params.push(`$skip=${qd.skip}`)
  }

  if (qd.take != 'none') {
    params.push(`$top=${qd.take}`)
  }

  if (qd.count == true) {
    params.push(`$count=true`)
  }

  return `${qd.baseuri}?${params.join('&')}`
}

export function mk_rel_query_string(rqd: RelQueryDescriptor): string {
  let expand: string = rqd.key

  if (rqd.strict) {
    expand += '!'
  }

  if (!rqd.filters.isEmpty() || !rqd.orderby.isEmpty() || !rqd.select.isEmpty() || rqd.skip != 'none' || rqd.take != 'none') {
    expand += `(`

    let operators = []

    if (rqd.skip != 'none') {
      operators.push(`$skip=${rqd.skip}`)
    }

    if (rqd.take != 'none') {
      operators.push(`$top=${rqd.take}`)
    }

    if (rqd.orderby.isEmpty() == false) {
      operators.push(`$orderby=${rqd.orderby.join(',')}`)
    }

    if (rqd.select.isEmpty() == false) {
      operators.push(`$select=${rqd.select.join(',')}`)
    }

    if (rqd.filters.isEmpty() == false) {
      operators.push(`$filter=${rqd.filters.join(' and ')}`)
    }

    if (rqd.expands.isEmpty() == false) {
      operators.push(`$expand=${rqd.expands.map(mk_rel_query_string).join(',')}`)
    }

    expand += operators.join(';')

    expand += ')'
  }

  return expand
}

export function mk_query<M extends object>(
  fb: FilterBuilderComplex<M>,
  rb: RelationBuilder<RelationsOf<M>>,
  baseuri: string,
  parser: EntityParser<M>,
  orderby: OrderByBuilderComplex<M>
) {
  return new Query<M, M>(
    fb,
    mk_query_descriptor(baseuri),
    rb,
    parser,
    parser,
    orderby
  )
}

export class Query<M extends object, R> {

  constructor(
    protected readonly filterBuilder: FilterBuilderComplex<M>,
    protected readonly queryDescriptor: QueryDescriptor,
    protected readonly relationBuilder: RelationBuilder<RelationsOf<M>>,
    protected readonly parser: EntityParser<M>,
    protected readonly relationparser: EntityParser<RelationsOf<M>>,
    protected readonly orderby: OrderByBuilderComplex<M>
  ) { }

  /**
   * Adds a $select operator to the OData query.
   * Calling Select is required.
   * 
   * @param keys the names of the properties you want to select.
   * 
   * @example q.Select('Id', 'Title').
   */
  Select<key extends keyof PropertiesOf<M>>(...keys: key[]): SelectedQuery<M, Pick<M, key>> {
    return new SelectedQuery(
      this.filterBuilder,
      {
        ...this.queryDescriptor,
        select: List(keys.map(String)),
        expands: this.queryDescriptor.expands.filter(e => keys.some(k => e.key == String(k))).toList()
      },
      this.relationBuilder,
      keys.reduce((p, k) => {
        p[k] = this.parser[k]
        return p
      }, {} as any) as EntityParser<Pick<M, key>>,
      this.relationparser,
      this.orderby
    )
  }
}

export class SelectedQuery<M extends object, R extends object> {

  constructor(
    protected readonly filterBuilder: FilterBuilderComplex<M>,
    protected readonly queryDescriptor: QueryDescriptor,
    protected readonly relationBuilder: RelationBuilder<RelationsOf<M>>,
    protected readonly parser: EntityParser<R>,
    protected readonly relationparser: EntityParser<RelationsOf<M>>,
    protected readonly orderby: OrderByBuilderComplex<M>
  ) { }

  /** 
    * @deprecated use `Filter` instead.
    */
  Where = this.Filter

  /**
   * Adds a $filter operator to the OData query.
   * Multiple calls to Filter will be merged with `and`.
   * 
   * @param conditional a lambda that builds an expression from the builder.
   * 
   * @example q.Filter(u => u.Id.Equals(1)).
   */
  Filter(conditional: (_: FilterBuilderComplex<M>) => FilterExpresion): SelectedQuery<M, R> {
    const expr = conditional(this.filterBuilder)
    if (expr.kind == 'none') {
      return this
    }

    return new SelectedQuery(
      this.filterBuilder,
      { ...this.queryDescriptor, filters: this.queryDescriptor.filters.push(expr.GetFilterExpresion()) },
      this.relationBuilder,
      this.parser,
      this.relationparser,
      this.orderby
    )
  }

  /** 
    * @deprecated use `Expand` instead.
  */
  Include = this.Expand

  /**
   * Adds a $expand operator to the OData query.
   * Multiple calls to Expand will expand all the relations, e.g.: $expand=rel1(...),rel2(...).
   * The lambda in the second parameter allows you to build a complex inner query.
   * 
   * @param key the name of the relation.
   * @param query   a lambda that build the subquery from the querybuilder.
   * 
   * @example q.Exand('Blogs', q => q.Select('Id', 'Title')).
   */
  Expand<key extends keyof RelationsOf<M>, R1 extends object>(
    key: key,
    query: (_: RelationQuery<
      ObjectOrUnit<UnBoxed<RelationsOf<M>[key]>>,
      UnBoxed<RelationsOf<M>[key]>
    >,
    ) => SelectedRelationQuery<RelationsOf<ObjectOrUnit<UnBoxed<M[key]>>>, R1>
  ): SelectedQuery<
    M,
    R & { [_ in key]: InherentBoxing<M[key], InferQueryResult<ReturnType<typeof query>>> }
  > {
    const expand = query((this.relationBuilder[String(key)] as any)())
    const des = expand.queryDescriptor

    debugger;

    return new SelectedQuery(
      this.filterBuilder,
      { ...this.queryDescriptor, expands: this.queryDescriptor.expands.push(des) },
      this.relationBuilder,
      (() => {
        const p = { ...this.parser as any }
        p[key] = this.relationparser[String(key)](expand.parser)
        return p
      })(),
      this.relationparser,
      this.orderby
    )
  }

  /** 
    * @deprecated use `ExpandStrict` instead.
  */
  IncludeStrict = this.ExpandStrict

  /**
   * Adds a $expand operator to the OData query by using strictmodus: $expand=rel!(...).
   * Multiple calls to ExpandStrict will expand all the relations, e.g.: $expand=rel1!(...),rel2!(...).
   * The lambda in the second parameter allows you to build a complex inner query.
   * 
   * @param key the name of the relation.
   * @param query a lambda that build the subquery from the querybuilder.
   * 
   * @example q.ExpandStrict('Blogs', q => q.Select('Id', 'Title')).
   */
  ExpandStrict<key extends keyof RelationsOf<M>, R1 extends object>(
    key: key,
    query: (_: RelationQuery<
      ObjectOrUnit<UnBoxed<RelationsOf<M>[key]>>,
      UnBoxed<RelationsOf<M>[key]>
    >,
    ) => SelectedRelationQuery<RelationsOf<ObjectOrUnit<UnBoxed<M[key]>>>, R1>
  ): SelectedQuery<
    M,
    R & { [_ in key]: InherentBoxing<M[key], InferQueryResult<ReturnType<typeof query>>> }
  > {
    const expand = query((this.relationBuilder[String(key)] as any)())
    const des = {
      ...expand.queryDescriptor,
      strict: true
    }

    return new SelectedQuery(
      this.filterBuilder,
      { ...this.queryDescriptor, expands: this.queryDescriptor.expands.push(des) },
      this.relationBuilder,
      (() => {
        const p = { ...this.parser as any }
        p[key] = this.relationparser[String(key)](expand.parser)
        return p
      })(),
      this.relationparser,
      this.orderby
    )
  }

  /**
   * Adds a $orderby operator to the OData query.
   * Ordering over relations is supported (check you OData implementation for details).
   * 
   * @param expression a lambda that builds the orderby expression from the builder.
   * 
   * @example q.OrderBy(u => u.Blogs().Id.Desc()).
   */
  OrderBy(expression: (ob: OrderByBuilderComplex<M>) => OrderBy): SelectedQuery<M, R> {
    const orderby = expression(this.orderby).get()
    return new SelectedQuery(
      this.filterBuilder,
      { ...this.queryDescriptor, orderby: orderby },
      this.relationBuilder,
      this.parser,
      this.relationparser,
      this.orderby
    )
  }

  /**
   * Executes the query and desirializes it to a List<Result>.
   * 
   * @param ctx the QueryContext to use for the execution.
   */
  ToList(ctx?: QueryContext): Promise<List<R>> {
    const query = mk_query_string(this.queryDescriptor) + (ctx && ctx.QueryParams ? '&' + buildParams(ctx.QueryParams) : '')


    if (ctx && ctx.Debug === true) {
      console.log(query)
    }

    return (ctx && ctx.Fetch ? ctx.Fetch(query) : fetch(query))
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP error - ${r.status}: ${r.statusText}`))
      .then(r => typeof r == 'object' && r['value'] != undefined ? r.value : Promise.reject(`No value found in the response`))
      .then(r => parseCollection(x => parseEntity(x, this.parser))(r))
      .then(r => {
        if (r.kind == 'succes') {
          return List(r.value)
        }
        Promise.reject(r.error)
      })
  }

  /**
   * Executes the query and desirializes it to a Page<R>.
   * The page index is zero-indexed.
   * 
   * @param o an object with the pagesize and page.
   * @param ctx the QueryContext to use for the execution.
   * 
   * @example Query.Paginate({ pagesize: 10, page: 0})
   */
  Paginate(o: { pagesize: number, page: number, count: boolean }, ctx?: QueryContext): Promise<Page<R>> {
    const q = {
      ...this.queryDescriptor,
      take: o.pagesize,
      skip: o.pagesize * o.page,
      count: o.count
    }

    const query = mk_query_string(q) + (ctx && ctx.QueryParams ? '&' + buildParams(ctx.QueryParams) : '')

    if (ctx && ctx.Debug === true) {
      console.log(query)
    }

    return (ctx && ctx.Fetch ? ctx.Fetch(query) : fetch(query))
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP error - ${r.status}: ${r.statusText}`))
      .then(r => typeof r == 'object' ? r : Promise.reject(`No value found in the response`))
      .then(r => r['value'] != undefined ? r : Promise.reject(`No value found in the response`))
      .then(r => {
        if (typeof r["count"] != 'undefined')
          console.warn('No count found in response. proceeding with the size of the collection inside value.')
        return r
      })
      .then(r => ({
        ...r,
        value: parseCollection(x => parseEntity(x, this.parser))(r.value)
      }))
      .then(r => r.value.kind == 'failed' ? Promise.reject(r.value.error) : { ...r, value: r.value.value })
      .then(r => {
        const items = List<R>(r.value)
        const count = typeof r["count"] == 'undefined'
          ? items.count()
          : Number(r["count"])

        return {
          ...o,
          items: items,
          totalCount: count,
          totalPages: Math.ceil(count / o.pagesize),
          isComplete: typeof r["isComplete"] == 'undefined' ? true : r["isComplete"] == true
        }
      })
  }

  /**
   * Executes the query and gives you the first item.
   * Will throw when the result is empty.
   * 
   * @param ctx the QueryContext to use for the execution.
   */
  First(ctx?: QueryContext): Promise<R> {
    return new SelectedQuery<M, R>(
      this.filterBuilder,
      { ...this.queryDescriptor, take: 1, skip: 0 },
      this.relationBuilder,
      this.parser,
      this.relationparser,
      this.orderby
    ).ToList(ctx)
      .then<R>(r => {
        if (r.isEmpty()) Promise.reject('No entity found')
        return r.first()
      })
  }

  /**
   * Counts the size of the result set.
   * Will not fetch the set but uses the $count operators.
   * 
   * @param ctx the QueryContext to use for the execution.
   */
  Count(ctx?: QueryContext): Promise<number> {
    const query = mk_query_string(
      { ...this.queryDescriptor, baseuri: this.queryDescriptor.baseuri + '/$count' }
    ) + (ctx && ctx.QueryParams ? '&' + buildParams(ctx.QueryParams) : '')

    if (ctx && ctx.Debug === true) {
      console.log(query)
    }

    return (ctx && ctx.Fetch ? ctx.Fetch(query) : fetch(query))
      .then(r => r.ok ? r.text() : Promise.reject(`HTTP error - ${r.status}: ${r.statusText}`))
      .then(Number)
      .then(n => {
        if (n === NaN) throw Error('No value found in the response')
        return n
      })
  }

  /**
   * Logs the query before execution.
   * 
   * @deprecated use { Debug= true } in de QueryContext.
   */
  LogQuery() {
    console.log(mk_query_string(this.queryDescriptor))
    return this
  }

  ToString() {
    return mk_query_string(this.queryDescriptor)
  }
}

export function mk_rel_query<M extends object>(
  key: string,
  fb: FilterBuilderComplex<M>,
  rb: RelationBuilder<RelationsOf<M>>,
  parser: EntityParser<M>
): RelationQuery<M, M> {
  return new RelationQuery<M, M>(
    fb,
    mk_rel_query_descriptor(key),
    rb,
    parser,
    parser
  )
}
export class RelationQuery<M extends object, R> {
  constructor(
    private readonly filterBuilder: FilterBuilderComplex<M>,
    public readonly queryDescriptor: RelQueryDescriptor,
    protected readonly relationBuilder: RelationBuilder<RelationsOf<M>>,
    public readonly parser: EntityParser<M>,
    protected readonly relationparser: EntityParser<RelationsOf<M>>
  ) { }
  
  /**
   * compiles the innerquery.
   */
  ToQuery(): string {
    return mk_rel_query_string(this.queryDescriptor)
  }

  /**
   * selects properties from the model.
   * @param keys the names of the properties.
   * 
   * @example q => q.Select('Id', 'Title').
   */
  Select<key extends keyof PropertiesOf<M>>(...keys: key[]): SelectedRelationQuery<M, Pick<M, key>> {
    return new SelectedRelationQuery(
      this.filterBuilder,
      {
        ...this.queryDescriptor,
        select: List(keys.map(String)),
      },
      this.relationBuilder,
      keys.reduce((p, k) => {
        p[k] = this.parser[k]
        return p
      }, {} as any) as EntityParser<Pick<M, key>>,
      this.relationparser
    )
  }
}

export class SelectedRelationQuery<M extends object, R extends object> {

  constructor(
    private readonly filterBuilder: FilterBuilderComplex<M>,
    public readonly queryDescriptor: RelQueryDescriptor,
    protected readonly relationBuilder: RelationBuilder<RelationsOf<M>>,
    public readonly parser: EntityParser<R>,
    protected readonly relationparser: EntityParser<RelationsOf<M>>
  ) { }

  /**
   * compiles the innerquery.
   */
  ToQuery(): string {
    return mk_rel_query_string(this.queryDescriptor)
  }

  /** 
    * @deprecated use `Filter` instead.
  */
  Where = this.Filter

  /**
   * Adds a $filter operator to the OData query.
   * Multiple calls to Filter will be merged with `and`.
   * 
   * @param conditional a lambda that builds an expression from the builder.
   * 
   * @example q.Filter(u => u.Id.Equals(1)).
   */
  Filter(c: (_: FilterBuilderComplex<M>) => FilterExpresion): SelectedRelationQuery<M, R> {
    const expr = c(this.filterBuilder)

    if (expr.kind == 'none') {
      return this
    }

    return new SelectedRelationQuery(
      this.filterBuilder,
      { ...this.queryDescriptor, filters: this.queryDescriptor.filters.push(expr.GetFilterExpresion()) },
      this.relationBuilder,
      this.parser,
      this.relationparser
    )
  }

  /** 
    * @deprecated use `Expand` instead.
  */
  Include = this.Expand

  /**
   * Adds a $expand operator to the OData query.
   * Multiple calls to Expand will expand all the relations, e.g.: $expand=rel1(...),rel2(...).
   * The lambda in the second parameter allows you to build a complex inner query.
   * 
   * @param key the name of the relation.
   * @param query   a lambda that build the subquery from the querybuilder.
   * 
   * @example q.Exand('Blogs', q => q.Select('Id', 'Title')).
   */
  Expand<key extends keyof RelationsOf<M>, R1 extends object>(
    key: key,
    q: (_: RelationQuery<
      ObjectOrUnit<UnBoxed<RelationsOf<M>[key]>>,
      UnBoxed<RelationsOf<M>[key]>
    >
    ) => SelectedRelationQuery<RelationsOf<ObjectOrUnit<UnBoxed<M[key]>>>, R1>
  ): SelectedRelationQuery<
    M,
    R & { [_ in key]: InherentBoxing<M[key], InferQueryResult<ReturnType<typeof q>>> }
  > {
    const expand = q((this.relationBuilder[String(key)] as any)())
    const des = expand.queryDescriptor

    return new SelectedRelationQuery(
      this.filterBuilder,
      { ...this.queryDescriptor, expands: this.queryDescriptor.expands.push(des) },
      this.relationBuilder,
      (() => {
        const p = { ...this.parser as any }
        p[key] = this.relationparser[String(key)](expand.parser)
        return p
      })(),
      this.relationparser
    )
  }

  /** 
    * @deprecated use `ExpandStrict` instead.
  */ 
  IncludeStrict = this.ExpandStrict

  /**
   * Adds a $expand operator to the OData query by using strictmodus: $expand=rel!(...).
   * Multiple calls to ExpandStrict will expand all the relations, e.g.: $expand=rel1!(...),rel2!(...).
   * The lambda in the second parameter allows you to build a complex inner query
   * 
   * @param key the name of the relation.
   * @param query a lambda that build the subquery from the querybuilder.
   * 
   * @example q.ExpandStrict('Blogs', q => q.Select('Id', 'Title')).
   */
  ExpandStrict<key extends keyof RelationsOf<M>, R1 extends object>(
    key: key,
    q: (_: RelationQuery<
      ObjectOrUnit<UnBoxed<RelationsOf<M>[key]>>,
      UnBoxed<RelationsOf<M>[key]>
    >
    ) => SelectedRelationQuery<RelationsOf<ObjectOrUnit<UnBoxed<M[key]>>>, R1>
  ): SelectedRelationQuery<
    M,
    R & { [_ in key]: InherentBoxing<M[key], InferQueryResult<ReturnType<typeof q>>> }
  > {
    const expand = q((this.relationBuilder[String(key)] as any)())
    const des = {
      ...expand.queryDescriptor,
      strict: true
    }

    return new SelectedRelationQuery(
      this.filterBuilder,
      { ...this.queryDescriptor, expands: this.queryDescriptor.expands.push(des) },
      this.relationBuilder,
      (() => {
        const p = { ...this.parser as any }
        p[key] = this.relationparser[String(key)](expand.parser)
        return p
      })(),
      this.relationparser
    )
  }

  /**
   * Adds a $orderby operator to the OData query.
   * Ordering over relations is supported (check you OData implementation for details).
   * 
   * @param props the props and mode to sort on.
   * 
   * @example q.OrderBy({prop: 'Id', mode: 'desc'}).
   */
  OrderBy(...props: { prop: keyof M, mode?: 'asc' | 'desc' }[]): SelectedRelationQuery<M, R> {
    const orderby = props.map(s => `${s.prop}${s.mode ? ` ${s.mode}` : ''}`)
    return new SelectedRelationQuery(
      this.filterBuilder,
      { ...this.queryDescriptor, orderby: this.queryDescriptor.orderby.concat(orderby).toList() },
      this.relationBuilder,
      this.parser,
      this.relationparser
    )
  }

  /**
   * Paginate the inner query. Will not result in a full Page<R> object.
   * The pageindex in zero-based.
   * 
   * @param o the object with the pagesize and page.
   * 
   * @example q.Paginate({pagesize: 10, page: 0}).
   */
  Paginate(o: { pagesize: number, page: number }): SelectedRelationQuery<M, R> {
    return new SelectedRelationQuery(
      this.filterBuilder,
      { ...this.queryDescriptor, take: o.pagesize, skip: o.pagesize * o.page },
      this.relationBuilder,
      this.parser,
      this.relationparser
    )
  }
}

export type RelationBuilder<M extends object> =
  { [P in keyof M]?: () => RelationQuery<
    ObjectOrUnit<UnBoxed<M[P]>>,
    UnBoxed<ObjectOrUnit<M[P]>>
  > }

export type UnBoxed<T> = T extends any[] ? T[0] : T extends List<infer R> ? R : T

export type RelationsOf<Model extends object> = Pick<Model, {
  [P in keyof Model]: 
    Model[P] extends Date ? never : 
    Model[P] extends Uint8Array ? never : 
    Model[P] extends object | List<any> ? P : 
    never
}[keyof Model]>

export type PropertiesOf<Model extends object> = Pick<Model, {
  [P in keyof Model]: Model[P] extends string | number | boolean | Date | Uint8Array ? P : never
}[keyof Model]>

export type ObjectOrUnit<T> = T extends object ? T : {}

export type InherentBoxing<From, To> =
  From extends List<any> ? List<To> :
  From extends any[] ? To[] :
  To

export type InferQueryResult<T> =
  T extends SelectedRelationQuery<any, infer R> ? R : never