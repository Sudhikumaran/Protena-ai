import Athlete from '../models/Athlete.js'

const getTodayKey = () => new Date().toISOString().split('T')[0]

const buildUpcoming = (workouts = [], currentId) =>
  workouts.filter((entry) => entry.id !== currentId && !entry.completed).slice(0, 3)

export async function getTodayWorkout(req, res, next) {
  try {
    const clerkUserId = req.auth?.userId
    if (!clerkUserId) {
      return res.status(401).json({ message: 'Missing authenticated user' })
    }

    const athlete = await Athlete.findOne({ clerkUserId })
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' })
    }

    const workouts = athlete.dailyWorkouts || []
    if (!workouts.length) {
      return res.status(404).json({ message: 'No workouts scheduled. Generate a plan first.' })
    }

    const todayKey = getTodayKey()
    let workout = workouts.find((entry) => entry.scheduledFor === todayKey)
    if (!workout) {
      workout = workouts.find((entry) => !entry.completed) || workouts[workouts.length - 1]
    }

    if (!workout) {
      return res.status(404).json({ message: 'No workout available.' })
    }

    res.json({
      workout,
      upcoming: buildUpcoming(workouts, workout.id),
    })
  } catch (error) {
    next(error)
  }
}

export async function completeWorkout(req, res, next) {
  try {
    const clerkUserId = req.auth?.userId
    if (!clerkUserId) {
      return res.status(401).json({ message: 'Missing authenticated user' })
    }

    const athlete = await Athlete.findOne({ clerkUserId })
    if (!athlete) {
      return res.status(404).json({ message: 'Athlete not found' })
    }

    const workoutId = req.params.id
    const workouts = athlete.dailyWorkouts || []
    const workout = workouts.find((entry) => entry.id === workoutId)
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' })
    }

    workout.completed = true
    workout.completedAt = new Date().toISOString()
    await athlete.save()

    const upcoming = buildUpcoming(workouts, workout.id)
    const nextWorkout = upcoming[0] || null

    res.json({
      workout,
      nextWorkout,
      upcoming,
    })
  } catch (error) {
    next(error)
  }
}
