import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db'
import authRoutes from './routes/auth.routes'
import goalRoutes from './routes/goal.routes'
import taskRoutes from './routes/task.routes'
import progressRoutes from './routes/progress.routes'
import journalRoutes from './routes/journal.routes'

dotenv.config()
connectDB()

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/journal', journalRoutes)
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))