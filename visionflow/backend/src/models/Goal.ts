import mongoose, { Schema } from 'mongoose'
import type { IGoal } from '../interfaces/IGoal'

export type { IGoal, GoalCategory, TrackingType } from '../interfaces/IGoal'

const GoalSchema = new Schema<IGoal>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['Health', 'Career', 'Finance', 'Education', 'Personal', 'Other'],
      default: 'Personal',
    },
    trackingType: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
    targetDate: { type: Date, required: true },
    isPublic: { type: Boolean, default: false },
    imageData: { type: String },
    isDone: { type: Boolean, default: false },
    doneAt: { type: Date },
    donePhoto: { type: String },
    isDonePublic: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export default mongoose.model<IGoal>('Goal', GoalSchema)
