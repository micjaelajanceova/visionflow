import { Request, Response } from 'express'
import Task from '../models/Task'
import Goal from '../models/Goal'
import User from '../models/User'

// delete task completion photo by date in explore/user profile pages
export const deleteTaskPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId, date } = req.params
    const task = await Task.findById(taskId)
    if (!task) { res.status(404).json({ message: 'Task not found' }); return }

    task.completionPhotos = task.completionPhotos.filter(p => p.date !== date)
    await task.save()
    res.json({ message: 'Photo deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// delete goal done photo in explore/user profile pages
export const deleteGoalPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findByIdAndUpdate(
      req.params.goalId,
      { $unset: { donePhoto: '' }, isDonePublic: false },
      { new: true }
    )
    if (!goal) { res.status(404).json({ message: 'Goal not found' }); return }
    res.json({ message: 'Photo deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}


// block or unblock user
export const setUserBlocked = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blocked } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBlocked: !!blocked },
      { new: true }
    ).select('-password')
    if (!user) { res.status(404).json({ message: 'User not found' }); return }
    res.json({ message: blocked ? 'User blocked' : 'User unblocked', user })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}


// get all users (admin only)
export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}
