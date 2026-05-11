import { Request, Response } from 'express'
import Challenge from '../models/Challenge'

export const getChallenges = async (req: Request, res: Response): Promise<void> => {
  try {
    const challenges = await Challenge.find({ user: req.user?.id }).sort({ createdAt: -1 })
    res.json(challenges)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
}

export const createChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const challenge = await Challenge.create({ ...req.body, user: req.user?.id })
    res.status(201).json(challenge)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
}

export const toggleDay = async (req: Request, res: Response): Promise<void> => {
  try {
    const { day } = req.body
    const challenge = await Challenge.findOne({ _id: req.params.id, user: req.user?.id })
    if (!challenge) { res.status(404).json({ message: 'Challenge not found' }); return }

    const idx = challenge.completedDays.indexOf(day)
    if (idx > -1) challenge.completedDays.splice(idx, 1)
    else challenge.completedDays.push(day)
    await challenge.save()
    res.json(challenge)
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
}

export const deleteChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    await Challenge.findOneAndDelete({ _id: req.params.id, user: req.user?.id })
    res.json({ message: 'Challenge deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
}