import { Router } from 'express'
import { getUserPublicProfile } from '../controllers/users.controller'

const router = Router()

router.get('/:id/public', getUserPublicProfile)

export default router
