import { Request, Response } from 'express'
import Goal from '../models/Goal'
import Task from '../models/Task'

// Maximum number of goals a single user can create
const GOAL_LIMIT = 100

// GET /api/goals — returns all goals for the logged-in user
export const getGoals = async (req: Request, res: Response): Promise<void> => {
  try {
    const goals = await Goal.find({ user: req.user?.id }).sort({ createdAt: -1 })
    res.json(goals)
  } catch (error) {
    res.status(500).json({ message: 'Could not load goals' })
  }
}

// GET /api/goals/public — returns all goals marked as public (used on Explore page)
export const getPublicGoals = async (_req: Request, res: Response): Promise<void> => {
  try {
    const goals = await Goal.find({ isPublic: true }).populate('user', 'username').sort({ createdAt: -1 })
    res.json(goals)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/goals/public-done — returns completed goals shared publicly (used on Explore page)
export const getPublicDoneGoals = async (_req: Request, res: Response): Promise<void> => {
  try {
    const goals = await Goal.find({ isDonePublic: true, isDone: true }).populate('user', 'username').sort({ doneAt: -1 })
    res.json(goals)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/goals/:id — returns a single goal by ID (owner only)
export const getGoalById = async (req: Request, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user?.id })
    if (!goal) { res.status(404).json({ message: 'Goal not found' }); return }
    res.json(goal)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/goals — creates a new goal for the logged-in user
export const createGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await Goal.countDocuments({ user: req.user?.id })
    if (count >= GOAL_LIMIT) {
      res.status(429).json({ message: `Goal limit reached (max ${GOAL_LIMIT}).` })
      return
    }
    // Strip sensitive fields that should never come from the client
    const { user: _u, isAdmin: _a, isBlocked: _b, ...safeBody } = req.body
    const goal = await Goal.create({ ...safeBody, user: req.user?.id })
    res.status(201).json(goal)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// PUT /api/goals/:id — updates a goal; null values are treated as field removals ($unset)
export const updateGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const set: Record<string, unknown> = {}
    const unset: Record<string, 1> = {}

    for (const [key, val] of Object.entries(req.body)) {
      if (val === null) unset[key] = 1 // null = remove the field
      else set[key] = val
    }

    const update: Record<string, unknown> = {}
    if (Object.keys(set).length) update.$set = set
    if (Object.keys(unset).length) update.$unset = unset

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      update,
      { new: true, runValidators: true }
    )
    if (!goal) { res.status(404).json({ message: 'Goal not found' }); return }
    res.json(goal)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/goals/:id/done — marks a goal as completed with optional celebration photo
export const markGoalDone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { donePhoto, isDonePublic } = req.body
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      { isDone: true, doneAt: new Date(), donePhoto, isDonePublic: isDonePublic ?? false },
      { new: true }
    )
    if (!goal) { res.status(404).json({ message: 'Goal not found' }); return }
    res.json(goal)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// DELETE /api/goals/:id — deletes the goal and all its linked tasks
export const deleteGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user?.id })
    if (!goal) { res.status(404).json({ message: 'Goal not found' }); return }
    await Task.deleteMany({ goal: goal._id, user: req.user?.id })
    res.json({ message: 'Goal deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Could not delete goal' })
  }
}
