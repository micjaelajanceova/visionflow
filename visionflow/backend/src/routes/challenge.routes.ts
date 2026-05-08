import { Router } from 'express'
import { getChallenges, createChallenge, toggleDay, deleteChallenge } from '../controllers/challenge.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()
router.use(protect)

router.get('/', getChallenges)
router.post('/', createChallenge)
router.patch('/:id/toggle', toggleDay)
router.delete('/:id', deleteChallenge)

export default router