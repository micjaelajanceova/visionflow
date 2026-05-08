import mongoose, { Document, Schema } from 'mongoose'

export interface IChallenge extends Document {
  _id: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  title: string
  description: string
  startDate: Date
  completedDays: number[]
  createdAt: Date
}

const ChallengeSchema = new Schema<IChallenge>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    startDate: { type: Date, required: true },
    completedDays: { type: [Number], default: [] },
  },
  { timestamps: true }
)

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema)