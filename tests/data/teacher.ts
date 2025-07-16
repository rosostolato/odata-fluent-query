import type { Student } from './student'

export interface Teacher {
  id: string
  firstName: string
  lastName: string
  class: {
    id: string
    name: string
    students?: Student[]
  }
  department?: {
    id: string
    title: string
  }
}
