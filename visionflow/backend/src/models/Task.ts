import mongoose, { Document, Schema } from 'mongoose'

export type TaskPriority = 'low' | 'medium' | 'high'

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
  priority: TaskPriority
  subTasks: ISubTask[]
  completedDates: string[]
  skippedDates: string[]
  dateSubTaskStates: IDateSubTaskState[]
  dateSubTasks: IDateSubTasks[]
  completionPhotos: ICompletionPhoto[]
  createdAt: Date
  updatedAt: Date
}

const CompletionPhotoSchema = new Schema<ICompletionPhoto>({
  date: { type: String, required: true },
  photoData: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
}, { _id: false })

const SubTaskSchema = new Schema<ISubTask>({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
}, { _id: false })

const DateSubTaskStateSchema = new Schema<IDateSubTaskState>({
  date: { type: String, required: true },
  states: [{ type: Boolean }],
}, { _id: false })

const TaskSchema = new Schema<ITask>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      email: { type: String, required: true },
      accepted: { type: Boolean, default: false },
      _id: false,
    }],
    goal: { type: Schema.Types.ObjectId, ref: 'Goal' },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isAllDay: { type: Boolean, default: true },
    time: { type: String },
    endTime: { type: String },
    isRecurring: { type: Boolean, default: false },
    recurringDays: [{ type: Number }],
    startDate: { type: Date },
    endDate: { type: Date },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    subTasks: [SubTaskSchema],
    completedDates: [{ type: String }],
    skippedDates: [{ type: String }],
    dateSubTaskStates: [DateSubTaskStateSchema],
    dateSubTasks: [{
      date: { type: String, required: true },
      items: [{ title: { type: String, required: true }, completed: { type: Boolean, default: false } }],
      _id: false,
    }],
    completionPhotos: [CompletionPhotoSchema],
  },
  { timestamps: true }
)

export default mongoose.model<ITask>('Task', TaskSchema)
