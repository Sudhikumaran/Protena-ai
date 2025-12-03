import { useState } from 'react'
import { useAthleteData } from '../context/AthleteDataContext'
import { useScrollReveal } from '../hooks/useScrollReveal'

const indianMealLibrary = [
  { title: 'Paneer bhurji + roti', calories: 410, protein: 24, carbs: 32, fats: 18, mealType: 'Breakfast' },
  { title: 'Masala dosa + sambar', calories: 350, protein: 12, carbs: 54, fats: 10, mealType: 'Breakfast' },
  { title: 'Rajma chawal bowl', calories: 480, protein: 18, carbs: 78, fats: 8, mealType: 'Lunch' },
  { title: 'Grilled tandoori chicken salad', calories: 320, protein: 36, carbs: 14, fats: 12, mealType: 'Dinner' },
  { title: 'Poha + peanuts', calories: 290, protein: 9, carbs: 44, fats: 8, mealType: 'Morning Snack' },
  { title: 'Chana chaat', calories: 260, protein: 11, carbs: 36, fats: 6, mealType: 'Evening Snack' },
]
const mealTypes = ['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner']

function Nutrition() {
  const [showScanModal, setShowScanModal] = useState(false)
  const [manualMeals, setManualMeals] = useState([])
  const [manualForm, setManualForm] = useState({
    title: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    mealType: mealTypes[0],
  })
  const { macroSplits, mealLog } = useAthleteData()
  const headerRef = useScrollReveal()
  const gridRef = useScrollReveal()
  const manualRef = useScrollReveal()
  const libraryRef = useScrollReveal()
  const logRef = useScrollReveal()

  const combinedMeals = [...mealLog, ...manualMeals]

  const handleManualChange = (event) => {
    const { name, value } = event.target
    setManualForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleManualSubmit = (event) => {
    event.preventDefault()
    if (!manualForm.title || !manualForm.calories || !manualForm.protein) return
    const newMeal = {
      title: manualForm.title,
      calories: `${manualForm.calories} kcal`,
      protein: `${manualForm.protein} g protein`,
      status: 'Manual',
      meta: `${manualForm.carbs || 0} g carbs · ${manualForm.fats || 0} g fats`,
      mealType: manualForm.mealType,
    }
    setManualMeals((prev) => [...prev, newMeal])
    setManualForm({ title: '', calories: '', protein: '', carbs: '', fats: '', mealType: mealTypes[0] })
  }

  const handleUseLibrary = (meal) => {
    setManualForm({
      title: meal.title,
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fats: meal.fats.toString(),
      mealType: meal.mealType || mealTypes[0],
    })
  }

  const filteredSuggestions = manualForm.title.length > 1
    ? indianMealLibrary.filter((meal) =>
        meal.title.toLowerCase().includes(manualForm.title.toLowerCase()),
      )
    : []

  return (
    <div className="page nutrition-page">
      <section ref={headerRef} className="section-header reveal">
        <h1>Food & macro intelligence</h1>
        <p className="lead">
          Snap a photo, get instant macro confidence, and let Protena auto-adjust the rest of your
          day.
        </p>
      </section>

      <section ref={gridRef} className="grid two-col reveal">
        <article className="card gradient">
          <h3>Camera meal analysis</h3>
          <p>
            Upload or stream a plate; computer vision detects ingredients, weights, and quality of
            protein sources.
          </p>
          <button className="secondary-btn">Scan meal</button>
        </article>
        <article className="card surface">
          <h3>Macro balance</h3>
          <ul className="macro-list">
            {macroSplits.map((macro) => (
              <li key={macro.label}>
                <div>
                  <p>{macro.label}</p>
                  <p className="muted">{macro.value}</p>
                </div>
                <div className="progress">
                  <span style={{ width: `${macro.percent}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section ref={manualRef} className="manual-entry card reveal">
        <header>
          <div>
            <p className="eyebrow">Manual entry</p>
            <h2>Add real-time meals without a scan</h2>
          </div>
          <p className="muted">
            Pulled from Healthify-style nutrition tables so Indian staples stay accurate in grams.
          </p>
        </header>
        <form className="meal-form" onSubmit={handleManualSubmit}>
          <div className="form-columns">
            <label className="form-field">
              <span>Meal name</span>
              <input
                type="text"
                name="title"
                value={manualForm.title}
                onChange={handleManualChange}
                placeholder="e.g., Paneer bhurji"
              />
              {filteredSuggestions.length > 0 && (
                <div className="meal-suggestions">
                  {filteredSuggestions.map((meal) => (
                    <button
                      type="button"
                      key={meal.title}
                      className="meal-suggestion"
                      onClick={() => handleUseLibrary(meal)}
                    >
                      <div>
                        <p>{meal.title}</p>
                        <p className="muted">
                          {meal.calories} kcal · {meal.protein} g protein
                        </p>
                      </div>
                      <span>{meal.mealType}</span>
                    </button>
                  ))}
                </div>
              )}
            </label>
            <label className="form-field">
              <span>Calories (kcal)</span>
              <input
                type="number"
                name="calories"
                value={manualForm.calories}
                onChange={handleManualChange}
                placeholder="410"
              />
            </label>
            <label className="form-field">
              <span>Protein (g)</span>
              <input
                type="number"
                name="protein"
                value={manualForm.protein}
                onChange={handleManualChange}
                placeholder="24"
              />
            </label>
          </div>
          <div className="form-columns">
            <label className="form-field">
              <span>Carbs (g)</span>
              <input
                type="number"
                name="carbs"
                value={manualForm.carbs}
                onChange={handleManualChange}
                placeholder="32"
              />
            </label>
            <label className="form-field">
              <span>Fats (g)</span>
              <input
                type="number"
                name="fats"
                value={manualForm.fats}
                onChange={handleManualChange}
                placeholder="18"
              />
            </label>
            <label className="form-field">
              <span>Meal type</span>
              <select name="mealType" value={manualForm.mealType} onChange={handleManualChange}>
                {mealTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="primary-btn">
              Save manual meal
            </button>
          </div>
        </form>
      </section>

      <section ref={libraryRef} className="indian-library card reveal">
        <header>
          <div>
            <p className="eyebrow">Indian meals library</p>
            <h2>Real-time macros like Healthify</h2>
          </div>
          <p className="muted">Tap any meal to auto-fill the manual entry above.</p>
        </header>
        <div className="indian-meal-grid">
          {indianMealLibrary.map((meal) => (
            <article key={meal.title} className="indian-meal-card">
              <div className="meal-card-head">
                <h3>{meal.title}</h3>
                <button type="button" className="pill" onClick={() => handleUseLibrary(meal)}>
                  Use macros
                </button>
              </div>
              <p className="muted">{meal.calories} kcal · {meal.protein} g protein</p>
              <p className="muted">
                {meal.carbs} g carbs · {meal.fats} g fats
              </p>
            </article>
          ))}
        </div>
      </section>

      <section ref={logRef} className="meal-log reveal">
        <h3>Today&apos;s intake log</h3>
        {combinedMeals.map((meal, idx) => (
          <article key={`${meal.title}-${idx}`}>
            <div>
              <p>{meal.title}</p>
              <p className="muted">{meal.calories}</p>
              {meal.meta && <p className="muted">{meal.meta}</p>}
            </div>
            <div>
              {meal.mealType && <span className="pill pill-outline">{meal.mealType}</span>}
              <span className="pill">{meal.protein}</span>
              <span className="pill pill-outline">{meal.status}</span>
            </div>
          </article>
        ))}
      </section>

      <button type="button" className="floating-cta" onClick={() => setShowScanModal(true)}>
        + Scan new meal
      </button>

      {showScanModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3>Scan meal</h3>
            <ol>
              <li>Position your plate under good light.</li>
              <li>Center protein source inside the guide.</li>
              <li>Confirm macros and save to log.</li>
            </ol>
            <div className="modal-actions">
              <button type="button" className="ghost-btn" onClick={() => setShowScanModal(false)}>
                Close
              </button>
              <button type="button" className="primary-btn">Open camera</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Nutrition
