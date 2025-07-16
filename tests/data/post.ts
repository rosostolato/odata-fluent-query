export interface Post {
  id: number
  date: Date
  content: string
  comments: (string | null)[]
}
