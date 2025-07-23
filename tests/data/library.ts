// Simple test entities for type inference testing
// Follows OData patterns: required properties are complex types, optional properties are navigation properties

export interface Library {
  // Required properties - Complex types (always included in OData responses)
  id: string
  name: string
  type: 'public' | 'academic' | 'special'
  established: Date
  isOpen: boolean

  // Required complex type - location (always included)
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }

  // Required complex type - basic info (always included)
  info: {
    totalBooks: number
    memberCount: number
    operatingHours: string
    phoneNumber: string
  }

  // Optional properties - Navigation properties (require $expand to be included)
  books?: Array<{
    id: string
    title: string
    author: string
    isbn: string
    isAvailable: boolean
  }>

  members?: Array<{
    id: string
    name: string
    email: string
    joinDate: Date
    isActive: boolean
  }>

  librarians?: Array<{
    id: string
    name: string
    position: string
    hireDate: Date
  }>

  events?: Array<{
    id: string
    name: string
    eventDate: Date
    capacity: number
  }>
}

// Simpler additional test entity
export interface LibraryBranch {
  // Required complex types
  id: string
  name: string
  branchCode: string
  openedDate: Date

  // Required complex type - location
  location: {
    address: string
    city: string
    phone: string
  }

  // Optional navigation properties
  mainLibrary?: {
    id: string
    name: string
    established: Date
  }

  staff?: Array<{
    id: string
    name: string
    role: string
  }>

  collections?: Array<{
    id: string
    category: string
    itemCount: number
  }>
}
