import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db'
import authRoutes from './routes/auth.routes'
import goalRoutes from './routes/goal.routes'
import taskRoutes from './routes/task.routes'
import progressRoutes from './routes/progress.routes'
import journalRoutes from './routes/journal.routes'
import challengeRoutes from './routes/challenge.routes'
import { setupSwagger } from './config/swagger'

dotenv.config()
connectDB()

const app = express()
app.use(cors())
app.use(express.json( {limit: '20mb' }))
app.use(express.urlencoded({ limit: '20mb', extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/goals', goalRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/journal', journalRoutes)
app.use('/api/challenges', challengeRoutes)

setupSwagger(app)
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))