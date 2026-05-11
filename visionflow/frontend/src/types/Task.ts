export interface CompletionPhoto {
  date: string
  photoData: string
  isPublic: boolean
}

export interface SubTask {
  title: string
  completed: boolean
}

export interface DateSubTaskState {
  date: string
  states: boolean[]
}

export interface DateSubTaskItem {
  title: string
  completed: boolean
}

export interface DateSubTasks {
  date: string
  items: DateSubTaskItem[]
}

export interface TaskParticipant {
  userId: string
  email: string
  accepted: boolean
}

export interface Task {
  _id: string
  participants: TaskParticipant[]
  title: string
  description: string
  isAllDay: boolean
  time?: string
  endTime?: string
  isRecurring: boolean
  recurringDays: number[]
  startDate?: string
  endDate?: string
  dueDate?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  goalId?: string
  goal?: string
  user: string
  subTasks: SubTask[]
  completedDates: string[]
  skippedDates: string[]
  dateSubTaskStates: DateSubTaskState[]
  dateSubTasks: DateSubTasks[]
  completionPhotos: CompletionPhoto[]
  createdAt: string
}
