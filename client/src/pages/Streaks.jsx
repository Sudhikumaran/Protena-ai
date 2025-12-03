import { useAthleteData } from '../context/AthleteDataContext'
import { useScrollReveal } from '../hooks/useScrollReveal'

const seasonTheme = {
  name: 'Strength Bloom',
  tier: 'Season 02',
  multiplier: 'x1.8',
  daysRemaining: '11 days left',
  description: 'Dual streaks stay lit for 5+ days to unlock extra macro flexibility and leaderboard boosts.',
}

const rewardMilestones = [
  { days: 1, reward: 'AI voice note + confetti drop' },
  { days: 7, reward: 'Recovery boost + badge' },
  { days: 14, reward: '5% macro buffer' },
  { days: 30, reward: 'Season vault skin' },
  { days: 90, reward: 'Invite to Hybrid Heat beta' },
]

const repairTasks = ['10 min fascia flow', '25g protein rescue shake', 'Sunset walk + breathwork']

function Streaks() {
  const {
    streak: { grid, length },
  } = useAthleteData()
  const heroRef = useScrollReveal()
  const matrixRef = useScrollReveal()
  const seasonRef = useScrollReveal()
  const rewardsRef = useScrollReveal()

  const matrixSlice = grid.slice(-14)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const todayIndex = new Date().getDay()
  const matrixDays = matrixSlice.map((cell, idx) => {
    const offset = matrixSlice.length - 1 - idx
    const name = dayNames[(todayIndex - offset + 7) % 7]
    const status = cell.completed && cell.proteinPerfect
      ? 'dual'
      : cell.completed
        ? 'movement'
        : cell.proteinPerfect
          ? 'protein'
          : 'gap'
    return {
      label: cell.today ? 'Today' : name,
      status,
      repairable: status === 'gap',
    }
  })

  const dualWins = matrixDays.filter((day) => day.status === 'dual').length
  const proteinRun = matrixDays.filter((day) => day.status === 'protein').length
  const movementRun = matrixDays.filter((day) => day.status === 'movement').length
  const nextReward = rewardMilestones.find((milestone) => length < milestone.days)

  return (
    <div className="page streaks-page">
      <section ref={heroRef} className="streaks-hero card reveal">
        <div>
          <p className="eyebrow">Dual streak energy</p>
          <h1>Movement + protein streaks woven together for {length} straight days.</h1>
          <p className="lead">
            Keep both lanes active to trigger crossover bonuses—AI reduces deloads, raises macro
            targets, and keeps your leaderboard glow pulsing.
          </p>
        </div>
        <div className="streaks-hero-stats">
          <article>
            <p className="eyebrow">Dual wins (14d)</p>
            <p className="stat-value">{dualWins}</p>
          </article>
          <article>
            <p className="eyebrow">Movement only</p>
            <p className="stat-value">{movementRun}</p>
          </article>
          <article>
            <p className="eyebrow">Protein only</p>
            <p className="stat-value">{proteinRun}</p>
          </article>
          <article>
            <p className="eyebrow">Next reward</p>
            <p className="stat-value">
              {nextReward ? `${nextReward.days}d` : 'Vault unlocked'}
            </p>
          </article>
        </div>
      </section>

      <section ref={matrixRef} className="dual-matrix card reveal">
        <header>
          <div>
            <p className="eyebrow">Dual-Streak Matrix</p>
            <h2>Track movement + protein lanes in one gallery.</h2>
          </div>
          <p className="muted">
            When both lanes are active, you bank crossover energy. Missed days stay repairable via
            quick recovery missions.
          </p>
        </header>
        <div className="matrix-grid">
          {matrixDays.map((day, idx) => (
            <article key={`${day.label}-${idx}`} className={`matrix-cell matrix-${day.status}`}>
              <p className="matrix-day">{day.label}</p>
              <p className="matrix-status">
                {day.status === 'dual' && 'Dual win'}
                {day.status === 'movement' && 'Movement locked'}
                {day.status === 'protein' && 'Protein perfect'}
                {day.status === 'gap' && 'Gap detected'}
              </p>
              {day.repairable ? (
                <button className="pill repair-pill">Repair via mission</button>
              ) : (
                <span className="pill-outline">
                  {day.status === 'dual' ? 'x2 bonus active' : 'AI tracking'}
                </span>
              )}
            </article>
          ))}
        </div>
        <div className="repair-row">
          <p className="eyebrow">Recovery missions</p>
          <div className="action-pill-row">
            {repairTasks.map((task) => (
              <button key={task} className="pill pill-action">
                {task}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section ref={seasonRef} className="season-card card reveal">
        <header>
          <div>
            <p className="eyebrow">Multiplier Season</p>
            <h2>{seasonTheme.name}</h2>
          </div>
          <button className="ghost-btn">View season lore</button>
        </header>
        <p className="muted">{seasonTheme.description}</p>
        <div className="season-details">
          <article>
            <p className="eyebrow">Tier</p>
            <p className="stat-value">{seasonTheme.tier}</p>
          </article>
          <article>
            <p className="eyebrow">Multiplier</p>
            <p className="stat-value">{seasonTheme.multiplier}</p>
          </article>
          <article>
            <p className="eyebrow">Time left</p>
            <p className="stat-value">{seasonTheme.daysRemaining}</p>
          </article>
        </div>
        <div className="season-progress">
          <span style={{ width: `${Math.min((dualWins / 14) * 100, 100)}%` }} />
        </div>
        <p className="muted">
          Keep dual wins above 10/14 days to upgrade to Hybrid Heat next month and unlock new
          backgrounds + macro perks.
        </p>
      </section>

      <section ref={rewardsRef} className="streak-rewards card reveal">
        <header>
          <div>
            <p className="eyebrow">Milestone rewards</p>
            <h2>Celebrate every 1, 7, and 30 days.</h2>
          </div>
          <button className="secondary-btn">Share streak</button>
        </header>
        <div className="rewards-timeline">
          {rewardMilestones.map((milestone) => {
            const earned = length >= milestone.days
            const nextUp = nextReward && nextReward.days === milestone.days
            return (
              <article
                key={milestone.days}
                className={`reward-chip ${earned ? 'reward-earned' : ''} ${nextUp ? 'reward-next' : ''}`}
              >
                <p className="eyebrow">Day {milestone.days}</p>
                <p>{milestone.reward}</p>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default Streaks
