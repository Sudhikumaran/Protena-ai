import { useEffect, useMemo, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useAthleteData } from '../context/AthleteDataContext'

const goalOptions = [
  'Build muscle + engine',
  'Lean recomposition',
  'Fat loss + conditioning',
  'Endurance build',
]

const dietOptions = [
  'High-protein flex plan',
  'Vegetarian focus plan',
  'Vegan macro precision',
  'Balanced Mediterranean',
]

const focusOptions = ['Hybrid Engine', 'Strength first', 'Conditioning upgrade', 'Mobility reset']

const trainingOptions = [3, 4, 5, 6]

function OnboardingWizard() {
  const { user: clerkUser } = useUser()
  const { completeOnboarding, isOnboarding, onboardingError } = useAthleteData()
  const defaultEmail = clerkUser?.primaryEmailAddress?.emailAddress || ''
  const defaultName = clerkUser?.fullName || clerkUser?.firstName || ''
  const [formData, setFormData] = useState({
    name: defaultName,
    email: defaultEmail,
    weight: '',
    height: '',
    goal: goalOptions[0],
    dietPreference: dietOptions[0],
    focus: focusOptions[0],
    trainingFrequency: trainingOptions[1],
  })
  const [localError, setLocalError] = useState(null)

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: prev.name || defaultName,
      email: prev.email || defaultEmail,
    }))
  }, [defaultEmail, defaultName])

  const isSubmitDisabled = useMemo(() => {
    return (
      isOnboarding ||
      !formData.name ||
      !formData.email ||
      !formData.weight ||
      Number(formData.weight) <= 0 ||
      !formData.goal
    )
  }, [formData, isOnboarding])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError(null)
    try {
      await completeOnboarding({
        ...formData,
        weight: Number(formData.weight),
        height: formData.height ? Number(formData.height) : undefined,
        trainingFrequency: Number(formData.trainingFrequency),
      })
    } catch (err) {
      setLocalError(err.message)
    }
  }

  return (
    <div className="page onboarding-page">
      <div className="onboarding-card card surface">
        <p className="eyebrow">Welcome to Protena</p>
        <h1>Let&apos;s calibrate your engine</h1>
        <p className="muted">
          Share a few signals so we can personalize macros, training density, and AI nudges in real time.
        </p>
        <form className="onboarding-form" onSubmit={handleSubmit}>
          <div className="form-columns">
            <label className="form-field">
              <span>Full name</span>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Jordan Vega" />
            </label>
            <label className="form-field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="athlete@protena.dev"
              />
            </label>
            <label className="form-field">
              <span>Weight (kg)</span>
              <input
                name="weight"
                type="number"
                min="1"
                value={formData.weight}
                onChange={handleChange}
                placeholder="78"
              />
            </label>
            <label className="form-field">
              <span>Height (cm)</span>
              <input
                name="height"
                type="number"
                min="1"
                value={formData.height}
                onChange={handleChange}
                placeholder="178"
              />
            </label>
            <label className="form-field">
              <span>Primary goal</span>
              <select name="goal" value={formData.goal} onChange={handleChange}>
                {goalOptions.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Training focus</span>
              <select name="focus" value={formData.focus} onChange={handleChange}>
                {focusOptions.map((focus) => (
                  <option key={focus} value={focus}>
                    {focus}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Diet preference</span>
              <select name="dietPreference" value={formData.dietPreference} onChange={handleChange}>
                {dietOptions.map((diet) => (
                  <option key={diet} value={diet}>
                    {diet}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Training days / week</span>
              <select
                name="trainingFrequency"
                value={formData.trainingFrequency}
                onChange={handleChange}
              >
                {trainingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option} days
                  </option>
                ))}
              </select>
            </label>
          </div>
          {(onboardingError || localError) && (
            <p className="error-banner">{onboardingError || localError}</p>
          )}
          <button type="submit" className="primary-btn" disabled={isSubmitDisabled}>
            {isOnboarding ? 'Saving your blueprint…' : 'Launch dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default OnboardingWizard
