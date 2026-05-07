import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

function generateToken(id: string, email: string): string {
  const secret = process.env.JWT_SECRET as string
  return jwt.sign({ id, email }, secret, { expiresIn: '7d' })
}


export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      res.status(400).json({ message: 'email already in use' })
      return
    }

    const user = await User.create({ username, email, password })
    // console.log('new user created:', user.username)

    res.status(201).json({
      token: generateToken(user._id.toString(), user.email),
      user: { id: user._id, username: user.username, email: user.email },
    })
  } catch (error) {
    res.status(500).json({ message: 'something went wrong', error })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'wrong email or password' })
      return
    }

    res.json({
      token: generateToken(user._id.toString(), user.email),
      user: { id: user._id, username: user.username, email: user.email },
    })
  } catch (error) {
    res.status(500).json({ message: 'something went wrong', error })
  }
}

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password')
    if (!user) {
      res.status(404).json({ message: 'user not found' })
      return
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'something went wrong', error })
  }
}