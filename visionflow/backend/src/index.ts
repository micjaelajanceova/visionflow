import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import dotenv from 'dotenv'
import connectDB from './config/db'
import authRoutes from './routes/auth.routes'
import goalRoutes from './routes/goal.routes'
import taskRoutes from './routes/task.routes'
import usersRoutes from './routes/users.routes'
import adminRoutes from './routes/admin.routes'
import { setupSwagger } from './config/swagger'

dotenv.config()
connectDB()

const app = express()

app.use(helmet())

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://visionflow-omega-brown.vercel.app'
  ],
  credentials: true
}))

// Strict rate limit for auth (login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ limit: '5mb', extended: true }))

// Strip $ and . from keys to prevent NoSQL injection
app.use(mongoSanitize())

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/goals', apiLimiter, goalRoutes)
app.use('/api/tasks', apiLimiter, taskRoutes)
app.use('/api/users', apiLimiter, usersRoutes)
app.use('/api/admin', apiLimiter, adminRoutes)

setupSwagger(app)
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
