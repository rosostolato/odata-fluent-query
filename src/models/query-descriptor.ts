export interface QueryDescriptor {
  count: boolean
  strict: boolean
  key: string | null
  skip: number | null
  take: number | null
  aggregator: string | null
  select: string[]
  filters: string[]
  orderby: string[]
  groupby: string[]
  expands: QueryDescriptor[]
}
