import { QueryDescriptor } from '../models'
import { createQuery } from './create-query'

export function createPaginate(descriptor: QueryDescriptor) {
  return (sizeOrOptions: any, page: number) => {
    let data: {
      page: number
      count?: boolean
      pagesize: number
    }
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
      queryDescriptor.skip = undefined
    }
    return createQuery(queryDescriptor)
  }
}
