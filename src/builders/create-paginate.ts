import { QueryDescriptor } from '../models'
import { CreatePaginateParams } from '../models/query-paginate'
import { createQuery } from './create-query'

export function createPaginate(descriptor: QueryDescriptor) {
  return (sizeOrOptions: CreatePaginateParams | number, page: number) => {
    let data: CreatePaginateParams

    if (typeof sizeOrOptions === 'number') {
      data = {
        page: page,
        count: true,
        pagesize: sizeOrOptions,
      }
    } else {
      data = sizeOrOptions

      if (data.count === undefined) {
        data.count = true
      }
    }
    const queryDescriptor: QueryDescriptor = {
      ...descriptor,
      take: data.pagesize,
      skip: data.pagesize * data.page,
      count: data.count ?? false,
    }
    if (!queryDescriptor.skip) {
      delete queryDescriptor.skip
    }
    return createQuery(queryDescriptor)
  }
}
