import { useState } from 'react'
import { useAthleteData } from '../context/AthleteDataContext'
import { useScrollReveal } from '../hooks/useScrollReveal'

const getPlanDay = (plan) => {
  const [dayLabel] = plan.name.split('·')
  return dayLabel?.trim() || plan.name
}

const aiWorkoutsToday = [
  {
    title: 'Incline press ladder',
    prescription: '4 x 8 @ 70% · 2s tempo',
    why: 'Volume boost to match protein surplus logged this week.',
  },
  {
    title: 'Cable fly finisher',
    prescription: '3 x 15 + 10s stretch',
    why: 'Keeps chest fiber recruitment high without joint stress.',
  },
  {
    title: 'Tri pushdown wave',
    prescription: '5 x 30/20/10 descending rest',
    why: 'AI noticed streak dip; finisher spikes streak energy.',
  },
]

const todaySessionInsights = {
  calories: '540 kcal',
  duration: '62 min',
}

function Plans() {
  const {
    user,
    goalPrescription,
    planTracks,
    quickActions,
    generatePlan,
    planGenerationLoading,
    planGenerationError,
    planSummary,
  } = useAthleteData()
  const [planPrompt, setPlanPrompt] = useState('Push/pull/legs with 2 cardio days · minimal equipment')
  const [trainingDays, setTrainingDays] = useState('6')
  const headerRef = useScrollReveal()
  const splitRef = useScrollReveal()
  const aiRef = useScrollReveal()
  const intakeRef = useScrollReveal()
  const plansRef = useScrollReveal()
  const actionsRef = useScrollReveal()
  const handleGeneratePlan = async (event) => {
    event.preventDefault()
    try {
      await generatePlan({ prompt: planPrompt, trainingDays })
    } catch {
      // error surfaced via context state
    }
  }

  return (
    <div className="page plans-page">
      <section ref={headerRef} className="plans-hero card reveal">
        <div>
          <p className="eyebrow">Workout director</p>
          <h1>Workout splits that remix daily based on AI signal or your own edits.</h1>
          <p className="lead">
            Tell Protena how heavy you want to go and it paints a weekly split that tracks protein,
            recovery, and streak multipliers. You can override any lane and the AI rebalances the
            rest.
          </p>
        </div>
        <div className="ai-mode-toggle">
          <p className="eyebrow">Control</p>
          <div className="toggle-group">
            <button className="toggle-btn toggle-active">AI Suggested</button>
            <button className="toggle-btn">My Custom</button>
          </div>
          <p className="muted">
            Switch anytime—AI still drafts daily workouts so you never skip chest + tris again.
          </p>
          <div className="hero-ars-mini">
            <article>
              <p className="eyebrow">Autopilot confidence</p>
              <p className="stat-value">96%</p>
            </article>
            <article>
              <p className="eyebrow">Manual edits</p>
              <p className="stat-value">3 this week</p>
            </article>
          </div>
        </div>
      </section>

      <section ref={intakeRef} className="profile-intake card reveal">
        <header>
          <div>
            <p className="eyebrow">Signup intelligence</p>
            <h2>We captured your profile to auto-build diet + workout targets.</h2>
          </div>
          <button className="ghost-btn">Edit details</button>
        </header>
        <div className="profile-grid">
          <article>
            <p className="eyebrow">Name</p>
            <p className="stat-value">{user.name}</p>
          </article>
          <article>
            <p className="eyebrow">Age</p>
            <p className="stat-value">{user.age}</p>
          </article>
          <article>
            <p className="eyebrow">Weight</p>
            <p className="stat-value">{user.weight}</p>
          </article>
          <article>
            <p className="eyebrow">Fitness level</p>
            <p className="stat-value">{user.fitnessLevel}</p>
          </article>
          <article>
            <p className="eyebrow">Goal</p>
            <p className="stat-value">{user.goal}</p>
          </article>
          <article>
            <p className="eyebrow">Habits flagged</p>
            <p>{Array.isArray(user.badHabits) && user.badHabits.length ? user.badHabits.join(', ') : 'None logged'}</p>
          </article>
        </div>
        <div className="profile-prescriptions">
          <article>
            <p className="eyebrow">Calories</p>
            <p className="stat-value">{goalPrescription.calories}</p>
          </article>
          <article>
            <p className="eyebrow">Protein target</p>
            <p className="stat-value">{goalPrescription.proteinTarget}</p>
          </article>
          <article>
            <p className="eyebrow">Diet plan</p>
            <p>{goalPrescription.dietPlan}</p>
          </article>
          <article>
            <p className="eyebrow">Workout plan</p>
            <p>{goalPrescription.workoutPlan}</p>
          </article>
        </div>
        <p className="muted">{goalPrescription.notes}</p>
      </section>

      <section ref={splitRef} className="split-section card reveal">
        <header>
          <div>
            <p className="eyebrow">This week</p>
            <h2>Workout split calendar</h2>
          </div>
          <form className="split-actions" onSubmit={handleGeneratePlan}>
            <label className="sr-only" htmlFor="planPrompt">Prompt</label>
            <input
              id="planPrompt"
              type="text"
              value={planPrompt}
              onChange={(event) => setPlanPrompt(event.target.value)}
              placeholder="e.g., Push/pull/legs with 2 cardio days"
            />
            <label className="sr-only" htmlFor="trainingDays">Days</label>
            <select
              id="trainingDays"
              value={trainingDays}
              onChange={(event) => setTrainingDays(event.target.value)}
            >
              {[3, 4, 5, 6, 7].map((day) => (
                <option key={day} value={day}>
                  {day} days
                </option>
              ))}
            </select>
            <button type="submit" className="primary-btn" disabled={planGenerationLoading}>
              {planGenerationLoading ? 'Generating…' : 'Generate via AI'}
            </button>
          </form>
        </header>
        {planGenerationError && <p className="error-banner">{planGenerationError}</p>}
        {planSummary?.summary && (
          <p className="muted">{planSummary.summary}</p>
        )}
        <div className="split-calendar">
          {planTracks.map((plan, index) => (
            <article key={plan.name} className={`split-day ${index === 0 ? 'split-day-active' : ''}`}>
              <p className="split-day-label">{getPlanDay(plan)}</p>
              <h3>{plan.focus}</h3>
              <p className="muted">{plan.detail}</p>
              <span className="pill">AI curated</span>
            </article>
          ))}
          {planTracks.length === 0 && <p className="muted">No plan yet. Generate one above.</p>}
        </div>
      </section>

      <section ref={aiRef} className="ai-daily card reveal">
        <header>
          <div>
            <p className="eyebrow">AI detail</p>
            <h2>Today’s chest + tris session</h2>
          </div>
          <div className="ai-header-actions">
            <div className="session-metrics">
              <article>
                <p className="eyebrow">Expected time</p>
                <p className="stat-value">{todaySessionInsights.duration}</p>
              </article>
              <article>
                <p className="eyebrow">Calories burned</p>
                <p className="stat-value">{todaySessionInsights.calories}</p>
              </article>
            </div>
            <button className="ghost-btn">Swap exercises</button>
          </div>
        </header>
        <div className="ai-workout-list">
          {aiWorkoutsToday.map((block) => (
            <article key={block.title} className="ai-workout">
              <div>
                <h3>{block.title}</h3>
                <p className="muted">{block.prescription}</p>
              </div>
              <p>{block.why}</p>
              <button className="pill pill-outline">Convert to custom</button>
            </article>
          ))}
        </div>
      </section>

      <section ref={plansRef} className="grid three-col reveal">
        {planTracks.map((plan) => (
          <article key={plan.name} className="card surface">
            <h3>{plan.name}</h3>
            <p className="muted">{plan.focus}</p>
            <p>{plan.detail}</p>
            <button className="ghost-btn">View details</button>
          </article>
        ))}
      </section>

      <section ref={actionsRef} className="quick-actions card reveal">
        <h3>Quick actions</h3>
        <div className="action-pill-row">
          {quickActions.map((action) => (
            <button key={action} className="pill pill-action">
              {action}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Plans
