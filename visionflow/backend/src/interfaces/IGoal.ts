import mongoose, { Document } from 'mongoose'

export type GoalCategory = 'Health' | 'Career' | 'Finance' | 'Education' | 'Personal' | 'Other'
export type TrackingType = 'daily' | 'weekly' | 'monthly'

export interface IGoal extends Document {
  _id: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  title: string
  description: string
  category: GoalCategory
  trackingType: TrackingType
  targetDate: Date
  isPublic: boolean
  imageData?: string
  isDone: boolean
  doneAt?: Date
  donePhoto?: string
  isDonePublic: boolean
  createdAt: Date
  updatedAt: Date
}
