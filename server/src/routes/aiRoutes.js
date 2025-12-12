import { Router } from 'express'
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import { asyncHandler } from '../utils/asyncHandler.js'
import { generatePlan, getCoachingBrief, getMealSuggestion } from '../controllers/aiController.js'

const router = Router()

router.use(ClerkExpressRequireAuth())
router.get('/coaching-brief', asyncHandler(getCoachingBrief))
router.post('/meal-suggestion', asyncHandler(getMealSuggestion))
router.post('/plan', asyncHandler(generatePlan))

export default router
