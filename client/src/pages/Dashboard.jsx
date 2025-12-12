import { useMemo, useState } from 'react'
import { useAthleteData } from '../context/AthleteDataContext'
import Sparkline from '../components/Sparkline'
import { useScrollReveal } from '../hooks/useScrollReveal'

const mealFilterOptions = [
  { value: 'all', label: 'All logs' },
  { value: 'verified', label: 'Verified meals' },
  { value: 'camera', label: 'Lens scans' },
  { value: 'manual', label: 'Manual adds' },
]

const createConicSegments = (segments = []) => {
  if (!segments?.length) return '#f3efe6 0% 100%'
  let cursor = 0
  return segments
    .map(({ accent, percent }) => {
      const start = cursor
      cursor += percent
      return `${accent} ${start}% ${cursor}%`
    })
    .join(', ')
}

const safeRound = (value, decimals = 0) => {
  const numericValue = Number(value)
  if (Number.isNaN(numericValue)) return 0
  const factor = 10 ** decimals
  return Math.round(numericValue * factor) / factor
}

const formatBriefTimestamp = (isoString) => {
  if (!isoString) return null
  try {
    const date = new Date(isoString)
    if (Number.isNaN(date.getTime())) return null
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  } catch {
    return null
  }
}

const formatWorkoutDate = (isoString) => {
  if (!isoString) return null
  try {
    const date = new Date(isoString)
    if (Number.isNaN(date.getTime())) return null
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(date)
  } catch {
    return null
  }
}

