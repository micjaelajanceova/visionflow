import { Request, Response, NextFunction } from 'express'
import User from '../models/User'

// checks that the user is an admin
export const adminOnly = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = await User.findById(req.user!.id)
  if (!user?.isAdmin) {
    res.status(403).json({ message: 'Admin access required' })
    return
  }
  next()
}
