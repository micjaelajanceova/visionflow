import { Router } from 'express'
import { deleteTaskPhoto, deleteGoalPhoto, setUserBlocked, getUsers } from '../controllers/admin.controller'
import { protect } from '../middleware/auth.middleware'
import { adminOnly } from '../middleware/admin.middleware'

const router = Router()

router.use(protect, adminOnly)

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only operations
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of users }
 *       403: { description: Admin access required }
 */
router.get('/users', getUsers)

/**
 * @swagger
 * /api/admin/users/{userId}/block:
 *   put:
 *     summary: Block or unblock a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [blocked]
 *             properties:
 *               blocked: { type: boolean }
 *     responses:
 *       200: { description: User blocked or unblocked }
 *       403: { description: Admin access required }
 *       404: { description: User not found }
 */
router.put('/users/:userId/block', setUserBlocked)

/**
 * @swagger
 * /api/admin/tasks/{taskId}/photo/{date}:
 *   delete:
 *     summary: Delete a task completion photo (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: date
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Photo deleted }
 *       403: { description: Admin access required }
 */
router.delete('/tasks/:taskId/photo/:date', deleteTaskPhoto)

/**
 * @swagger
 * /api/admin/goals/{goalId}/photo:
 *   delete:
 *     summary: Delete a goal completion photo (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Photo deleted }
 *       403: { description: Admin access required }
 */
router.delete('/goals/:goalId/photo', deleteGoalPhoto)

export default router
