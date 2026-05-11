import { Request, Response } from 'express'
import User from '../models/User'
import Task from '../models/Task'
import mongoose from 'mongoose'

export const getUserPublicProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ message: 'User not found' }); return
    }

    const user = await User.findById(id).select('username avatarUrl')
    if (!user) { res.status(404).json({ message: 'User not found' }); return }

    const tasks = await Task.find({ user: id, 'completionPhotos.isPublic': true })
      .populate('goal', 'title category')

    const posts: any[] = []
    for (const task of tasks) {
      for (const photo of task.completionPhotos.filter(p => p.isPublic)) {
        posts.push({
          taskId: task._id,
          taskTitle: task.title,
          goal: task.goal,
          date: photo.date,
          photoData: photo.photoData,
          completedCount: task.completedDates.length,
          totalOccurrences: task.isRecurring ? task.completedDates.length + 1 : 1,
        })
      }
    }
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    res.json({ user: { id: user._id, username: user.username, avatarUrl: user.avatarUrl }, posts })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
}
