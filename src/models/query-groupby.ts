export interface GroupbyBuilder<T> {
  sum(prop: keyof T, as: string): GroupbyBuilder<T>
  min(prop: keyof T, as: string): GroupbyBuilder<T>
  max(prop: keyof T, as: string): GroupbyBuilder<T>
  average(prop: keyof T, as: string): GroupbyBuilder<T>
  countdistinct(prop: keyof T, as: string): GroupbyBuilder<T>
  custom(prop: keyof T, aggregator: string, as: string): GroupbyBuilder<T>
}
