import { useCallback, useEffect, useState } from 'react'
import { useAthleteData } from '../context/AthleteDataContext'
import { useScrollReveal } from '../hooks/useScrollReveal'

const mealLibrary = [
  // Indian staples
  { title: 'Paneer bhurji + roti', calories: 410, protein: 24, carbs: 32, fats: 18, mealType: 'Breakfast', tags: ['Vegetarian', 'High protein'] },
  { title: 'Masala dosa + sambar', calories: 350, protein: 12, carbs: 54, fats: 10, mealType: 'Breakfast', tags: ['Vegetarian', 'Fermented'] },
  { title: 'Rajma chawal bowl', calories: 480, protein: 18, carbs: 78, fats: 8, mealType: 'Lunch', tags: ['Plant protein', 'Fiber'] },
  { title: 'Grilled tandoori chicken salad', calories: 320, protein: 36, carbs: 14, fats: 12, mealType: 'Dinner', tags: ['Lean meat'] },
  { title: 'Poha + peanuts', calories: 290, protein: 9, carbs: 44, fats: 8, mealType: 'Morning Snack', tags: ['Quick carb'] },
  { title: 'Chana chaat', calories: 260, protein: 11, carbs: 36, fats: 6, mealType: 'Evening Snack', tags: ['Plant protein'] },
  // Global variety
  { title: 'Avocado toast + boiled eggs', calories: 420, protein: 22, carbs: 34, fats: 22, mealType: 'Breakfast', tags: ['Healthy fats'] },
  { title: 'Overnight oats + berries', calories: 360, protein: 18, carbs: 52, fats: 10, mealType: 'Breakfast', tags: ['Vegan'] },
  { title: 'Salmon quinoa power bowl', calories: 510, protein: 38, carbs: 48, fats: 18, mealType: 'Lunch', tags: ['Omega-3'] },
  { title: 'Thai basil tofu stir-fry', calories: 390, protein: 24, carbs: 46, fats: 12, mealType: 'Dinner', tags: ['Vegan'] },
  { title: 'Mediterranean hummus platter', calories: 330, protein: 16, carbs: 38, fats: 12, mealType: 'Evening Snack', tags: ['Plant protein'] },
  { title: 'Greek yogurt + fruit parfait', calories: 280, protein: 20, carbs: 32, fats: 6, mealType: 'Morning Snack', tags: ['Probiotic'] },
  { title: 'Sushi roll set', calories: 420, protein: 28, carbs: 58, fats: 8, mealType: 'Lunch', tags: ['Seafood'] },
  { title: 'Beetroot millet salad', calories: 300, protein: 12, carbs: 42, fats: 8, mealType: 'Lunch', tags: ['Gluten free'] },
  { title: 'Dark chocolate + almond bites', calories: 210, protein: 6, carbs: 18, fats: 12, mealType: 'Dessert', tags: ['Indulgence'] },
  { title: 'Protein smoothie (whey + banana)', calories: 280, protein: 30, carbs: 28, fats: 5, mealType: 'Post Workout', tags: ['Recovery'] },
]
const mealTypes = ['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner']

const foodSpectrum = [
  {
    category: 'Lean proteins',
    macroFocus: 'Build + repair',
    examples: ['Paneer / tofu', 'Egg whites', 'Wild salmon', 'Tandoori chicken', 'Lentil dal'],
    notes: 'Rotate animal and plant proteins across the week to keep amino acids balanced.',
  },
  {
    category: 'Smart carbs',
    macroFocus: 'Fuel sessions',
    examples: ['Red rice', 'Millets', 'Sweet potato wedges', 'Whole wheat roti', 'Quinoa'],
    notes: 'Pair carbs with fiber or protein to flatten glucose spikes.',
  },
  {
    category: 'Healthy fats',
    macroFocus: 'Hormone support',
    examples: ['Avocado', 'Cold pressed sesame oil', 'Almonds + walnuts', 'Seeds mix', 'Olive tapenade'],
    notes: 'Keep fats closer to rest days for easier digestion before training.',
  },
  {
    category: 'Micronutrient bowls',
    macroFocus: 'Recovery + immunity',
    examples: ['Rainbow salads', 'Fermented pickles', 'Sprouts chaat', 'Berry parfait', 'Green smoothies'],
    notes: 'Aim for five colors per day to cover trace minerals.',
  },
  {
    category: 'Hydration & electrolytes',
    macroFocus: 'Nervous system',
    examples: ['Nariyal pani', 'Homemade electrolyte mix', 'Lemon ginger water', 'Kefir', 'Herbal teas'],
    notes: 'Sip 250 ml every waking hour; add sea salt if sweat load is high.',
  },
  {
    category: 'Mindful indulgences',
    macroFocus: 'Adherence',
    examples: ['Jaggery sesame laddoo', '70% dark chocolate', 'Baked yogurt', 'Fruit sorbet', 'Protein kulfi'],
    notes: 'Schedule treats after protein-rich meals to control cravings.',
  },
]

