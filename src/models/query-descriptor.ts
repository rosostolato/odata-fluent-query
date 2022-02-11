export interface QueryDescriptor {
  count?: boolean
  key?: string
  skip?: number
  take?: number
  aggregator?: string
  select: string[]
  filters: string[]
  orderby: string[]
  groupby: string[]
  expands: QueryDescriptor[]
}
