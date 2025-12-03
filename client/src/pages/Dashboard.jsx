import { useEffect, useMemo, useState } from 'react'
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

function Dashboard() {
  const { user, focusCards, timeline, analyticsDays = [] } = useAthleteData()
  const headerRef = useScrollReveal()
  const cardsRef = useScrollReveal()
  const timelineRef = useScrollReveal()
  const analyticsRef = useScrollReveal()
  const briefingRef = useScrollReveal()
  const [selectedAnalyticsDay, setSelectedAnalyticsDay] = useState(analyticsDays?.[0]?.id || '')
  const [dietFilter, setDietFilter] = useState('all')
  const [briefingOpen, setBriefingOpen] = useState(true)
  const sliderSortedDays = useMemo(() => {
    return [...analyticsDays].sort((a, b) => (a.sliderIndex || 0) - (b.sliderIndex || 0))
  }, [analyticsDays])
  const activeAnalyticsDay = useMemo(() => {
    if (!analyticsDays?.length) return null
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
  const initialSlider = typeof activeAnalyticsDay?.sliderIndex === 'number'
    ? activeAnalyticsDay.sliderIndex
    : safeSliderMax
  const [sliderValue, setSliderValue] = useState(initialSlider)
  useEffect(() => {
    if (typeof activeAnalyticsDay?.sliderIndex === 'number') {
      setSliderValue(activeAnalyticsDay.sliderIndex)
    }
  }, [activeAnalyticsDay])
  const handleSliderChange = (event) => {
    const value = Number(event.target.value)
    setSliderValue(value)
    const targetDay = sliderSortedDays.find((day) => day.sliderIndex === value)
    if (targetDay) {
      setSelectedAnalyticsDay(targetDay.id)
    }
  }
  const sliderProgress = sliderValue / safeSliderMax
  const hasAnalytics = Boolean(activeAnalyticsDay)

  return (
    <div className="page dashboard-page">
      <section ref={headerRef} className="section-header reveal">
        <div>
          <p className="eyebrow">
            Signed in as <span className="pill">{user.email}</span>
          </p>
          <h1>Daily command center</h1>
          <p className="lead">
            See macros, training load, readiness, and AI nudges in a single adaptive view.
          </p>
        </div>
      </section>

      {activeAnalyticsDay && (
        <section ref={briefingRef} className="ai-briefing reveal" aria-live="polite">
          <header>
            <div>
              <p className="eyebrow">AI briefing</p>
              <h3>Adaptive summary · {activeAnalyticsDay.date}</h3>
            </div>
            <button type="button" className="briefing-toggle" onClick={() => setBriefingOpen((prev) => !prev)}>
              {briefingOpen ? 'Collapse' : 'Expand'}
            </button>
          </header>
          {briefingOpen && (
            <div className="briefing-grid">
              <article>
                <p className="eyebrow">Readiness</p>
                <p className="stat-value">{activeAnalyticsDay.readiness}</p>
                <small>HRV + sleep signals feed this lane.</small>
              </article>
              <article>
                <p className="eyebrow">Streak risk</p>
                <p className="stat-value">{activeAnalyticsDay.streakRisk}</p>
                <small>Uses dual matrix confidence to protect runs.</small>
              </article>
              <article>
                <p className="eyebrow">Nutrition gap</p>
                <p className="stat-value">{activeAnalyticsDay.nutritionGap}</p>
                <small>Lens data plus manual meals keep this live.</small>
              </article>
            </div>
          )}
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
