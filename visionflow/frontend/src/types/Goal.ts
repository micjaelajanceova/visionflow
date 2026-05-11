export interface Goal {
  _id: string
  title: string
  description: string
  category: 'Health' | 'Career' | 'Finance' | 'Education' | 'Personal' | 'Other'
  trackingType: 'daily' | 'weekly' | 'monthly'
  targetDate: string
  isPublic: boolean
  imageData?: string
  isDone: boolean
  doneAt?: string
  donePhoto?: string
  isDonePublic: boolean
  createdAt: string
  user?: { _id: string; username: string }
}
