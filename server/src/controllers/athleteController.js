import Athlete from '../models/Athlete.js'
import { createBaseAthlete } from '../data/baseAthlete.js'

const buildOverviewPayload = (athlete) => ({
  id: athlete.id,
  user: athlete.profile,
  goalPrescription: athlete.goalPrescription,
  overviewStats: athlete.overviewStats,
  heroBadges: athlete.heroBadges,
  statHighlights: athlete.statHighlights,
  focusCards: athlete.focusCards,
  timeline: athlete.timeline,
  macroSplits: athlete.macroSplits,
  mealLog: athlete.mealLog,
  planTracks: athlete.planTracks,
  quickActions: athlete.quickActions,
  streak: athlete.streak,
})

const findAnalyticsDay = (athlete, query = {}) => {
  const { date, dayId } = query
  return athlete.analyticsDays.find((entry) => {
    if (dayId) return entry.id === dayId
    if (date) return entry.date === date
    return entry
  })
}

const extractEmailFromRequest = (req) => {
  return (
    req.body?.email ||
    req.auth?.sessionClaims?.email ||
    req.auth?.sessionClaims?.email_address ||
    req.auth?.sessionClaims?.primary_email ||
    ''
  )
}

const applyPersonalization = (athleteDoc, payload, options = {}) => {
  const weightValue = Number(payload.weight) || 78
  const heightValue = Number(payload.height)
  const trainingFrequency = Number(payload.trainingFrequency) || 4
  const dietPreference = payload.dietPreference || 'High-protein flex plan'
  const focus = payload.focus || athleteDoc.profile.focus
  const goal = payload.goal || athleteDoc.profile.goal

  athleteDoc.profile = {
    ...athleteDoc.profile,
    name: payload.name || athleteDoc.profile.name,
    email: payload.email || athleteDoc.profile.email,
    focus,
    weight: `${weightValue} kg`,
    goal,
    height: heightValue ? `${heightValue} cm` : athleteDoc.profile.height,
    fitnessLevel:
      trainingFrequency >= 5
        ? 'Elite hybrid'
        : trainingFrequency >= 3
          ? 'Advanced hybrid'
          : 'Rebuild cadence',
    badHabits: payload.badHabits || athleteDoc.profile.badHabits,
  }

  athleteDoc.goalPrescription = {
    ...athleteDoc.goalPrescription,
    calories: `${Math.round(weightValue * 32)} kcal / day`,
    proteinTarget: `${Math.round(weightValue * 2)} g protein`,
    dietPlan: dietPreference,
    workoutPlan: `${trainingFrequency}-day AI rotation`,
    notes:
      payload.notes ||
      `Generated ${new Date().toLocaleDateString()} based on your onboarding answers.`,
  }

  if (Array.isArray(athleteDoc.overviewStats) && athleteDoc.overviewStats.length > 0) {
    athleteDoc.overviewStats = athleteDoc.overviewStats.map((stat, idx) => {
      if (idx === 0) {
        return {
          ...stat,
          value: `${Math.round(weightValue * 1.8)}g`,
          unit: `of ${Math.round(weightValue * 2)}g`,
        }
      }
      if (idx === 1) {
        return {
          ...stat,
          value: `${trainingFrequency} day split`,
          delta: 'Adaptive',
          unit: 'AI scheduled',
        }
      }
      return stat
    })
  }

  athleteDoc.heroBadges = [
    `${goal} mode`,
    `${trainingFrequency}-day cadence`,
    `${dietPreference.replace(' plan', '')} fueled`,
  ]

  if (Array.isArray(athleteDoc.planTracks) && athleteDoc.planTracks.length > 0) {
    athleteDoc.planTracks = athleteDoc.planTracks.map((track, idx) => {
      if (idx === 0) {
        return {
          ...track,
          focus: goal,
          detail: `Dialed for ${trainingFrequency} sessions · ${dietPreference}`,
        }
      }
      return track
    })
  }

  if (options.persistDietPreference && Array.isArray(athleteDoc.macroSplits)) {
    athleteDoc.macroSplits = athleteDoc.macroSplits.map((macro) => {
      if (macro.label === 'Protein') {
        return { ...macro, value: `${Math.round(weightValue * 1.8)}g` }
      }
      return macro
    })
  }

  return athleteDoc
}

const ensureMealFields = ({ title, calories, protein }) => {
  if (!title || !calories || !protein) {
    throw new Error('Title, calories, and protein are required')
  }
}

const normalizeMealArtifacts = (payload = {}) => {
  const {
    title,
    calories,
    protein,
    status = 'manual',
    mealType = 'Snack',
    source = 'manual',
    time,
    dayId,
  } = payload

  ensureMealFields({ title, calories, protein })

  const formattedCalories = typeof calories === 'number' ? `${calories} kcal` : calories
  const numericProtein =
    typeof protein === 'number' ? protein : parseFloat(String(protein)) || protein
  const formattedProtein = typeof numericProtein === 'number' ? `${numericProtein}g` : `${protein}`

  const mealEntry = {
    title,
    calories: formattedCalories,
    protein: formattedProtein,
    status: String(status).toLowerCase(),
    mealType,
  }

  const analyticsMeal = {
    name: title,
    time: time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    calories: formattedCalories,
    protein: typeof numericProtein === 'number' ? `${numericProtein}g protein` : `${protein}`,
    source: String(source || status).toLowerCase(),
    mealType,
  }

  return { mealEntry, analyticsMeal, targetDayId: dayId || 'today' }
}

