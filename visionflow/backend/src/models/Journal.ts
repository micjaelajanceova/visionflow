import mongoose, { Document, Schema } from 'mongoose'

export interface IJournal extends Document {
  _id: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  goal?: mongoose.Types.ObjectId
  title: string
  content: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

const JournalSchema = new Schema<IJournal>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    goal: { type: Schema.Types.ObjectId, ref: 'Goal' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
)

export default mongoose.model<IJournal>('Journal', JournalSchema)