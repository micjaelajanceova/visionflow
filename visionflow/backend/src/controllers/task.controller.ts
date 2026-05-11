import { Request, Response } from 'express'
import Task from '../models/Task'

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const tasks = await Task.find({ user: req.user?.id }).sort({ createdAt: -1 })
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
}

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.create({ ...req.body, user: req.user?.id })
    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
}

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    // console.log('updating task:', req.params.id)
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!task) { res.status(404).json({ message: 'Task not found' }); return }
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'could not update task', error })
  }
}

export const completeTaskDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, photoData, isPublic } = req.body
    const task = await Task.findOne({ _id: req.params.id, user: req.user?.id })
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
    res.status(500).json({ message: 'Server error', error })
  }
}

export const updateDateSubTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, items } = req.body
    const task = await Task.findOne({ _id: req.params.id, user: req.user?.id })
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
    res.status(500).json({ message: 'Server error', error })
  }
}

export const toggleSubTaskDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, subIndex } = req.body
    const task = await Task.findOne({ _id: req.params.id, user: req.user?.id })
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
    res.status(500).json({ message: 'Server error', error })
  }
}

export const skipTaskDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.body
    const task = await Task.findOne({ _id: req.params.id, user: req.user?.id })
    if (!task) { res.status(404).json({ message: 'Task not found' }); return }
    if (!task.skippedDates.includes(date)) {
      task.skippedDates.push(date)
    } else {
      task.skippedDates = task.skippedDates.filter((d: string) => d !== date)
    }
    await task.save()
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
}

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user?.id })
    if (!task) { res.status(404).json({ message: 'Task not found' }); return }
    res.json({ message: 'Task deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
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
          progressPercent: totalOccurrences > 0 ? Math.round((completedCount / totalOccurrences) * 100) : 0,
        })
      }
    }
    photos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    res.json(photos)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
}

function countOccurrences(task: any): number {
  if (!task.isRecurring || !task.recurringDays?.length || !task.startDate) return 1
  const start = new Date(task.startDate)
  const end = task.goal?.targetDate ? new Date(task.goal.targetDate) : new Date()
  let count = 0
  const cur = new Date(start)
  while (cur <= end) {
    const day = (cur.getDay() + 6) % 7
    if (task.recurringDays.includes(day)) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}
