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

const router = Router()

router.use(ClerkExpressRequireAuth())

router.get('/me/overview', asyncHandler(getCurrentAthleteOverview))
router.get('/me/daily', asyncHandler(getCurrentAthleteDay))
router.post('/me', asyncHandler(upsertCurrentAthlete))
router.post('/me/meals', asyncHandler(addCurrentAthleteMeal))

router.get('/:id/overview', asyncHandler(getAthleteOverview))
router.get('/:id/daily', asyncHandler(getAthleteDay))
router.post('/:id/meals', asyncHandler(addAthleteMeal))

export default router
