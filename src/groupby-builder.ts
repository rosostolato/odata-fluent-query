export class GroupbyBuilder<T> {
  aggregator: string[] = []

  sum(prop: keyof T, as: string): GroupbyBuilder<T> {
    return this.custom(prop, 'sum', as)
  }

  min(prop: keyof T, as: string): GroupbyBuilder<T> {
    return this.custom(prop, 'min', as)
  }

  max(prop: keyof T, as: string): GroupbyBuilder<T> {
    return this.custom(prop, 'max', as)
  }

  average(prop: keyof T, as: string): GroupbyBuilder<T> {
    return this.custom(prop, 'average', as)
  }

  countdistinct(prop: keyof T, as: string): GroupbyBuilder<T> {
    return this.custom(prop, 'countdistinct', as)
  }

  custom(prop: keyof T, aggregator: string, as: string) {
    const agg = `${prop} with ${aggregator} as ${as}`
    this.aggregator.push(agg)
    return this
  }
}