function Dashboard() {
  const {
    user = {},
    focusCards = [],
    timeline = [],
    analyticsDays = [],
    analyticsLoading,
    analyticsError,
    coachingBrief,
    coachingBriefLoading,
    coachingBriefError,
    refreshCoachingBrief,
    latestMealSuggestion,
    todayWorkout,
    upcomingWorkouts = [],
    workoutLoading,
    workoutError,
    completeWorkout,
    workoutCompletionLoading,
  } = useAthleteData()

  const headerRef = useScrollReveal()
  const briefingRef = useScrollReveal()
  const mealIntelRef = useScrollReveal()
  const workoutRef = useScrollReveal()
  const cardsRef = useScrollReveal()
  const analyticsRef = useScrollReveal()
  const timelineRef = useScrollReveal()

  const [selectedAnalyticsDay, setSelectedAnalyticsDay] = useState(null)
  const [dietFilter, setDietFilter] = useState('all')
  const [briefingOpen, setBriefingOpen] = useState(true)

  const sliderSortedDays = useMemo(() => {
    if (!analyticsDays.length) return []
    return [...analyticsDays].sort((a, b) => (a.sliderIndex || 0) - (b.sliderIndex || 0))
  }, [analyticsDays])

  const activeAnalyticsDay = useMemo(() => {
    if (!analyticsDays.length) return null
    if (!selectedAnalyticsDay) return analyticsDays[0]
    return analyticsDays.find((day) => day.id === selectedAnalyticsDay) || analyticsDays[0]
  }, [analyticsDays, selectedAnalyticsDay])

  const filteredMeals = useMemo(() => {
    if (!activeAnalyticsDay?.meals) return []
    if (dietFilter === 'all') return activeAnalyticsDay.meals
    return activeAnalyticsDay.meals.filter((meal) => meal.source === dietFilter)
  }, [activeAnalyticsDay, dietFilter])

  const fitnessGradient = useMemo(
    () => `conic-gradient(${createConicSegments(activeAnalyticsDay?.fitnessGoals)})`,
    [activeAnalyticsDay],
  )

  const dietGradient = useMemo(
    () => `conic-gradient(${createConicSegments(activeAnalyticsDay?.dietSlices)})`,
    [activeAnalyticsDay],
  )

  const sliderMax = sliderSortedDays.length ? sliderSortedDays[sliderSortedDays.length - 1].sliderIndex : 0
  const safeSliderMax = sliderMax || 1
  const sliderValue = typeof activeAnalyticsDay?.sliderIndex === 'number'
    ? activeAnalyticsDay.sliderIndex
    : safeSliderMax

  const handleSliderChange = (event) => {
    const value = Number(event.target.value)
    const targetDay = sliderSortedDays.find((day) => day.sliderIndex === value)
    if (targetDay) {
      setSelectedAnalyticsDay(targetDay.id)
    }
  }

  const sliderProgress = sliderValue / safeSliderMax
  const hasAnalytics = Boolean(activeAnalyticsDay)
  const briefTimestamp = useMemo(() => formatBriefTimestamp(coachingBrief?.generatedAt), [coachingBrief?.generatedAt])
  const showBriefingSection = Boolean(coachingBrief || coachingBriefLoading || coachingBriefError)
  const showWorkoutSection = Boolean(todayWorkout || workoutLoading || workoutError)
  const todayWorkoutHeadline = todayWorkout
    ? [todayWorkout.day, todayWorkout.focus].filter(Boolean).join(' · ')
    : 'Daily workout feed'
  const scheduledLabel = formatWorkoutDate(todayWorkout?.scheduledFor)
  const todaySegments = todayWorkout?.segments || []
  const workoutMetadata = todayWorkout
    ? [
      { label: 'Intensity', value: todayWorkout.intensity || 'Auto' },
      { label: 'Duration', value: todayWorkout.duration || '60 min' },
      { label: 'Status', value: todayWorkout.completed ? 'Completed' : 'In progress' },
    ]
    : []

  const handleCompleteWorkout = () => {
    if (!todayWorkout?.id || workoutCompletionLoading) return
    completeWorkout(todayWorkout.id).catch(() => { })
  }

  return (
    <div className="page dashboard-page">
      <section ref={headerRef} className="section-header reveal">
        <div>
          <p className="eyebrow">
            Signed in as <span className="pill">{user.email || user.name}</span>
          </p>
          <h1>Daily command center</h1>
          <p className="lead">
            See macros, training load, readiness, and AI nudges in a single adaptive view.
          </p>
        </div>
      </section>

      {showBriefingSection && (
        <section ref={briefingRef} className="ai-briefing reveal" aria-live="polite">
          <header>
            <div>
              <p className="eyebrow">AI coaching brief</p>
              <h3>{coachingBrief ? 'Adaptive summary' : 'Preparing your plan'}</h3>
              {briefTimestamp && <small>Updated {briefTimestamp}</small>}
            </div>
            <div className="briefing-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={refreshCoachingBrief}
                disabled={coachingBriefLoading}
              >
                {coachingBriefLoading ? 'Refreshing…' : 'Refresh insight'}
              </button>
              <button type="button" className="briefing-toggle" onClick={() => setBriefingOpen((prev) => !prev)}>
                {briefingOpen ? 'Collapse' : 'Expand'}
              </button>
            </div>
          </header>
          {coachingBriefError && <p className="error-banner">{coachingBriefError}</p>}
          {briefingOpen && (
            <div className="briefing-body">
              {coachingBriefLoading && !coachingBrief && <p className="muted">Calibrating AI focus…</p>}
              {!coachingBriefLoading && !coachingBrief && !coachingBriefError && (
                <p className="muted">Brief unlocks once your first data sync completes.</p>
              )}
              {coachingBrief && (
                <>
                  <p className="muted brief-summary">{coachingBrief.summary}</p>
                  <div className="briefing-grid">
                    {coachingBrief.sections?.map((section) => (
                      <article key={section.title} className="card surface">
                        <p className="eyebrow">{section.title}</p>
                        <p className="stat-value">{section.detail}</p>
                        {section.actions?.length ? (
                          <ul className="briefing-actions-list">
                            {section.actions.map((action) => (
                              <li key={action}>{action}</li>
                            ))}
                          </ul>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      )}

      {latestMealSuggestion && (
        <section ref={mealIntelRef} className="card ai-meal-intel reveal" aria-live="polite">
          <header className="ai-meal-intel-head">
            <div>
              <p className="eyebrow">AI meal intel</p>
              <h3>{latestMealSuggestion.title}</h3>
              <small>
                {latestMealSuggestion.mealType} · {latestMealSuggestion.serving}
              </small>
            </div>
            <div className="ai-meal-macros">
              <article>
                <p className="eyebrow">Calories</p>
                <p className="stat-value">{safeRound(latestMealSuggestion.calories)} kcal</p>
              </article>
              <article>
                <p className="eyebrow">Protein</p>
                <p className="stat-value">{safeRound(latestMealSuggestion.protein)} g</p>
              </article>
              <article>
                <p className="eyebrow">Carbs</p>
                <p className="stat-value">{safeRound(latestMealSuggestion.carbs)} g</p>
              </article>
              <article>
                <p className="eyebrow">Fats</p>
                <p className="stat-value">{safeRound(latestMealSuggestion.fats)} g</p>
              </article>
            </div>
          </header>
          {latestMealSuggestion.ingredients?.length > 0 && (
            <div className="ai-ingredients">
              <p className="muted">Ingredient blueprint</p>
              <ul>
                {latestMealSuggestion.ingredients.map((ingredient) => (
                  <li key={ingredient.name}>
                    <div>
                      <p>{ingredient.name}</p>
                      <small>{ingredient.quantity}</small>
                    </div>
                    <span>{safeRound(ingredient.calories)} kcal · {safeRound(ingredient.protein)} g</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {latestMealSuggestion.notes && <p className="muted">{latestMealSuggestion.notes}</p>}
          {typeof latestMealSuggestion.confidence === 'number' && (
            <p className="confidence-pill">Confidence {safeRound(latestMealSuggestion.confidence * 100)}%</p>
          )}
        </section>
      )}

      {showWorkoutSection && (
        <section ref={workoutRef} className="card ai-daily reveal" aria-live="polite">
          <header>
            <div>
              <p className="eyebrow">AI workout</p>
              <h2>{todayWorkoutHeadline}</h2>
              {scheduledLabel && <small>{scheduledLabel}</small>}
            </div>
            {todayWorkout && (
              <div className="session-metrics">
                {workoutMetadata.map((item) => (
                  <article key={item.label}>
                    <p className="eyebrow">{item.label}</p>
                    <p className="stat-value">{item.value}</p>
                  </article>
                ))}
              </div>
            )}
          </header>
          {workoutError && <p className="error-banner">{workoutError}</p>}
          {workoutLoading && <p className="muted">Dialing in today's session…</p>}
          {!workoutLoading && todayWorkout && (
            <>
              <div className="ai-workout-list">
                {todaySegments.map((segment) => (
                  <article key={segment.title} className="ai-workout">
                    <div>
                      <h3>{segment.title}</h3>
                      <p className="muted">{segment.detail}</p>
                    </div>
                    <button className="pill pill-outline" type="button">
                      Keep in plan
                    </button>
                  </article>
                ))}
              </div>
              <div className="workout-actions">
                <button
                  type="button"
                  className="primary-btn"
                  onClick={handleCompleteWorkout}
                  disabled={workoutCompletionLoading || !todayWorkout?.id}
                >
                  {workoutCompletionLoading ? 'Marking complete…' : 'Mark complete to unlock next'}
                </button>
                {todayWorkout.notes && <p className="muted">{todayWorkout.notes}</p>}
              </div>
            </>
          )}
          {!workoutLoading && !todayWorkout && !workoutError && (
            <p className="muted">No workout scheduled. Generate a plan in the Plans tab to begin.</p>
          )}
          <div className="upcoming-workouts">
            <p className="eyebrow">Up next</p>
            {upcomingWorkouts.length ? (
              <ul>
                {upcomingWorkouts.map((session) => (
                  <li key={session.id}>
                    <strong>{session.day}</strong>
                    <span>{session.focus}</span>
                    {formatWorkoutDate(session.scheduledFor) && (
                      <small>{formatWorkoutDate(session.scheduledFor)}</small>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Complete today's session to unlock tomorrow.</p>
            )}
          </div>
        </section>
      )}

      <section ref={cardsRef} className="grid three-col reveal">
        {focusCards.map((card) => (
          <article key={card.label} className="card surface">
            <p className="eyebrow">{card.label}</p>
            <p className="card-value">{card.value}</p>
            <p className="muted">{card.trend}</p>
            <Sparkline points={card.trendPoints} />
          </article>
        ))}
      </section>

      {analyticsError && (
        <section className="reveal" aria-live="polite">
          <p className="error-banner">{analyticsError}</p>
        </section>
      )}

      {analyticsLoading && !hasAnalytics && (
        <section className="reveal" aria-busy="true">
          <p className="muted">Syncing immersive analytics…</p>
        </section>
      )}

      {hasAnalytics && (
        <section ref={analyticsRef} className="immersive-analytics reveal">
          <header className="analytics-header">
            <div>
              <p className="eyebrow">Immersive analytics lab</p>
              <h2>3D modern readouts for training + fueling.</h2>
              <p className="muted">
                Swap the day selector to see how AI redistributed your lifts, streak protection, and meals.
              </p>
            </div>
            <div className="analytics-day-switch">
              {analyticsDays.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  className={`pill day-pill ${day.id === activeAnalyticsDay?.id ? 'day-pill-active' : ''}`}
                  onClick={() => setSelectedAnalyticsDay(day.id)}
                >
                  <span>{day.label}</span>
                  <small>{day.date}</small>
                </button>
              ))}
            </div>
          </header>
          <div className="analytics-grid">
            <article className="card volumetric-card">
              <div className="analytics-card-head">
                <div>
                  <p className="eyebrow">Fitness goal orbit</p>
                  <h3>Daily sculptor · {activeAnalyticsDay?.date}</h3>
                </div>
                <p className="muted">{activeAnalyticsDay?.fitnessScore}% of plan locked</p>
              </div>
              <div className="analytics-visual">
                <div className="analytics-donut" style={{ background: fitnessGradient }}>
                  <div className="analytics-donut-core">
                    <p className="eyebrow">Fitness</p>
                    <p className="stat-value">{activeAnalyticsDay?.fitnessScore}%</p>
                    <span>plan complete</span>
                  </div>
                </div>
                <ul className="analytics-legend">
                  {activeAnalyticsDay?.fitnessGoals?.map((goal) => (
                    <li key={goal.label}>
                      <span className="legend-color" style={{ background: goal.accent }} />
                      <div>
                        <p>{goal.label}</p>
                        <small>{goal.percent}% of daily bandwidth</small>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <article className="card volumetric-card">
              <div className="analytics-card-head">
                <div>
                  <p className="eyebrow">Diet control room</p>
                  <h3>Lens-powered fueling · {activeAnalyticsDay?.date}</h3>
                </div>
                <p className="muted">{activeAnalyticsDay?.dietScore}% macro confidence</p>
              </div>
              <div className="analytics-visual">
                <div className="analytics-donut" style={{ background: dietGradient }}>
                  <div className="analytics-donut-core">
                    <p className="eyebrow">Nutrition</p>
                    <p className="stat-value">{activeAnalyticsDay?.dietScore}%</p>
                    <span>precision index</span>
                  </div>
                </div>
                <ul className="analytics-legend">
                  {activeAnalyticsDay?.dietSlices?.map((slice) => (
                    <li key={slice.label}>
                      <span className="legend-color" style={{ background: slice.accent }} />
                      <div>
                        <p>{slice.label}</p>
                        <small>{slice.percent}% of intake</small>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="meal-filter-row">
                <p className="muted">Filter meal intel</p>
                <div className="meal-filter-chips">
                  {mealFilterOptions.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      className={`chip ${dietFilter === filter.value ? 'chip-active' : ''}`}
                      onClick={() => setDietFilter(filter.value)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="meal-log-list">
                {filteredMeals.length === 0 && <p className="muted">No meals match this lens.</p>}
                {filteredMeals.map((meal) => (
                  <article key={`${meal.name}-${meal.time}`} className="meal-log-card">
                    <div>
                      <p>{meal.name}</p>
                      <small>
                        {meal.time} · {meal.mealType}
                      </small>
                    </div>
                    <div className="meal-macros">
                      <span>{meal.calories}</span>
                      <span>{meal.protein}</span>
                    </div>
                    <span className={`meal-source-pill ${meal.source}`}>{meal.source}</span>
                  </article>
                ))}
              </div>
            </article>
          </div>
          <div className="radial-scrubber" role="group" aria-label="Analytics timeline scrubber">
            <div className="radial-ring" style={{ '--scrub-progress': sliderProgress }}>
              <div
                className="radial-handle"
                style={{ transform: `rotate(${Math.round(sliderProgress * 300 + 30)}deg) translateY(-115px)` }}
              />
              <ul className="radial-ticks">
                {sliderSortedDays.map((day) => (
                  <li key={day.id} className={day.id === activeAnalyticsDay?.id ? 'tick-active' : ''}>
                    <span
                      style={{
                        transform: `rotate(${(day.sliderIndex / safeSliderMax) * 300 + 30}deg) translateY(-125px) rotate(-${(day.sliderIndex / safeSliderMax) * 300 + 30}deg)`,
                      }}
                    >
                      {day.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <input
              type="range"
              min={sliderSortedDays[0]?.sliderIndex || 0}
              max={safeSliderMax}
              step={1}
              value={sliderValue}
              onChange={handleSliderChange}
              className="radial-range"
              aria-label="Select analytics day"
            />
          </div>
        </section>
      )}

      <section ref={timelineRef} className="timeline reveal">
        {timeline.map((event) => (
          <article key={event.time}>
            <div>
              <p className="eyebrow">{event.time}</p>
              <h3>{event.title}</h3>
            </div>
            <p className="muted">{event.detail}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

export default Dashboard
