import { Router } from 'express'
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import { asyncHandler } from '../utils/asyncHandler.js'
import { completeWorkout, getTodayWorkout } from '../controllers/workoutController.js'

const router = Router()

router.use(ClerkExpressRequireAuth())
router.get('/today', asyncHandler(getTodayWorkout))
router.post('/:id/complete', asyncHandler(completeWorkout))

export default router
