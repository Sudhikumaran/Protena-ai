import { Router } from 'express'
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import { asyncHandler } from '../utils/asyncHandler.js'
import { generatePlan, getCoachingBrief, getMealSuggestion } from '../controllers/aiController.js'
import { aiRateLimiter } from '../middleware/rateLimiter.js'
import { validateRequest, mealSuggestionSchema, planGenerationSchema } from '../schemas/athleteSchemas.js'

const router = Router()

router.use(ClerkExpressRequireAuth())
router.use(aiRateLimiter)

router.get('/coaching-brief', asyncHandler(getCoachingBrief))
router.post('/meal-suggestion', validateRequest(mealSuggestionSchema), asyncHandler(getMealSuggestion))
router.post('/plan', validateRequest(planGenerationSchema), asyncHandler(generatePlan))

export default router