function Nutrition() {
  const [showScanModal, setShowScanModal] = useState(false)
  const [manualForm, setManualForm] = useState({
    title: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    mealType: mealTypes[0],
  })
  const [mealIntel, setMealIntel] = useState(null)
  const [mealIntelLoading, setMealIntelLoading] = useState(false)
  const [mealIntelError, setMealIntelError] = useState(null)
  const [relatedQueries, setRelatedQueries] = useState([])
  const [relatedLoading, setRelatedLoading] = useState(false)
  const [relatedError, setRelatedError] = useState(null)
  const formatNumber = (value) => Math.round(Number(value) || 0)
  const {
    macroSplits,
    mealLog,
    addMeal,
    isMealMutating,
    mealMutationError,
    fetchMealSuggestion,
  } = useAthleteData()
  const headerRef = useScrollReveal()
  const gridRef = useScrollReveal()
  const manualRef = useScrollReveal()
  const spectrumRef = useScrollReveal()
  const libraryRef = useScrollReveal()
  const logRef = useScrollReveal()

  const handleManualChange = (event) => {
    const { name, value } = event.target
    setManualForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleManualSubmit = async (event) => {
    event.preventDefault()
    if (!manualForm.title || !manualForm.calories || !manualForm.protein) return

    const payload = {
      title: manualForm.title,
      calories: Number(manualForm.calories),
      protein: Number(manualForm.protein),
      status: 'manual',
      source: 'manual',
      mealType: manualForm.mealType,
      time: new Date().toISOString(),
      dayId: 'today',
    }

    try {
      await addMeal(payload)
      setManualForm({ title: '', calories: '', protein: '', carbs: '', fats: '', mealType: mealTypes[0] })
    } catch {
      // surfaced via context state; no-op
    }
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

  const runRelatedLookup = useCallback(async (queryText) => {
    try {
      setRelatedLoading(true)
      const suggestion = await fetchMealSuggestion({
        query: queryText,
        mealType: manualForm.mealType,
        previewOnly: true,
      })
      setRelatedQueries(Array.isArray(suggestion.relatedQueries) ? suggestion.relatedQueries : [])
      setRelatedError(null)
    } catch (error) {
      setRelatedError(error.message || 'Unable to load AI searches')
    } finally {
      setRelatedLoading(false)
    }
  }, [fetchMealSuggestion, manualForm.mealType])

  const handleAiSuggest = async (queryOverride) => {
    const queryText = queryOverride || manualForm.title
    if (!queryText) {
      setMealIntelError('Enter a meal name to analyze')
      return
    }

    try {
      setMealIntelLoading(true)
      setMealIntelError(null)
      const suggestion = await fetchMealSuggestion({
        query: queryText,
        mealType: manualForm.mealType,
      })
      setMealIntel(suggestion)
      setRelatedQueries(Array.isArray(suggestion.relatedQueries) ? suggestion.relatedQueries : [])
      setManualForm((prev) => ({
        ...prev,
        title: suggestion.title || queryText,
        calories:
          typeof suggestion.calories !== 'undefined'
            ? String(Math.round(Number(suggestion.calories) || 0))
            : prev.calories,
        protein:
          typeof suggestion.protein !== 'undefined'
            ? String(Math.round(Number(suggestion.protein) || 0))
            : prev.protein,
        carbs:
          typeof suggestion.carbs !== 'undefined'
            ? String(Math.round(Number(suggestion.carbs) || 0))
            : prev.carbs,
        fats:
          typeof suggestion.fats !== 'undefined'
            ? String(Math.round(Number(suggestion.fats) || 0))
            : prev.fats,
        mealType: suggestion.mealType || prev.mealType,
      }))
    } catch (err) {
      setMealIntelError(err.message || 'Unable to fetch AI suggestion')
      setMealIntel(null)
    } finally {
      setMealIntelLoading(false)
    }
  }

  const handleRelatedSuggestion = (queryText) => {
    if (!queryText) return
    setManualForm((prev) => ({ ...prev, title: queryText }))
    handleAiSuggest(queryText)
  }

  useEffect(() => {
    if (!manualForm.title || manualForm.title.length < 3) {
      setRelatedQueries([])
      setRelatedError(null)
      return
    }
    const debounce = setTimeout(() => {
      runRelatedLookup(manualForm.title)
    }, 600)
    return () => clearTimeout(debounce)
  }, [manualForm.title, manualForm.mealType, runRelatedLookup])

  const filteredSuggestions = manualForm.title.length > 1
    ? mealLibrary.filter((meal) =>
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
          <div className="manual-entry-meta">
            <p className="muted">
              Pulled from Healthify-style nutrition tables so Indian staples stay accurate in grams.
            </p>
            <button type="button" className="ghost-btn" onClick={handleAiSuggest} disabled={mealIntelLoading}>
              {mealIntelLoading ? 'Calibrating…' : 'AI fill macros'}
            </button>
          </div>
        </header>
        {mealMutationError && <p className="error-banner">{mealMutationError}</p>}
        {mealIntelError && <p className="error-banner">{mealIntelError}</p>}
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
            <button type="submit" className="primary-btn" disabled={isMealMutating}>
              {isMealMutating ? 'Saving…' : 'Save manual meal'}
            </button>
          </div>
        </form>
        {(relatedQueries.length > 0 || relatedLoading || relatedError) && (
          <div className="ai-related-searches">
            <div className="ai-related-head">
              <p className="eyebrow">AI related searches</p>
              {relatedLoading && <small className="muted">Thinking…</small>}
              {relatedError && <small className="error-text">{relatedError}</small>}
            </div>
            <div className="chip-row">
              {relatedQueries.map((query) => (
                <button type="button" key={query} className="chip" onClick={() => handleRelatedSuggestion(query)}>
                  {query}
                </button>
              ))}
              {!relatedQueries.length && !relatedLoading && !relatedError && (
                <p className="muted">Start typing a meal name to see AI ideas.</p>
              )}
            </div>
          </div>
        )}
        {mealIntel && (
          <article className="card surface ai-suggestion-card">
            <header>
              <div>
                <p className="eyebrow">AI suggestion</p>
                <h3>{mealIntel.title}</h3>
                <small>{mealIntel.mealType} · {mealIntel.serving}</small>
              </div>
              {typeof mealIntel.confidence === 'number' && (
                <span className="pill pill-outline">Confidence {formatNumber(mealIntel.confidence * 100)}%</span>
              )}
            </header>
            <div className="ai-suggestion-macros">
              <article>
                <p className="eyebrow">Calories</p>
                <p className="stat-value">{formatNumber(mealIntel.calories)} kcal</p>
              </article>
              <article>
                <p className="eyebrow">Protein</p>
                <p className="stat-value">{formatNumber(mealIntel.protein)} g</p>
              </article>
              <article>
                <p className="eyebrow">Carbs</p>
                <p className="stat-value">{formatNumber(mealIntel.carbs)} g</p>
              </article>
              <article>
                <p className="eyebrow">Fats</p>
                <p className="stat-value">{formatNumber(mealIntel.fats)} g</p>
              </article>
            </div>
            {mealIntel.ingredients?.length > 0 && (
              <div>
                <p className="muted">Ingredient blueprint</p>
                <ul className="ingredient-list">
                  {mealIntel.ingredients.map((ingredient) => (
                    <li key={ingredient.name}>
                      <div>
                        <p>{ingredient.name}</p>
                        <small>{ingredient.quantity}</small>
                      </div>
                      <span>{formatNumber(ingredient.calories)} kcal · {formatNumber(ingredient.protein)} g</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {mealIntel.notes && <p className="muted">{mealIntel.notes}</p>}
          </article>
        )}
      </section>

      <section ref={spectrumRef} className="food-spectrum card reveal">
        <header>
          <div>
            <p className="eyebrow">Food spectrum</p>
            <h2>Cover every food type daily</h2>
          </div>
          <p className="muted">Use this cheat sheet to mix proteins, carbs, fats, micronutrients, hydration, and treats.</p>
        </header>
        <div className="food-spectrum-grid">
          {foodSpectrum.map((group) => (
            <article key={group.category} className="food-spectrum-card">
              <div className="food-spectrum-head">
                <p className="eyebrow">{group.macroFocus}</p>
                <h3>{group.category}</h3>
              </div>
              <ul>
                {group.examples.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="muted">{group.notes}</p>
            </article>
          ))}
        </div>
      </section>

      <section ref={libraryRef} className="indian-library card reveal">
        <header>
          <div>
            <p className="eyebrow">Global meal library</p>
            <h2>Real-time macros from every cuisine</h2>
          </div>
          <p className="muted">Tap any meal to auto-fill the manual entry above.</p>
        </header>
        <div className="indian-meal-grid">
          {mealLibrary.map((meal) => (
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
              {Array.isArray(meal.tags) && meal.tags.length > 0 && (
                <div className="meal-tags-row">
                  {meal.tags.map((tag) => (
                    <span key={tag} className="pill pill-outline">{tag}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section ref={logRef} className="meal-log reveal">
        <h3>Today&apos;s intake log</h3>
        {mealLog.map((meal, idx) => (
          <article key={`${meal.title}-${idx}`}>
            <div>
              <p>{meal.title}</p>
              <p className="muted">{meal.calories}</p>
            </div>
            <div>
              {meal.mealType && <span className="pill pill-outline">{meal.mealType}</span>}
              <span className="pill">{meal.protein}</span>
              {meal.status && (
                <span className="pill pill-outline">
                  {meal.status.charAt(0).toUpperCase() + meal.status.slice(1)}
                </span>
              )}
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
