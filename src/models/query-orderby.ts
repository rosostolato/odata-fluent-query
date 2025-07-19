export type OrderByBuilder<T> = {
  [P in keyof T]-?: OrderByBuilderTyped<T[P]>
}

export type OrderByBuilderTyped<T> = T extends Array<infer R>
  ? R extends object
    ? OrderByBuilder<R>
    : never
  : T extends number | string | boolean | Date | Uint8Array
  ? OrderBy
  : T extends object
  ? OrderByBuilder<T>
  : never

export interface OrderBy {
  /**
   * Orders the results in ascending order
   * @returns An order by expression for ascending sorting
   * @example
   * orderBy(u => u.name.asc())
   */
  asc(): OrderByExpression

  /**
   * Orders the results in descending order
   * @returns An order by expression for descending sorting
   * @example
   * orderBy(u => u.name.desc())
   */
  desc(): OrderByExpression
}

export interface OrderByExpression {}
