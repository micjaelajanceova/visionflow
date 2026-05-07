import { Request, Response } from 'express'
import Progress from '../models/Progress'

export const getProgressByGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const entries = await Progress.find({ goal: req.params.goalId, user: req.user?.id }).sort({ date: -1 })
    res.json(entries)
  } catch (error) {
    res.status(500).json({ message: 'could not load progress', error })
  }
}

export const createProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const entry = await Progress.create({ ...req.body, user: req.user?.id })
    res.status(201).json(entry)
  } catch (error) {
    res.status(500).json({ message: 'could not save progress entry', error })
  }
}

export const updateProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const entry = await Progress.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      req.body,
      { new: true }
    )
    if (!entry) { res.status(404).json({ message: 'Progress entry not found' }); return }
    res.json(entry)
  } catch (error) {
    res.status(500).json({ message: 'something went wrong', error })
  }
}

export const deleteProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    await Progress.findOneAndDelete({ _id: req.params.id, user: req.user?.id })
    res.json({ message: 'deleted' })
  } catch (error) {
    res.status(500).json({ message: 'something went wrong', error })
  }
}