export interface OrderbyBuilder<T> {
  sum(prop: keyof T, as: string): OrderbyBuilder<T>;
  min(prop: keyof T, as: string): OrderbyBuilder<T>;
  max(prop: keyof T, as: string): OrderbyBuilder<T>;
  average(prop: keyof T, as: string): OrderbyBuilder<T>;
  countdistinct(prop: keyof T, as: string): OrderbyBuilder<T>;
}
