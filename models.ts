export interface User {
  id: number | null
  mail: string | null
  surname: string
  givenName: string
  createDate: Date
  accountEnabled: boolean

  // simple array
  phoneNumbers: string[]

  // one2one
  address: Address

  // one2many
  posts: Post[]
}

export interface Address {
  code: number
  street: string
  user: User
}

export interface Post {
  id: number
  date: Date
  content: string
  comments: (string | null)[]
}
