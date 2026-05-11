import mongoose, { Document, Schema } from 'mongoose'

export interface IProgress extends Document {
  _id: mongoose.Types.ObjectId
  goal: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  date: Date
  completed: boolean
  note: string
  createdAt: Date
}

const ProgressSchema = new Schema<IProgress>(
  {
    goal: { type: Schema.Types.ObjectId, ref: 'Goal', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    note: { type: String, default: '' },
  },
  { timestamps: true }
)

export default mongoose.model<IProgress>('Progress', ProgressSchema)