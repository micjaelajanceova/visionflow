import { Router } from 'express'
import { getProgressByGoal, createProgress, updateProgress, deleteProgress } from '../controllers/progress.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Progress
 *   description: Progress tracking per goal
 */

router.use(protect)

/**
 * @swagger
 * /api/progress/goal/{goalId}:
 *   get:
 *     summary: Get all progress entries for a specific goal
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: goalId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of progress entries
 *       401:
 *         description: Unauthorized
 */
router.get('/goal/:goalId', getProgressByGoal)

/**
 * @swagger
 * /api/progress:
 *   post:
 *     summary: Create a new progress entry
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [goal, date]
 *             properties:
 *               goal: { type: string, description: Goal ID }
 *               date: { type: string, format: date }
 *               completed: { type: boolean }
 *               note: { type: string }
 *     responses:
 *       201:
 *         description: Progress entry created
 *       401:
 *         description: Unauthorized
 */
router.post('/', createProgress)

/**
 * @swagger
 * /api/progress/{id}:
 *   put:
 *     summary: Update a progress entry
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed: { type: boolean }
 *               note: { type: string }
 *     responses:
 *       200:
 *         description: Updated progress entry
 *       404:
 *         description: Progress entry not found
 */
router.put('/:id', updateProgress)

/**
 * @swagger
 * /api/progress/{id}:
 *   delete:
 *     summary: Delete a progress entry
 *     tags: [Progress]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', deleteProgress)

export default router
