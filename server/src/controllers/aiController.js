import { randomUUID } from 'crypto'
import Athlete from '../models/Athlete.js'
import { generateChatCompletion } from '../services/aiClient.js'

const mealFallbacks = [
  { title: 'Paneer bhurji + roti', calories: 410, protein: 24, carbs: 32, fats: 18, mealType: 'Breakfast' },
  { title: 'Masala dosa + sambar', calories: 350, protein: 12, carbs: 54, fats: 10, mealType: 'Breakfast' },
  { title: 'Rajma chawal bowl', calories: 480, protein: 18, carbs: 78, fats: 8, mealType: 'Lunch' },
  { title: 'Grilled tandoori chicken salad', calories: 320, protein: 36, carbs: 14, fats: 12, mealType: 'Dinner' },
  { title: 'Poha + peanuts', calories: 290, protein: 9, carbs: 44, fats: 8, mealType: 'Snack' },
  { title: 'Chana chaat', calories: 260, protein: 11, carbs: 36, fats: 6, mealType: 'Snack' },
]

const buildAthleteSnapshot = (athleteDoc) => {
  if (!athleteDoc) return {}
  return {
    profile: athleteDoc.profile,
    goalPrescription: athleteDoc.goalPrescription,
    overviewStats: athleteDoc.overviewStats,
    planTracks: athleteDoc.planTracks,
    macroSplits: athleteDoc.macroSplits,
    heroBadges: athleteDoc.heroBadges,
    timeline: athleteDoc.timeline?.slice(0, 4) || [],
    analyticsHighlights: athleteDoc.analyticsDays?.slice(0, 3)?.map((day) => ({
      id: day.id,
      date: day.date,
      readiness: day.readiness,
      streakRisk: day.streakRisk,
      nutritionGap: day.nutritionGap,
    })),
    recentMeals: athleteDoc.mealLog?.slice(0, 3) || [],
  }
}

const normalizeSections = (sections) => {
  if (!Array.isArray(sections)) return []
  return sections
    .filter(Boolean)
    .slice(0, 4)
    .map((section, idx) => ({
      title: section.title || `Priority ${idx + 1}`,
      detail: section.detail || section.summary || 'Stay consistent and monitor signals.',
      actions: Array.isArray(section.actions) && section.actions.length
        ? section.actions.slice(0, 4)
        : (section.action ? [section.action] : []),
    }))
}

const buildFallbackBrief = (athleteDoc) => {
  const snapshot = buildAthleteSnapshot(athleteDoc)
  const primaryGoal = snapshot?.profile?.goal || 'Hybrid performance'
  const readiness = snapshot?.analyticsHighlights?.[0]?.readiness || 'steady'
  return {
    summary: `Hold the ${primaryGoal.toLowerCase()} lane today. Readiness looks ${readiness}, so keep intensity smooth while watching protein pacing.`,
    sections: [
      {
        title: 'Training focus',
        detail: 'Anchor on quality reps over volume. Layer accessory work only if energy feels high.',
        actions: ['Lock warm-up, then push main lift to RPE 8.', 'Stop if tempo breaks down.'],
      },
      {
        title: 'Fueling window',
        detail: 'Distribute protein evenly and cover carbs 60 minutes pre-session.',
        actions: ['30g protein breakfast', 'Hydrate + electrolytes before lifting'],
      },
      {
        title: 'Recovery ritual',
        detail: 'Downshift after training to preserve streak confidence.',
        actions: ['10-minute breath or walk', 'Log sleep cues tonight'],
      },
    ],
    priorityScore: 60,
  }
}

const sanitizeNumber = (value, fallback = 0) => {
  const num = Number(value)
  if (Number.isFinite(num)) return num
  if (typeof value === 'string') {
    const extracted = Number(value.replace(/[^0-9.]/g, ''))
    if (Number.isFinite(extracted)) return extracted
  }
  return fallback
}

