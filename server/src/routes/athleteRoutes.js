import { Router } from 'express'
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import {
	addAthleteMeal,
	addCurrentAthleteMeal,
	getAthleteDay,
	getAthleteOverview,
	getCurrentAthleteDay,
	getCurrentAthleteOverview,
	upsertCurrentAthlete,
} from '../controllers/athleteController.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { validateRequest, onboardingSchema, mealSchema } from '../schemas/athleteSchemas.js'

const router = Router()

router.use(ClerkExpressRequireAuth())

router.get('/me/overview', asyncHandler(getCurrentAthleteOverview))
router.get('/me/daily', asyncHandler(getCurrentAthleteDay))
router.post('/me', validateRequest(onboardingSchema), asyncHandler(upsertCurrentAthlete))
router.post('/me/meals', validateRequest(mealSchema), asyncHandler(addCurrentAthleteMeal))

router.get('/:id/overview', asyncHandler(getAthleteOverview))
router.get('/:id/daily', asyncHandler(getAthleteDay))
router.post('/:id/meals', validateRequest(mealSchema), asyncHandler(addAthleteMeal))

export default router
