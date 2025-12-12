import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'

const AthleteDataContext = createContext(null)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export function AthleteDataProvider({ children }) {
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analyticsDays, setAnalyticsDays] = useState([])
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState(null)
  const [isMealMutating, setIsMealMutating] = useState(false)
  const [mealMutationError, setMealMutationError] = useState(null)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [onboardingError, setOnboardingError] = useState(null)
  const [coachingBrief, setCoachingBrief] = useState(null)
  const [coachingBriefLoading, setCoachingBriefLoading] = useState(false)
  const [coachingBriefError, setCoachingBriefError] = useState(null)
  const [latestMealSuggestion, setLatestMealSuggestion] = useState(null)
  const [planGenerationLoading, setPlanGenerationLoading] = useState(false)
  const [planGenerationError, setPlanGenerationError] = useState(null)
  const [planSummary, setPlanSummary] = useState(null)
  const [todayWorkout, setTodayWorkout] = useState(null)
  const [upcomingWorkouts, setUpcomingWorkouts] = useState([])
  const [workoutLoading, setWorkoutLoading] = useState(true)
  const [workoutError, setWorkoutError] = useState(null)
  const [workoutCompletionLoading, setWorkoutCompletionLoading] = useState(false)
  const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth()
  const authReady = isAuthLoaded && isSignedIn

  useEffect(() => {
    const controller = new AbortController()

    async function fetchOverview() {
      if (!authReady) return

      try {
        setLoading(true)
        const token = await getToken()
        const response = await fetch(`${API_BASE_URL}/api/athletes/me/overview`, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (response.status === 404) {
          setNeedsOnboarding(true)
          setOverview(null)
          setError(null)
          setLoading(false)
          return
        }
        if (!response.ok) {
          throw new Error(`Overview request failed: ${response.status}`)
        }
        const data = await response.json()
        setOverview(data)
        setNeedsOnboarding(false)
        setError(null)
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message || 'Unable to load athlete overview')
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
    return () => controller.abort()
  }, [authReady, getToken])

  useEffect(() => {
    const controller = new AbortController()

    async function fetchAnalyticsDays() {
      if (!authReady) return
      if (needsOnboarding) {
        setAnalyticsLoading(false)
        setAnalyticsDays([])
        return
      }

      try {
        setAnalyticsLoading(true)
        const token = await getToken()
        const response = await fetch(`${API_BASE_URL}/api/athletes/me/daily?all=true`, {
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
        if (response.status === 404) {
          setAnalyticsDays([])
          setAnalyticsError(null)
          setNeedsOnboarding(true)
          setAnalyticsLoading(false)
          return
        }
        if (!response.ok) {
          throw new Error(`Analytics request failed: ${response.status}`)
        }
        const data = await response.json()
        setAnalyticsDays(Array.isArray(data.days) ? data.days : [])
        setAnalyticsError(null)
      } catch (err) {
        if (err.name === 'AbortError') return
        setAnalyticsError(err.message || 'Unable to load analytics data')
      } finally {
        setAnalyticsLoading(false)
      }
    }

    fetchAnalyticsDays()
    return () => controller.abort()
  }, [authReady, getToken, needsOnboarding])

  const fetchCoachingBrief = useCallback(
    async ({ signal } = {}) => {
      if (!authReady || needsOnboarding) {
        setCoachingBrief(null)
        setCoachingBriefLoading(false)
        if (needsOnboarding) setCoachingBriefError(null)
        return null
      }

      try {
        setCoachingBriefLoading(true)
        setCoachingBriefError(null)
        const token = await getToken()
        const response = await fetch(`${API_BASE_URL}/api/ai/coaching-brief`, {
          method: 'GET',
          signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })

        if (!response.ok) {
          throw new Error(`Coaching brief request failed: ${response.status}`)
        }

        const data = await response.json()
        setCoachingBrief(data)
        return data
      } catch (err) {
        if (err.name === 'AbortError') {
          return null
        }
        setCoachingBriefError(err.message || 'Unable to load AI brief')
        setCoachingBrief(null)
        return null
      } finally {
        setCoachingBriefLoading(false)
      }
    },
    [authReady, getToken, needsOnboarding],
  )

  const refreshCoachingBrief = useCallback(() => fetchCoachingBrief(), [fetchCoachingBrief])

  const fetchMealSuggestion = useCallback(
    async ({ query, mealType, previewOnly = false }) => {
      if (!authReady) {
        throw new Error('Authentication not ready')
      }
      if (!query) {
        throw new Error('Enter a meal name first')
      }

      const token = await getToken()
      const response = await fetch(`${API_BASE_URL}/api/ai/meal-suggestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, mealType }),
      })

      if (!response.ok) {
        throw new Error(`Meal suggestion request failed: ${response.status}`)
      }

      const data = await response.json()
      if (!previewOnly) {
        setLatestMealSuggestion(data)
      }
      return data
    },
    [authReady, getToken],
  )

  const generatePlan = useCallback(
    async ({ prompt, trainingDays }) => {
      if (!authReady) {
        throw new Error('Authentication not ready')
      }

      try {
        setPlanGenerationLoading(true)
        setPlanGenerationError(null)
        const token = await getToken()
        const response = await fetch(`${API_BASE_URL}/api/ai/plan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ prompt, trainingDays }),
        })

        if (!response.ok) {
          throw new Error(`Plan generation failed: ${response.status}`)
        }

        const data = await response.json()
        setPlanSummary({
          summary: data.summary,
          generatedAt: data.generatedAt,
        })
        if (Array.isArray(data.dailyWorkouts) && data.dailyWorkouts.length) {
          setTodayWorkout(data.dailyWorkouts[0])
          setUpcomingWorkouts(data.dailyWorkouts.slice(1))
          setWorkoutError(null)
        }
        return data
      } catch (error) {
        setPlanGenerationError(error.message || 'Unable to generate plan')
        throw error
      } finally {
        setPlanGenerationLoading(false)
      }
    },
    [authReady, getToken],
  )

  const fetchTodayWorkout = useCallback(async () => {
    if (!authReady || needsOnboarding) {
      setTodayWorkout(null)
      setUpcomingWorkouts([])
      setWorkoutLoading(false)
      setWorkoutError(null)
      return null
    }

    try {
      setWorkoutLoading(true)
      setWorkoutError(null)
      const token = await getToken()
      const response = await fetch(`${API_BASE_URL}/api/workouts/today`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })

      if (!response.ok) {
        if (response.status === 404) {
          setTodayWorkout(null)
          setUpcomingWorkouts([])
          setWorkoutError('No workout scheduled. Generate a plan to begin.')
          return null
        }
        throw new Error(`Workout fetch failed: ${response.status}`)
      }

      const data = await response.json()
      setTodayWorkout(data.workout || null)
      setUpcomingWorkouts(Array.isArray(data.upcoming) ? data.upcoming : [])
      setWorkoutError(null)
      return data
    } catch (error) {
      setWorkoutError(error.message || 'Unable to load today\'s workout')
      setTodayWorkout(null)
      setUpcomingWorkouts([])
      return null
    } finally {
      setWorkoutLoading(false)
    }
  }, [authReady, getToken, needsOnboarding])

  useEffect(() => {
    if (!authReady || needsOnboarding) {
      setWorkoutLoading(false)
      setTodayWorkout(null)
      setUpcomingWorkouts([])
      return
    }
    fetchTodayWorkout()
  }, [authReady, needsOnboarding, fetchTodayWorkout])

  const completeWorkout = useCallback(
    async (workoutId) => {
      if (!workoutId) throw new Error('Workout ID is required')
      if (!authReady) throw new Error('Authentication not ready')

      try {
        setWorkoutCompletionLoading(true)
        const token = await getToken()
        const response = await fetch(`${API_BASE_URL}/api/workouts/${workoutId}/complete`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })

        if (!response.ok) {
          throw new Error(`Unable to complete workout: ${response.status}`)
        }

        const data = await response.json()
        const nextWorkout = data.nextWorkout || null
        setTodayWorkout(nextWorkout)
        setUpcomingWorkouts(Array.isArray(data.upcoming) ? data.upcoming : [])
        if (!nextWorkout) {
          setWorkoutError('All workouts complete. Generate a new plan.')
        }
        return data
      } catch (error) {
        setWorkoutError(error.message || 'Unable to complete workout')
        throw error
      } finally {
        setWorkoutCompletionLoading(false)
      }
    },
    [authReady, getToken],
  )

  useEffect(() => {
    if (!authReady || needsOnboarding) {
      setCoachingBrief(null)
      setCoachingBriefLoading(false)
      return
    }

    const controller = new AbortController()
    fetchCoachingBrief({ signal: controller.signal })
    return () => controller.abort()
  }, [authReady, needsOnboarding, fetchCoachingBrief])

  const addMeal = useCallback(
    async (payload) => {
      if (!authReady) {
        throw new Error('Authentication not ready')
      }

      try {
        setIsMealMutating(true)
        const token = await getToken()
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
        const response = await fetch(`${API_BASE_URL}/api/athletes/me/meals`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error(`Meal request failed: ${response.status}`)
        }

        const data = await response.json()
        setOverview((prev) => (prev ? { ...prev, mealLog: data.mealLog } : prev))
        if (Array.isArray(data.analyticsDays)) {
          setAnalyticsDays(data.analyticsDays)
        }
        setMealMutationError(null)
        return data.meal
      } catch (err) {
        setMealMutationError(err.message || 'Unable to save meal')
        throw err
      } finally {
        setIsMealMutating(false)
      }
    },
    [authReady, getToken],
  )

  const completeOnboarding = useCallback(
    async (formData) => {
      if (!authReady) {
        throw new Error('Authentication not ready')
      }

      try {
        setIsOnboarding(true)
        const token = await getToken()
        const response = await fetch(`${API_BASE_URL}/api/athletes/me`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          throw new Error(`Onboarding request failed: ${response.status}`)
        }

        const data = await response.json()
        const { analyticsDays: newAnalytics = [], ...overviewPayload } = data
        setOverview(overviewPayload)
        setAnalyticsDays(Array.isArray(newAnalytics) ? newAnalytics : [])
        setNeedsOnboarding(false)
        setOnboardingError(null)
        return overviewPayload
      } catch (err) {
        setOnboardingError(err.message || 'Unable to complete onboarding')
        throw err
      } finally {
        setIsOnboarding(false)
      }
    },
    [authReady, getToken],
  )

  const value = useMemo(
    () => ({
      loading,
      error,
      analyticsLoading,
      analyticsError,
      isMealMutating,
      mealMutationError,
      user: overview?.user || {},
      goalPrescription: overview?.goalPrescription || {},
      overviewStats: overview?.overviewStats || [],
      heroBadges: overview?.heroBadges || [],
      statHighlights: overview?.statHighlights || [],
      focusCards: overview?.focusCards || [],
      timeline: overview?.timeline || [],
      macroSplits: overview?.macroSplits || [],
      mealLog: overview?.mealLog || [],
      planTracks: overview?.planTracks || [],
      quickActions: overview?.quickActions || [],
      streak: overview?.streak || { length: 0, grid: [] },
      analyticsDays,
      athleteId: overview?.id || null,
      addMeal,
      needsOnboarding,
      completeOnboarding,
      isOnboarding,
      onboardingError,
      coachingBrief,
      coachingBriefLoading,
      coachingBriefError,
      refreshCoachingBrief,
      latestMealSuggestion,
      fetchMealSuggestion,
      planGenerationLoading,
      planGenerationError,
      generatePlan,
      planSummary,
      todayWorkout,
      upcomingWorkouts,
      workoutLoading,
      workoutError,
      completeWorkout,
      workoutCompletionLoading,
    }),
    [
      overview,
      loading,
      error,
      analyticsDays,
      analyticsLoading,
      analyticsError,
      isMealMutating,
      mealMutationError,
      addMeal,
      needsOnboarding,
      completeOnboarding,
      isOnboarding,
      onboardingError,
      coachingBrief,
      coachingBriefLoading,
      coachingBriefError,
      refreshCoachingBrief,
      latestMealSuggestion,
      fetchMealSuggestion,
      planGenerationLoading,
      planGenerationError,
      generatePlan,
      planSummary,
      todayWorkout,
      upcomingWorkouts,
      workoutLoading,
      workoutError,
      completeWorkout,
      workoutCompletionLoading,
    ],
  )

  return <AthleteDataContext.Provider value={value}>{children}</AthleteDataContext.Provider>
}

export function useAthleteData() {
  const context = useContext(AthleteDataContext)
  if (!context) {
    throw new Error('useAthleteData must be used within AthleteDataProvider')
  }
  return context
}
