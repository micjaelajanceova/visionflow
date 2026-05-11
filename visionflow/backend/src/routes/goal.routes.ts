import { Router } from 'express'
import { getGoals, getPublicGoals, getPublicDoneGoals, getGoalById, createGoal, updateGoal, markGoalDone, deleteGoal } from '../controllers/goal.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Goals
 *   description: Goal management
 */

/**
 * @swagger
 * /api/goals/public:
 *   get:
 *     summary: Get all public goals
 *     tags: [Goals]
 *     responses:
 *       200:
 *         description: List of public goals
 */
router.get('/public', getPublicGoals)

/**
 * @swagger
 * /api/goals/public-done:
 *   get:
 *     summary: Get all publicly completed goals
 *     tags: [Goals]
 *     responses:
 *       200:
 *         description: List of publicly completed goals
 */
router.get('/public-done', getPublicDoneGoals)

router.use(protect)

/**
 * @swagger
 * /api/goals:
 *   get:
 *     summary: Get all goals for the logged-in user
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user goals
 *       401:
 *         description: Unauthorized
 */
router.get('/', getGoals)

/**
 * @swagger
 * /api/goals:
 *   post:
 *     summary: Create a new goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, category, trackingType, targetDate]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category:
 *                 type: string
 *                 enum: [Health, Career, Finance, Education, Personal, Other]
 *               trackingType:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *               targetDate: { type: string, format: date }
 *               isPublic: { type: boolean }
 *               imageData: { type: string }
 *     responses:
 *       201:
 *         description: Goal created
 *       401:
 *         description: Unauthorized
 */
router.post('/', createGoal)

/**
 * @swagger
 * /api/goals/{id}:
 *   get:
 *     summary: Get a single goal by ID
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Goal data
 *       404:
 *         description: Goal not found
 */
router.get('/:id', getGoalById)

/**
 * @swagger
 * /api/goals/{id}:
 *   put:
 *     summary: Update a goal
 *     tags: [Goals]
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
 *               title: { type: string }
 *               description: { type: string }
 *               category:
 *                 type: string
 *                 enum: [Health, Career, Finance, Education, Personal, Other]
 *               trackingType:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *               targetDate: { type: string, format: date }
 *               isPublic: { type: boolean }
 *               imageData: { type: string }
 *     responses:
 *       200:
 *         description: Updated goal
 *       404:
 *         description: Goal not found
 */
router.put('/:id', updateGoal)

/**
 * @swagger
 * /api/goals/{id}/done:
 *   post:
 *     summary: Mark a goal as completed
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               donePhoto: { type: string, description: Base64 photo }
 *               isDonePublic: { type: boolean }
 *     responses:
 *       200:
 *         description: Goal marked as done
 *       404:
 *         description: Goal not found
 */
router.post('/:id/done', markGoalDone)

/**
 * @swagger
 * /api/goals/{id}:
 *   delete:
 *     summary: Delete a goal and its linked tasks
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Goal deleted
 *       404:
 *         description: Goal not found
 */
router.delete('/:id', deleteGoal)

export default router
