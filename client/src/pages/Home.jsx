import { useAthleteData } from '../context/AthleteDataContext'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useParallaxTilt } from '../hooks/useParallaxTilt'

const featureHighlights = [
  {
    title: 'Adaptive Workouts',
    body: 'AI studies your recovery, tempo, and streak data to refresh your split daily.',
  },
  {
    title: 'Lens-Based Nutrition',
    body: 'Scan any meal and instantly see verified protein, calories, and macro balance.',
  },
  {
    title: 'Goal Guardian',
    body: 'Micro goals sync with your wearable data to keep protein and movement aligned.',
  },
]

const workflowSteps = [
  {
    title: 'Sense',
    detail: 'Camera scan + wearable signal detect what you ate, how you slept, and strain trends.',
  },
  {
    title: 'Score',
    detail: 'Macros, readiness, and adherence scored hourly to predict dips before they happen.',
  },
  {
    title: 'Steer',
    detail: 'Micro coaching nudges adjust protein goals, workouts, and streak multipliers in-app.',
  },
]

const athleteTypes = [
  { title: 'Strength Builder', body: 'Push / Pull / Legs with auto deload detection.' },
  { title: 'Hybrid Engine', body: 'Balance long runs with heavy lifts via AI fueling windows.' },
  { title: 'Everyday Athlete', body: 'Habit-based streaks for sustainable movement and protein wins.' },
]

const testimonials = [
  {
    name: 'Rina · Powerlifter',
    quote: 'Protena keeps my streak alive when travel wrecks my routine—camera scans are instant.',
  },
  {
    name: 'Owen · Hybrid runner',
    quote: 'The AI nudges let me hit 150g protein without calorie stress. Streak board is addictive.',
  },
  {
    name: 'Mara · Creator',
    quote: 'Plans auto-adapt to filming days so I still lift heavy and stay photo-ready.',
  },
]

const runwayPillars = [
  { label: '01', title: 'Macro Clarity', detail: 'Meal scans benchmark protein density and flag weak plates instantly.' },
  { label: '02', title: 'Recovery Rhythm', detail: 'Sleep + strain data sets your training tempo and adjusts deloads.' },
  { label: '03', title: 'Streak Energy', detail: 'Micro goals stack so hitting today powers tomorrow’s momentum.' },
]

const ritualMoments = [
  {
    title: 'Morning Sync',
    summary: 'Overnight recovery report whispers how hard to push strength blocks.',
  },
  {
    title: 'Midday Scan',
    summary: 'Camera-powered macros rebalance protein gaps before the next session.',
  },
  {
    title: 'Evening Lock',
    summary: 'Habit score, streak multipliers, and next-day cues drop into one card.',
  },
]

const heroMedia = {
  hero:
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=60',
  nutrition:
    'https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=1000&q=60',
}

const heroTrust = ['12k+ athletes logged this week', 'Vision macros < 2s', 'Sports dietitians approved']

function Home() {
  const { statHighlights, heroBadges, overviewStats } = useAthleteData()
  const heroRevealRef = useScrollReveal()
  const featuresRef = useScrollReveal()
  const statsRef = useScrollReveal()
  const workflowRef = useScrollReveal()
  const mediaRef = useScrollReveal()
  const testimonialRef = useScrollReveal()
  const heroTilt = useParallaxTilt(12)
  const heroStats = statHighlights.slice(0, 2)
  const proteinSnapshot = overviewStats?.[0]
  const proteinProgress = (() => {
    if (!proteinSnapshot?.value) return 0
    const matches = proteinSnapshot.value.match(/\d+/g)
    if (!matches || matches.length < 2) return 0
    const current = Number(matches[0])
    const goal = Number(matches[1]) || 1
    return Math.min(Math.round((current / goal) * 100), 100)
  })()

  return (
    <div className="page home-page">
      <section ref={heroRevealRef} className="hero hero-ars reveal">
        <div className="hero-ars-copy">
          <p className="eyebrow">Precision fueling studio</p>
          <h1>Protein, training, and streak energy composed like art direction.</h1>
          <p className="lead">
            About our website: Protena lays out your lifts and nutrition in calming bands so tracking
            macros feels curated, guided, and effortless every day.
          </p>
          <div className="hero-cta">
            <button className="primary-btn">Build your stack</button>
            <button className="ghost-btn">Play the walkthrough</button>
          </div>
          <div className="hero-ars-meta">
            <div className="hero-ars-metrics">
              {heroStats.map((item) => (
                <article key={item.label}>
                  <p className="eyebrow">{item.label}</p>
                  <p className="stat-value">{item.value}</p>
                </article>
              ))}
            </div>
            <div className="hero-trust-grid">
              {heroTrust.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
        </div>
        <div ref={heroTilt.ref} {...heroTilt.events} className="hero-ars-visual tilt-card">
          <div className="hero-ars-primary card">
            <img src={heroMedia.hero} alt="Athlete training with AI guidance" className="hero-image" />
            <div className="hero-badge-row">
              {heroBadges.map((badge) => (
                <span key={badge} className="pill">
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="hero-ars-stack">
            {proteinSnapshot && (
              <article className="hero-overlay-card">
                <p className="eyebrow">{proteinSnapshot.label}</p>
                <p className="hero-overlay-value">{proteinSnapshot.value}</p>
                <p className="muted">
                  {proteinSnapshot.delta} {proteinSnapshot.unit}
                </p>
                <div className="hero-progress">
                  <span style={{ width: `${proteinProgress}%` }} />
                </div>
              </article>
            )}
            <div className="hero-ars-mini">
              {statHighlights.slice(2, 4).map((stat) => (
                <article key={stat.label}>
                  <p className="eyebrow">{stat.label}</p>
                  <p className="stat-value">{stat.value}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section ref={featuresRef} className="ars-pillars reveal">
        <header className="section-header">
          <p className="eyebrow">Calm control</p>
          <h2>The Protena cadence mirrors Arsthanea’s layered gallery.</h2>
          <p className="muted">
            Soft gradients, bold numerics, and editorial spacing let each system breathe while still
            feeling cohesive.
          </p>
        </header>
        <div className="ars-pillars-grid">
          {runwayPillars.map((pillar) => (
            <article key={pillar.title} className="card">
              <p className="pillar-index">{pillar.label}</p>
              <h3>{pillar.title}</h3>
              <p>{pillar.detail}</p>
            </article>
          ))}
        </div>
        <div className="ars-feature-grid">
          {featureHighlights.map((item) => (
            <article key={item.title} className="card surface">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section ref={mediaRef} className="ars-panels reveal">
        <article className="card image-card">
          <img src={heroMedia.nutrition} alt="High protein meal and macro scan" />
          <div>
            <h3>Camera-to-macro intelligence</h3>
            <p className="muted">
              Every scan double-checks protein density, flags weak meals, and balances the rest of
              the day automatically.
            </p>
          </div>
        </article>
        <article className="card badge-grid">
          <h3>Built for every athlete</h3>
          {athleteTypes.map((type) => (
            <div key={type.title}>
              <p className="eyebrow">{type.title}</p>
              <p>{type.body}</p>
            </div>
          ))}
        </article>
      </section>

      <section ref={testimonialRef} className="testimonials card reveal">
        <div className="section-header">
          <p className="eyebrow">Community proof</p>
          <h3>Quiet confidence from athletes who never miss.</h3>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <blockquote key={item.name}>
              <p>“{item.quote}”</p>
              <cite>{item.name}</cite>
            </blockquote>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
