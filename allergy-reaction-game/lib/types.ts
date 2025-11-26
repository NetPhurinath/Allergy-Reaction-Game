export type UserRole = 'player' | 'admin'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
}

export type ScoreEntry = {
  id: string
  userId: string
  name: string
  email: string
  score: number
  correctCount: number
  rounds: number
  date: string
}
