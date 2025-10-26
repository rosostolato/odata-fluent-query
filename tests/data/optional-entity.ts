export interface OptionalEntity {
  id: number
  requiredName: string
  optionalString?: string
  optionalNumber?: number
  optionalBoolean?: boolean
  optionalDate?: Date
  nullableString: string | null
  nullableNumber: number | null
  nullableBoolean: boolean | null
  nullableDate: Date | null
  optionalNullableString?: string | null
  optionalNullableNumber?: number | null
  optionalNullableDate?: Date | null
  optionalArray?: string[]
  optionalObject?: {
    nestedOptional?: string
    nestedRequired: number
  }
}
