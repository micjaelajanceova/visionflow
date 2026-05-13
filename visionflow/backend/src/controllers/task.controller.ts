import { Request, Response } from 'express'
import Task from '../models/Task'
import User from '../models/User'
import { countOccurrences } from '../utils/taskUtils'

/**
 * Builds a MongoDB filter that returns tasks the user either owns
 * or has been accepted as a participant on. Used for all task queries
 * to ensure shared tasks are always visible to all participants.
 */
const participantFilter = (userId: string) => ({
  $or: [
    { user: userId },
    { participants: { $elemMatch: { userId, accepted: true } } },
  ],
})

// GET /api/tasks — returns all tasks (owned + accepted shared) for the logged-in user
export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find(participantFilter(req.user!.id))
      .populate('user', 'username avatarUrl')
      .populate('participants.userId', 'username avatarUrl')
      .sort({ createdAt: -1 })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/tasks/invites/pending — returns tasks the user has been invited to but not yet accepted
export const getPendingInvites = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({
      participants: { $elemMatch: { userId: req.user!.id, accepted: false } },
    }).populate('user', 'username email')
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/tasks/:id/invite — invites a user by email to collaborate on a task
export const inviteToTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body
    const task = await Task.findOne({ _id: req.params.id, user: req.user!.id })
    if (!task) { res.status(404).json({ message: 'Task not found' }); return }

    const invitee = await User.findOne({ email: email.toLowerCase() })
    if (!invitee) { res.status(404).json({ message: 'No user with that email' }); return }

    if (invitee._id.equals(task.user)) {
      res.status(400).json({ message: 'Cannot invite yourself' }); return
    }

    const already = task.participants.some(p => p.userId.equals(invitee._id))
    if (already) { res.status(400).json({ message: 'User already invited' }); return }

    task.participants.push({ userId: invitee._id, email: invitee.email, accepted: false })
    await task.save()
    res.json({ message: 'Invite sent' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const respondToInvite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { accept } = req.body
    const task = await Task.findOne({
      _id: req.params.id,
      participants: { $elemMatch: { userId: req.user!.id, accepted: false } },
    })
    if (!task) { res.status(404).json({ message: 'Invite not found' }); return }

    if (accept) {
      const p = task.participants.find(p => p.userId.equals(req.user!.id))
      if (p) p.accepted = true
      task.markModified('participants')
      await task.save()
      res.json({ message: 'Accepted' })
    } else {
      task.participants = task.participants.filter(p => !p.userId.equals(req.user!.id))
      task.markModified('participants')
      await task.save()
      res.json({ message: 'Declined' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

const TASK_LIMIT = 500

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await Task.countDocuments({ user: req.user?.id })
    if (count >= TASK_LIMIT) {
      res.status(429).json({ message: `Task limit reached (max ${TASK_LIMIT}).` })
      return
    }
    const { user: _u, participants: _p, ...safeBody } = req.body
    const task = await Task.create({ ...safeBody, user: req.user?.id })
    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const populate = [
      { path: 'user', select: 'username avatarUrl' },
      { path: 'participants.userId', select: 'username avatarUrl' },
    ]

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, ...participantFilter(userId) },
      { $set: req.body },
      { new: true, runValidators: true, populate }
    )
    if (!task) { res.status(404).json({ message: 'Task not found' }); return }
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'could not update task' })
  }
}

export const completeTaskDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, photoData, isPublic } = req.body
    const task = await Task.findOne({ _id: req.params.id, ...participantFilter(req.user!.id) })
    if (!task) { res.status(404).json({ message: 'Task not found' }); return }

    if (!task.completedDates.includes(date)) {
      task.completedDates.push(date)
    } else {
      task.completedDates = task.completedDates.filter(d => d !== date)
      task.completionPhotos = task.completionPhotos.filter(p => p.date !== date)
      await task.save()
      res.json(task)
      return
    }

    if (photoData) {
      task.completionPhotos = task.completionPhotos.filter(p => p.date !== date)
      task.completionPhotos.push({ date, photoData, isPublic: isPublic ?? false })
    }

    await task.save()
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const updateDateSubTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, items } = req.body
    const task = await Task.findOne({ _id: req.params.id, ...participantFilter(req.user!.id) })
    if (!task) { res.status(404).json({ message: 'Task not found' }); return }
    const idx = task.dateSubTasks.findIndex((d: any) => d.date === date)
    if (idx >= 0) {
      task.dateSubTasks[idx].items = items
    } else {
      task.dateSubTasks.push({ date, items })
    }
    task.markModified('dateSubTasks')
    await task.save()
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const toggleSubTaskDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, subIndex } = req.body
    const task = await Task.findOne({ _id: req.params.id, ...participantFilter(req.user!.id) })
    if (!task) { res.status(404).json({ message: 'Task not found' }); return }

    let entry = task.dateSubTaskStates.find((s: any) => s.date === date)
    if (!entry) {
      task.dateSubTaskStates.push({ date, states: task.subTasks.map(() => false) })
      entry = task.dateSubTaskStates[task.dateSubTaskStates.length - 1]
    }
    while (entry.states.length <= subIndex) entry.states.push(false)
    entry.states[subIndex] = !entry.states[subIndex]
    task.markModified('dateSubTaskStates')
    await task.save()
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const skipTaskDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.body
    const task = await Task.findOne({ _id: req.params.id, ...participantFilter(req.user!.id) })
    if (!task) { res.status(404).json({ message: 'Task not found' }); return }
    if (!task.skippedDates.includes(date)) {
      task.skippedDates.push(date)
    } else {
      task.skippedDates = task.skippedDates.filter((d: string) => d !== date)
    }
    await task.save()
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user?.id })
    if (!task) { res.status(404).json({ message: 'Task not found' }); return }
    res.json({ message: 'Task deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const removeParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user!.id })
    if (!task) { res.status(404).json({ message: 'Task not found' }); return }
    task.participants = task.participants.filter(p => !p.userId.equals(req.params.userId))
    task.markModified('participants')
    await task.save()
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
}

export const leaveTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, participants: { $elemMatch: { userId, accepted: true } } },
      { $pull: { participants: { userId } } },
      { new: true }
    )
    if (!task) { res.status(404).json({ message: 'Task not found' }); return }
    res.json({ message: 'Left task' })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const getPublicCompletionPhotos = async (_req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({ 'completionPhotos.isPublic': true }).populate('user', 'username').populate('goal', 'title category targetDate')
    const photos: any[] = []
    for (const task of tasks) {
      const publicPhotos = task.completionPhotos.filter(p => p.isPublic)
      for (const photo of publicPhotos) {
        const totalOccurrences = countOccurrences(task)
        const completedCount = task.completedDates.length
        photos.push({
          taskId: task._id,
          taskTitle: task.title,
          goal: task.goal,
          user: task.user,
          date: photo.date,
          photoData: photo.photoData,
          completedCount,
          totalOccurrences,
          goalId: task.goal ? String((task.goal as any)._id) : undefined,
          progressPercent: totalOccurrences > 0 ? Math.min(100, Math.round((completedCount / totalOccurrences) * 100)) : 0,
        })
      }
    }
    photos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    res.json(photos)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}
