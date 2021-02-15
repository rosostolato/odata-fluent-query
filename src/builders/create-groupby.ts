import { QueryDescriptor } from '../models'
import { createQuery } from './create-query'

export function groupbyBuilder(aggregator: string[] = []) {
  const custom = (prop: string, aggreg: string, as: string) =>
    groupbyBuilder(aggregator.concat(`${prop} with ${aggreg} as ${as}`))

  return {
    aggregator,
    sum(prop: string, as: string) {
      return custom(prop, 'sum', as)
    },
    min(prop: string, as: string) {
      return custom(prop, 'min', as)
    },
    max(prop: string, as: string) {
      return custom(prop, 'max', as)
    },
    average(prop: string, as: string) {
      return custom(prop, 'average', as)
    },
    countdistinct(prop: string, as: string) {
      return custom(prop, 'countdistinct', as)
    },
    custom,
  }
}

export function createGroupby(descriptor: QueryDescriptor) {
  return (keys: string[], aggregate?: Function) => {
    const agg = groupbyBuilder()
    const result = aggregate?.(agg) || agg

    return createQuery({
      ...descriptor,
      groupby: keys.map(String),
      aggregator: result.aggregator.join(', ') || null,
    })
  }
}
