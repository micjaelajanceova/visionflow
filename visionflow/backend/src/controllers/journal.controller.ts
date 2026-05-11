import { Request, Response } from 'express'
import Journal from '../models/Journal'

export const getJournals = async (req: Request, res: Response): Promise<void> => {
  try {
    const entries = await Journal.find({ user: req.user?.id }).populate('goal', 'title').sort({ createdAt: -1 })
    res.json(entries)
  } catch (error) {
    res.status(500).json({ message: 'could not load journals', error })
  }
}

export const createJournal = async (req: Request, res: Response): Promise<void> => {
  try {
    const entry = await Journal.create({ ...req.body, user: req.user?.id })
    res.status(201).json(entry)
  } catch (error) {
    res.status(500).json({ message: 'could not create journal entry', error })
  }
}

export const updateJournal = async (req: Request, res: Response): Promise<void> => {
  try {
    const entry = await Journal.findOneAndUpdate(
      { _id: req.params.id, user: req.user?.id },
      req.body,
      { new: true }
    )
    if (!entry) { res.status(404).json({ message: 'Journal entry not found' }); return }
    res.json(entry)
  } catch (error) {
    res.status(500).json({ message: 'something went wrong', error })
  }
}

export const deleteJournal = async (req: Request, res: Response): Promise<void> => {
  try {
    await Journal.findOneAndDelete({ _id: req.params.id, user: req.user?.id })
    res.json({ message: 'deleted' })
  } catch (error) {
    res.status(500).json({ message: 'something went wrong', error })
  }
}