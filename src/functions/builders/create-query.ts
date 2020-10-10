import { mk_query } from '../../utils'
import { createFilter } from './create-filter'
import { ODataQuery } from '../models/odata-query'
import { createSelect } from './create-select'
import { QueryDescriptor } from '../models/query-descriptor'

export function createQuery<T>(descriptor: QueryDescriptor): ODataQuery<T> {
  return {
    select: createSelect<T>(descriptor),
    filter: createFilter<T>(descriptor),
    toString(): string {
      return mk_query(descriptor)
        .map((p) => `${p.key}=${p.value}`)
        .join('&')
    },
  }
}
