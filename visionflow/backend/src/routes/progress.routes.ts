import { Router } from 'express'
import { getProgressByGoal, createProgress, updateProgress, deleteProgress } from '../controllers/progress.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()
router.use(protect)

router.get('/goal/:goalId', getProgressByGoal)
router.post('/', createProgress)
router.put('/:id', updateProgress)
router.delete('/:id', deleteProgress)

export default router