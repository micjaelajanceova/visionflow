export interface UserProfilePost {
  taskId: string
  taskTitle: string
  goal?: { title: string; category: string }
  goalId?: string
  date: string
  photoData: string
  completedCount: number
  progressPercent: number
}

export interface UserProfileGoal {
  _id: string
  title: string
  category: string
  imageData?: string
  donePhoto?: string
  doneAt?: string
}

export interface UserProfile {
  user: { id: string; username: string; avatarUrl?: string }
  posts: UserProfilePost[]
  goals: UserProfileGoal[]
}
