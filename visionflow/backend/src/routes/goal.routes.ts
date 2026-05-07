import { Router } from 'express'
import { getGoals, getPublicGoals, getPublicDoneGoals, getGoalById, createGoal, updateGoal, markGoalDone, deleteGoal } from '../controllers/goal.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

router.get('/public', getPublicGoals)
router.get('/public-done', getPublicDoneGoals)
router.use(protect)
router.get('/', getGoals)
router.post('/', createGoal)
router.get('/:id', getGoalById)
router.put('/:id', updateGoal)
router.post('/:id/done', markGoalDone)
router.delete('/:id', deleteGoal)

export default router
