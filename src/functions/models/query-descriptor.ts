export interface QueryDescriptor {
  key: string | null
  skip: number | null
  take: number | null
  select: string[]
  filters: string[]
  orderby: string[]
  groupby: string[]
  groupAgg: string | null
  expands: QueryDescriptor[]
  strict: boolean
  count: boolean
}
