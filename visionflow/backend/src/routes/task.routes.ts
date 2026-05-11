import { Router } from 'express'
import { getTasks, createTask, updateTask, deleteTask, leaveTask, completeTaskDate, skipTaskDate, toggleSubTaskDate, updateDateSubTasks, getPublicCompletionPhotos, getPendingInvites, inviteToTask, respondToInvite } from '../controllers/task.controller'
import { protect } from '../middleware/auth.middleware'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management
 */

/**
 * @swagger
 * /api/tasks/public-photos:
 *   get:
 *     summary: Get all public task completion photos
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of public completion photos
 */
router.get('/public-photos', getPublicCompletionPhotos)

router.use(protect)

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks for the logged-in user (own + accepted shared)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 */
router.get('/', getTasks)

/**
 * @swagger
 * /api/tasks/invites/pending:
 *   get:
 *     summary: Get pending task share invites for the logged-in user
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending invites
 */
router.get('/invites/pending', getPendingInvites)

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               dueDate: { type: string, format: date }
 *               startDate: { type: string, format: date }
 *               endDate: { type: string, format: date }
 *               isAllDay: { type: boolean }
 *               time: { type: string }
 *               endTime: { type: string }
 *               isRecurring: { type: boolean }
 *               recurringDays: { type: array, items: { type: integer } }
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               goal: { type: string, description: Goal ID }
 *     responses:
 *       201:
 *         description: Task created
 *       401:
 *         description: Unauthorized
 */
router.post('/', createTask)

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task (full update for owner, content-only for participants)
 *     tags: [Tasks]
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
 *               completed: { type: boolean }
 *               dueDate: { type: string, format: date }
 *               isAllDay: { type: boolean }
 *               time: { type: string }
 *     responses:
 *       200:
 *         description: Updated task
 *       404:
 *         description: Task not found
 */
router.put('/:id', updateTask)

/**
 * @swagger
 * /api/tasks/{id}/invite:
 *   post:
 *     summary: Invite a user to share a task
 *     tags: [Tasks]
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
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Invite sent
 *       404:
 *         description: Task or user not found
 */
router.post('/:id/invite', inviteToTask)

/**
 * @swagger
 * /api/tasks/{id}/invite/respond:
 *   put:
 *     summary: Accept or decline a task share invite
 *     tags: [Tasks]
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
 *             required: [accept]
 *             properties:
 *               accept: { type: boolean }
 *     responses:
 *       200:
 *         description: Response recorded
 *       404:
 *         description: Invite not found
 */
router.put('/:id/invite/respond', respondToInvite)

/**
 * @swagger
 * /api/tasks/{id}/complete-date:
 *   post:
 *     summary: Toggle completion for a specific date on a recurring task
 *     tags: [Tasks]
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
 *             required: [date]
 *             properties:
 *               date: { type: string, format: date }
 *               photoData: { type: string, description: Base64 photo }
 *               isPublic: { type: boolean }
 *     responses:
 *       200:
 *         description: Updated task
 */
router.post('/:id/complete-date', completeTaskDate)

/**
 * @swagger
 * /api/tasks/{id}/skip-date:
 *   post:
 *     summary: Skip a specific date on a recurring task
 *     tags: [Tasks]
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
 *             required: [date]
 *             properties:
 *               date: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Updated task
 */
router.post('/:id/skip-date', skipTaskDate)

/**
 * @swagger
 * /api/tasks/{id}/subtask-date:
 *   post:
 *     summary: Toggle a subtask checkbox for a specific date
 *     tags: [Tasks]
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
 *             required: [date, subIndex]
 *             properties:
 *               date: { type: string, format: date }
 *               subIndex: { type: integer }
 *     responses:
 *       200:
 *         description: Updated task
 */
router.post('/:id/subtask-date', toggleSubTaskDate)

/**
 * @swagger
 * /api/tasks/{id}/date-subtasks:
 *   post:
 *     summary: Save the checklist items for a specific date on a recurring task
 *     tags: [Tasks]
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
 *             required: [date, items]
 *             properties:
 *               date: { type: string, format: date }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title: { type: string }
 *                     completed: { type: boolean }
 *     responses:
 *       200:
 *         description: Updated task
 */
router.post('/:id/date-subtasks', updateDateSubTasks)

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task (owner only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
router.delete('/:id', deleteTask)
router.delete('/:id/leave', leaveTask)

export default router
