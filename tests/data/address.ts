import type { User } from './user'

export interface Address {
  code: number
  street: string
  user: User
}
