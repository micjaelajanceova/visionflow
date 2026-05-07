import mongoose from 'mongoose'

// connect to mongodb atlas
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string)
    console.log('MongoDB connected:', conn.connection.host)
  } catch (error) {
    console.error('could not connect to db:', error)
    process.exit(1)
  }
}

export default connectDB