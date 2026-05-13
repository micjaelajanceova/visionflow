import mongoose, { Document } from 'mongoose'

export interface ICompletionPhoto {
  date: string
  photoData: string
  isPublic: boolean
}

export interface ISubTask {
  title: string
  completed: boolean
}

export interface IDateSubTaskState {
  date: string
  states: boolean[]
}

export interface IDateSubTaskItem {
  title: string
  completed: boolean
}

export interface IDateSubTasks {
  date: string
  items: IDateSubTaskItem[]
}

export interface IParticipant {
  userId: mongoose.Types.ObjectId
  email: string
  accepted: boolean
}

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  participants: IParticipant[]
  goal?: mongoose.Types.ObjectId
  title: string
  description: string
  isAllDay: boolean
  time?: string
  endTime?: string
  isRecurring: boolean
  recurringDays: number[]
  startDate?: Date
  endDate?: Date
  dueDate?: Date
  completed: boolean
  subTasks: ISubTask[]
  completedDates: string[]
  skippedDates: string[]
  dateSubTaskStates: IDateSubTaskState[]
  dateSubTasks: IDateSubTasks[]
  completionPhotos: ICompletionPhoto[]
  createdAt: Date
  updatedAt: Date
}
