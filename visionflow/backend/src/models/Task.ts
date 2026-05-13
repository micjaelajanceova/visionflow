import mongoose, { Schema } from 'mongoose'
import type { ITask, ICompletionPhoto, ISubTask, IDateSubTaskState } from '../interfaces/ITask'

export type { ITask, ICompletionPhoto, ISubTask, IDateSubTaskState } from '../interfaces/ITask'
export type { IDateSubTaskItem, IDateSubTasks, IParticipant } from '../interfaces/ITask'

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