const pickRelatedQueries = (title) => {
  const shuffled = mealFallbacks
    .filter((meal) => meal.title !== title)
    .map((item) => item.title)
  return shuffled.slice(0, 4)
}

const buildFallbackMealSuggestion = (query = '', mealType) => {
  const normalizedQuery = query.toLowerCase()
  const match = mealFallbacks.find((meal) => meal.title.toLowerCase().includes(normalizedQuery))
  const baseMeal = match || mealFallbacks[0]
  return {
    ...baseMeal,
    mealType: mealType || baseMeal.mealType,
    serving: '1 standard plate',
    ingredients: [
      { name: 'Protein base', quantity: '120 g', calories: 180, protein: 22 },
      { name: 'Carb support', quantity: '100 g', calories: 150, protein: 4 },
      { name: 'Healthy fats', quantity: '15 g', calories: 135, protein: 0 },
    ],
    notes: 'Based on curated macro tables while AI service is offline.',
    confidence: 0.55,
    relatedQueries: pickRelatedQueries(baseMeal.title),
  }
}

const normalizeIngredients = (items, fallback = []) => {
  if (!Array.isArray(items) || !items.length) return fallback
  return items.slice(0, 5).map((item, idx) => ({
    name: item?.name || `Ingredient ${idx + 1}`,
    quantity: item?.quantity || item?.portion || 'N/A',
    calories: sanitizeNumber(item?.calories, 0),
    protein: sanitizeNumber(item?.protein, 0),
  }))
}

const normalizeRelatedQueries = (items, fallback = []) => {
  if (!Array.isArray(items)) return fallback
  return items
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean)
    .slice(0, 5)
}

const normalizePlanBlocks = (blocks = []) => {
  if (!Array.isArray(blocks)) return []
  return blocks.slice(0, 7).map((block, idx) => ({
    day: block.day || `Day ${idx + 1}`,
    focus: block.focus || 'Hybrid strength',
    intensity: block.intensity || 'Moderate',
    duration: block.duration || '60 min',
    primary: block.primary || 'Compound lift clusters',
    accessory: block.accessory || 'Accessory work + conditioning',
    conditioning: block.conditioning || 'Zone 2 flush',
    notes: block.notes || 'Keep tempo honest and log RPE.',
  }))
}

const buildDailyWorkoutsFromPlan = (normalizedPlan = []) => {
  const start = new Date()
  return normalizedPlan.map((block, idx) => {
    const scheduledDate = new Date(start)
    scheduledDate.setDate(start.getDate() + idx)
    const scheduledFor = scheduledDate.toISOString().split('T')[0]
    return {
      id: randomUUID(),
      day: block.day,
      focus: block.focus,
      intensity: block.intensity,
      duration: block.duration,
      scheduledFor,
      segments: [
        { title: 'Primary', detail: block.primary },
        { title: 'Accessory', detail: block.accessory },
        { title: 'Conditioning', detail: block.conditioning },
      ],
      notes: block.notes,
      completed: false,
    }
  })
}

