import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

function generateToken(id: string, email: string): string {
  const secret = process.env.JWT_SECRET as string
  return jwt.sign({ id, email }, secret, { expiresIn: '7d' })
}

// register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      res.status(400).json({ message: 'email already in use' })
      return
    }

    const user = await User.create({ username, email, password })
    // password is hashed automatically by the pre-save hook in User model
    res.status(201).json({
      token: generateToken(user._id.toString(), user.email),
      user: { id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, isAdmin: user.isAdmin },
    })
  } catch (error) {
    res.status(500).json({ message: 'something went wrong' })
  }
}


// login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'wrong email or password' })
      return
    }

    if (user.isBlocked) {
      res.status(403).json({ message: 'Your account has been blocked.' })
      return
    }

    res.json({
      token: generateToken(user._id.toString(), user.email),
      user: { id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, isAdmin: user.isAdmin },
    })
  } catch (error) {
    res.status(500).json({ message: 'something went wrong' })
  }
}


// get current user profile
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password')
    if (!user) {
      res.status(404).json({ message: 'user not found' })
      return
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'something went wrong' })
  }
}


// update username and/or avatar
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, avatarUrl } = req.body
    const userId = req.user?.id

    if (username) {
      const taken = await User.findOne({ username, _id: { $ne: userId } })
      if (taken) {
        res.status(400).json({ message: 'username already taken' })
        return
      }
    }


    const updates: Record<string, unknown> = {}
    if (username) updates.username = username
    if ('avatarUrl' in req.body) updates.avatarUrl = avatarUrl

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select('-password')

    if (!user) {
      res.status(404).json({ message: 'user not found' })
      return
    }

    res.json({ id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl })
  } catch (error) {
    console.error('updateProfile error:', error)
    res.status(500).json({ message: 'something went wrong' })
  }
}

// update password
export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      res.status(400).json({ message: 'invalid request' })
      return
    }

    const user = await User.findById(req.user?.id)
    if (!user) {
      res.status(404).json({ message: 'user not found' })
      return
    }

    const match = await user.comparePassword(currentPassword)
    if (!match) {
      res.status(400).json({ message: 'current password is incorrect' })
      return
    }

    user.password = newPassword
    await user.save()

    res.json({ message: 'password updated' })
  } catch (error) {
    res.status(500).json({ message: 'something went wrong' })
  }
}