import type { Student } from './student'

export interface Teacher {
  // Required properties - always included
  id: string
  firstName: string
  lastName: string
  email: string
  hireDate: Date

  // Complex type - basic class information (stored with teacher)
  assignedClass: {
    id: string
    name: string
    level: number
  }

  // Optional navigation properties - require $expand
  students?: Student[] // Many-to-many relationship
  department?: {
    // Navigation to department entity
    id: string
    title: string
    head: string
  }
}