export async function getCoachingBrief(req, res, next) {
  try {
    const clerkUserId = req.auth?.userId
    if (!clerkUserId) {
      return res.status(401).json({ message: 'Missing authenticated user' })
    }

    const athlete = await Athlete.findOne({ clerkUserId })
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' })
    }

    const snapshot = buildAthleteSnapshot(athlete)
    const systemPrompt =
      'You are an elite hybrid performance coach who writes concise, high-impact daily briefs. Always return valid JSON with summary, sections, and priorityScore between 0 and 100. Tone is calm, confident, and specific.'

    const userPrompt = `Create a daily coaching brief. Use this athlete snapshot to reference current load and gaps. Respond ONLY with JSON matching the schema {"summary": string, "sections": [{"title": string, "detail": string, "actions": [string]}], "priorityScore": number}. Snapshot: ${JSON.stringify(snapshot)}`

    let aiContent
    try {
      const aiResponse = await generateChatCompletion({ systemPrompt, userPrompt })
      aiContent = aiResponse.content
    } catch (aiError) {
      if (aiError?.statusCode === 503) throw aiError
      const fallback = buildFallbackBrief(athlete)
      fallback.meta = { providerError: aiError.message }
      return res.status(200).json({
        ...fallback,
        generatedAt: new Date().toISOString(),
        source: 'fallback',
      })
    }

    let briefPayload = null
    try {
      briefPayload = JSON.parse(aiContent)
    } catch (parseError) {
      const fallback = buildFallbackBrief(athlete)
      fallback.meta = { providerError: parseError.message }
      return res.status(200).json({
        ...fallback,
        generatedAt: new Date().toISOString(),
        source: 'fallback',
      })
    }

    const responsePayload = {
      summary: briefPayload?.summary || 'Hold course and stay attentive to protein pacing today.',
      sections: normalizeSections(briefPayload?.sections),
      priorityScore: Number(briefPayload?.priorityScore) || 55,
      generatedAt: new Date().toISOString(),
      source: 'ai',
    }

    res.json(responsePayload)
  } catch (error) {
    if (error?.statusCode === 503) {
      return res.status(503).json({
        message: 'AI features disabled. Provide OPENAI_API_KEY to enable coaching briefs.',
      })
    }
    next(error)
  }
}

export async function getMealSuggestion(req, res, next) {
  try {
    const clerkUserId = req.auth?.userId
    if (!clerkUserId) {
      return res.status(401).json({ message: 'Missing authenticated user' })
    }

    const validatedData = req.validatedBody || req.body
    const { query, mealType } = validatedData

    const athlete = await Athlete.findOne({ clerkUserId })
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' })
    }

    const snapshot = buildAthleteSnapshot(athlete)
    const caloriesTarget = sanitizeNumber(snapshot?.goalPrescription?.calories, 2300)
    const proteinTarget = sanitizeNumber(snapshot?.goalPrescription?.proteinTarget, 140)
    const macroSummary = snapshot?.macroSplits
      ?.map((macro) => `${macro.label}: ${macro.value}`)
      ?.join(', ')
    const recentMeals = snapshot?.recentMeals || []

    const systemPrompt =
      'You are a precision sports nutrition assistant for hybrid athletes. Respond ONLY with JSON describing one meal suggestion, macros, ingredients, and 3-5 related search ideas.'
    const userPrompt = `Suggest a meal named "${query}" (or closest variant) for meal type ${mealType || 'unspecified'}.
Athlete daily targets: ${caloriesTarget} kcal, ${proteinTarget} g protein. Current macro distribution: ${macroSummary}.
Recent meals: ${JSON.stringify(recentMeals)}.
Return JSON with schema {"title": string, "calories": number, "protein": number, "carbs": number, "fats": number, "mealType": string, "serving": string, "ingredients": [{"name": string, "quantity": string, "calories": number, "protein": number}], "notes": string, "confidence": number between 0 and 1, "relatedQueries": [string, string, ...]}. Use realistic grams for Indian meals when possible.`

    let aiContent
    try {
      const aiResponse = await generateChatCompletion({ systemPrompt, userPrompt })
      aiContent = aiResponse.content
    } catch (aiError) {
      if (aiError?.statusCode === 503) throw aiError
      const fallback = buildFallbackMealSuggestion(query, mealType)
      return res.status(200).json({
        ...fallback,
        source: 'fallback',
        generatedAt: new Date().toISOString(),
        meta: { providerError: aiError.message },
      })
    }

    let payload
    try {
      payload = JSON.parse(aiContent)
    } catch (parseError) {
      const fallback = buildFallbackMealSuggestion(query, mealType)
      return res.status(200).json({
        ...fallback,
        source: 'fallback',
        generatedAt: new Date().toISOString(),
        meta: { providerError: parseError.message },
      })
    }

    const fallback = buildFallbackMealSuggestion(query, mealType)
    const responsePayload = {
      title: payload?.title || query,
      calories: sanitizeNumber(payload?.calories, fallback.calories),
      protein: sanitizeNumber(payload?.protein, fallback.protein),
      carbs: sanitizeNumber(payload?.carbs, fallback.carbs),
      fats: sanitizeNumber(payload?.fats, fallback.fats),
      mealType: payload?.mealType || mealType || fallback.mealType,
      serving: payload?.serving || fallback.serving,
      ingredients: normalizeIngredients(payload?.ingredients, fallback.ingredients),
      notes: payload?.notes || fallback.notes,
      confidence: Math.min(Math.max(Number(payload?.confidence ?? fallback.confidence), 0), 1),
      relatedQueries: normalizeRelatedQueries(payload?.relatedQueries, fallback.relatedQueries),
      generatedAt: new Date().toISOString(),
      source: 'ai',
    }

    res.json(responsePayload)
  } catch (error) {
    if (error?.statusCode === 503) {
      return res.status(503).json({
        message: 'AI features disabled. Provide OPENAI_API_KEY to enable meal intelligence.',
      })
    }
    next(error)
  }
}

