export interface Address {
  code: number
  street: string
  city: string
  state: string
  zipCode: string
}

export interface Post {
  // Required properties - always included
  id: number
  title: string
  date: Date
  content: string
  isPublished: boolean

  // Complex type - array of comments (stored with post)
  comments: (string | null)[]

  // Optional navigation properties - require $expand
  author?: User
}

export interface User {
  // Required properties - scalar and complex types (always included)
  id: number
  email: string
  givenName: string
  surname: string | null // nullable but always present
  createDate: Date
  accountEnabled: boolean
  birthDate: Date
  age: number | null // nullable but always present
  lastLogin: Date | null // nullable but always present

  // Complex types
  address: Address
  phoneNumbers: string[]
  personalInfo: {
    age: number
    department: string
    preferredLanguage: string
  }

  // Optional properties - Navigation properties (require $expand)
  posts?: Post[] | null // One-to-many relationship
  manager?: User // Self-referencing navigation
}
