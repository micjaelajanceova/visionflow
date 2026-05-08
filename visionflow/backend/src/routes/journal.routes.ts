import { Router } from 'express'
import { getJournals, createJournal, updateJournal, deleteJournal } from '../controllers/journal.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()
router.use(protect)

router.get('/', getJournals)
router.post('/', createJournal)
router.put('/:id', updateJournal)
router.delete('/:id', deleteJournal)

export default router