export async function generatePlan(req, res, next) {
  try {
    const clerkUserId = req.auth?.userId
    if (!clerkUserId) {
      return res.status(401).json({ message: 'Missing authenticated user' })
    }

    const validatedData = req.validatedBody || req.body
    const { prompt = '', trainingDays } = validatedData
    const athlete = await Athlete.findOne({ clerkUserId })
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' })
    }

    const snapshot = buildAthleteSnapshot(athlete)
    const requestedDays = Math.min(Math.max(Number(trainingDays) || snapshot?.timeline?.length || 4, 3), 7)
    const systemPrompt =
      'You are an elite hybrid coach that designs weekly workout schedules. Always respond with JSON containing a plan array of up to 7 objects.'
    const userPrompt = `Create a ${requestedDays}-day workout schedule for this athlete. Focus: ${snapshot?.profile?.goal}.
Constraints from user: ${prompt || 'Use current readiness and macro targets'}.
Use data: ${JSON.stringify({
      goalPrescription: snapshot.goalPrescription,
      planTracks: snapshot.planTracks,
      macroSplits: snapshot.macroSplits,
    })}.
Return JSON {"plan": [{"day": string, "focus": string, "intensity": string, "duration": string, "primary": string, "accessory": string, "conditioning": string, "notes": string}], "summary": string}.`

    let aiContent
    try {
      const aiResponse = await generateChatCompletion({ systemPrompt, userPrompt, temperature: 0.4 })
      aiContent = aiResponse.content
    } catch (aiError) {
      if (aiError?.statusCode === 503) throw aiError
      return res.status(502).json({ message: 'Unable to generate plan right now', error: aiError.message })
    }

    let payload
    try {
      payload = JSON.parse(aiContent)
    } catch (parseError) {
      return res.status(502).json({ message: 'AI returned invalid format', error: parseError.message })
    }

    const normalizedPlan = normalizePlanBlocks(payload?.plan)
    const dailyWorkouts = buildDailyWorkoutsFromPlan(normalizedPlan)
    athlete.planTracks = normalizedPlan.map((block) => ({
      name: `${block.day} · ${block.focus}`,
      focus: `${block.intensity} · ${block.duration}`,
      detail: `${block.primary} | ${block.accessory} | ${block.conditioning}`,
    }))
    athlete.dailyWorkouts = dailyWorkouts
    await athlete.save()

    res.json({
      plan: normalizedPlan,
      dailyWorkouts,
      summary: payload?.summary || 'Plan synced from AI.',
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    if (error?.statusCode === 503) {
      return res.status(503).json({
        message: 'AI features disabled. Provide OPENAI_API_KEY to enable plan generation.',
      })
    }
    next(error)
  }
}
