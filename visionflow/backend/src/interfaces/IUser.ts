import mongoose, { Document } from 'mongoose'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  username: string
  email: string
  password: string
  avatarUrl?: string
  isAdmin: boolean
  isBlocked: boolean
  createdAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}
