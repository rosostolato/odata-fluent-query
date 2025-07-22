export interface QueryDescriptor {
  count?: boolean | undefined
  key?: string | undefined
  skip?: number | undefined
  take?: number | undefined
  aggregator?: string | undefined
  select: string[]
  filters: string[]
  orderby: string[]
  groupby: string[]
  expands: QueryDescriptor[]
  compute: string[]
  search?: string | undefined
}
