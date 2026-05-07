import { Router } from 'express'
import { getTasks, createTask, updateTask, deleteTask, completeTaskDate, skipTaskDate, toggleSubTaskDate, updateDateSubTasks, getPublicCompletionPhotos } from '../controllers/task.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

router.get('/public-photos', getPublicCompletionPhotos)
router.use(protect)
router.get('/', getTasks)
router.post('/', createTask)
router.put('/:id', updateTask)
router.post('/:id/complete-date', completeTaskDate)
router.post('/:id/skip-date', skipTaskDate)
router.post('/:id/subtask-date', toggleSubTaskDate)
router.post('/:id/date-subtasks', updateDateSubTasks)
router.delete('/:id', deleteTask)

export default router
