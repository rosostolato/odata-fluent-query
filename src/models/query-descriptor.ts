export interface QueryDescriptor {
  key: string | null
  compute: string[]
  expands: QueryDescriptor[]
  filters: string[]
  groupby: string[]
  orderby: string[]
  select: string[]
  aggregator?: string
  count?: boolean
  skip?: number
  take?: number
}
