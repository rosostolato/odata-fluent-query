import type { Address } from './address'
import type { Post } from './post'

export interface User {
  id: number | null
  email: string | null
  surname?: string
  givenName: string
  createDate: Date | null
  accountEnabled: boolean
  birthDate: Date
  lastLogin: Date

  // simple array
  phoneNumbers: string[]

  // one2one
  address: Address
  address2: Address | null

  // one2many
  posts: Post[] | null
}
