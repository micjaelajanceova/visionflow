import { Request, Response } from 'express'
import User from '../models/User'
import Task from '../models/Task'
import Goal from '../models/Goal'
import mongoose from 'mongoose'
import { countOccurrences } from '../utils/taskUtils'

// GET /api/users/:id/profile — returns public profile info for a user, including their recent public posts (completion photos) and completed goals
export const getUserPublicProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ message: 'User not found' }); return
    }

    const user = await User.findById(id).select('username avatarUrl')
    if (!user) { res.status(404).json({ message: 'User not found' }); return }

    const tasks = await Task.find({ user: id, 'completionPhotos.isPublic': true })
      .populate('goal', 'title category targetDate')

    const posts: any[] = []
    for (const task of tasks) {
      const totalOccurrences = countOccurrences(task)
      const completedCount = task.completedDates.length
      const progressPercent = totalOccurrences > 0 ? Math.min(100, Math.round((completedCount / totalOccurrences) * 100)) : 0
      for (const photo of task.completionPhotos.filter(p => p.isPublic)) {
        posts.push({
          taskId: task._id,
          taskTitle: task.title,
          goal: task.goal,
          date: photo.date,
          photoData: photo.photoData,
          completedCount,
          totalOccurrences,
          goalId: task.goal ? String((task.goal as any)._id) : undefined,
          progressPercent,
        })
      }
    }
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const goals = await Goal.find({ user: id, isDone: true, isDonePublic: true })

    res.json({
      user: { id: user._id, username: user.username, avatarUrl: user.avatarUrl },
      posts,
      goals,
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error'})
  }
}