const appendMealPayload = (athlete, payload = {}) => {
  const { mealEntry, analyticsMeal, targetDayId } = normalizeMealArtifacts(payload)
  athlete.mealLog.unshift(mealEntry)
  const targetDay =
    athlete.analyticsDays.find((entry) => entry.id === targetDayId) || athlete.analyticsDays[0]
  if (targetDay) {
    targetDay.meals.unshift(analyticsMeal)
  }
  return mealEntry
}

export async function getAthleteOverview(req, res, next) {
  try {
    const athlete = await Athlete.findById(req.params.id)
    if (!athlete) return res.status(404).json({ message: 'Athlete not found' })

    res.json(buildOverviewPayload(athlete))
  } catch (error) {
    next(error)
  }
}

export async function getAthleteDay(req, res, next) {
  try {
    const { id } = req.params
    const { all } = req.query

    const athlete = await Athlete.findById(id)
    if (!athlete) return res.status(404).json({ message: 'Athlete not found' })

    if (all === 'true') {
      return res.json({ days: athlete.analyticsDays })
    }

    const day = findAnalyticsDay(athlete, req.query)

    if (!day) return res.status(404).json({ message: 'No analytics for selected day' })
    res.json(day)
  } catch (error) {
    next(error)
  }
}

export async function addAthleteMeal(req, res, next) {
  try {
    const { id } = req.params
    const athlete = await Athlete.findById(id)
    if (!athlete) return res.status(404).json({ message: 'Athlete not found' })

    let mealEntry
    try {
      mealEntry = appendMealPayload(athlete, req.body)
    } catch (validationError) {
      return res.status(400).json({ message: validationError.message })
    }

    await athlete.save()

    res.status(201).json({
      meal: mealEntry,
      mealLog: athlete.mealLog,
      analyticsDays: athlete.analyticsDays,
    })
  } catch (error) {
    next(error)
  }
}

export async function addCurrentAthleteMeal(req, res, next) {
  try {
    const clerkUserId = req.auth?.userId
    if (!clerkUserId) {
      return res.status(401).json({ message: 'Missing authenticated user' })
    }

    const athlete = await Athlete.findOne({ clerkUserId })
    if (!athlete) return res.status(404).json({ message: 'Athlete not found' })

    let mealEntry
    try {
      mealEntry = appendMealPayload(athlete, req.body)
    } catch (validationError) {
      return res.status(400).json({ message: validationError.message })
    }

    await athlete.save()

    res.status(201).json({
      meal: mealEntry,
      mealLog: athlete.mealLog,
      analyticsDays: athlete.analyticsDays,
    })
  } catch (error) {
    next(error)
  }
}

export async function getCurrentAthleteOverview(req, res, next) {
  try {
    const clerkUserId = req.auth?.userId
    const athlete = await Athlete.findOne({ clerkUserId })
    if (!athlete) return res.status(404).json({ message: 'Athlete not found' })
    res.json(buildOverviewPayload(athlete))
  } catch (error) {
    next(error)
  }
}

export async function getCurrentAthleteDay(req, res, next) {
  try {
    const clerkUserId = req.auth?.userId
    const { all } = req.query
    const athlete = await Athlete.findOne({ clerkUserId })
    if (!athlete) return res.status(404).json({ message: 'Athlete not found' })

    if (all === 'true') {
      return res.json({ days: athlete.analyticsDays })
    }

    const day = findAnalyticsDay(athlete, req.query)
    if (!day) return res.status(404).json({ message: 'No analytics for selected day' })
    res.json(day)
  } catch (error) {
    next(error)
  }
}

export async function upsertCurrentAthlete(req, res, next) {
  try {
    const clerkUserId = req.auth?.userId
    if (!clerkUserId) {
      return res.status(401).json({ message: 'Missing authenticated user' })
    }

    const emailFromRequest = extractEmailFromRequest(req)
    const {
      name,
      weight,
      height,
      focus,
      goal,
      dietPreference,
      trainingFrequency,
      badHabits,
    } = req.body || {}

    if (!name || !weight || !goal) {
      return res.status(400).json({ message: 'Name, weight, and goal are required' })
    }

    let athlete = await Athlete.findOne({ clerkUserId })
    const personalizationPayload = {
      name,
      email: emailFromRequest,
      weight,
      height,
      focus,
      goal,
      dietPreference,
      trainingFrequency,
      badHabits,
    }

    if (athlete) {
      applyPersonalization(athlete, personalizationPayload, { persistDietPreference: true })
      await athlete.save()
      return res.json({
        ...buildOverviewPayload(athlete),
        analyticsDays: athlete.analyticsDays,
      })
    }

    const template = createBaseAthlete()
    template.clerkUserId = clerkUserId
    applyPersonalization(template, personalizationPayload, { persistDietPreference: true })
    athlete = await Athlete.create(template)

    return res.status(201).json({
      ...buildOverviewPayload(athlete),
      analyticsDays: athlete.analyticsDays,
    })
  } catch (error) {
    next(error)
  }
}
