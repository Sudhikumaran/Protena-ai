import { createContext, useContext, useMemo } from 'react'

const AthleteDataContext = createContext(null)

const generateStreakGrid = (days = 35) =>
  Array.from({ length: days }, (_, index) => {
    const completed = index % 6 !== 0
    const today = index === days - 1
    const proteinPerfect = index % 4 === 0
    return { completed, today, proteinPerfect }
  })

export function AthleteDataProvider({ children }) {
  const value = useMemo(
    () => ({
      user: {
        name: 'Jordan Vega',
        email: 'athlete@protena.dev',
        focus: 'Hybrid Engine',
        age: 29,
        weight: '78 kg',
        fitnessLevel: 'Advanced hybrid',
        badHabits: ['Late dinners', 'Low hydration'],
        goal: 'Muscle build + engine',
      },
      goalPrescription: {
        calories: '2,650 kcal / day',
        proteinTarget: '165 g protein',
        dietPlan: 'High-protein Indian flex plan',
        workoutPlan: 'Push / Pull / Legs + Hybrid intervals',
        notes: 'Bad habits addressed via earlier dinners and hydration alarms.',
      },
      overviewStats: [
        { label: 'Protein', value: '142g', delta: '+12g', unit: 'of 150g' },
        { label: 'Training', value: 'Push day', delta: 'Ready', unit: 'AI suggested' },
        { label: 'Streak', value: '76 days', delta: '+1', unit: 'macro perfect' },
      ],
      heroBadges: ['Live AI Coach', '+18g protein today', 'Streak day 76'],
      statHighlights: [
        { label: 'Avg. Daily Protein Logged', value: '127g' },
        { label: 'Workout Completion Rate', value: '94%' },
        { label: 'Active Streaks Protected', value: '18,204' },
      ],
      focusCards: [
        {
          label: 'Protein Target',
          value: '142g / 150g',
          trend: '+18g vs yesterday',
          trendPoints: [40, 62, 58, 80, 74, 88],
        },
        {
          label: 'Training Load',
          value: 'Volume 25.4k lbs',
          trend: 'Push day queued',
          trendPoints: [55, 42, 65, 70, 62, 78],
        },
        {
          label: 'Recovery Readiness',
          value: '82% primed',
          trend: 'Sleep 7h 52m · HRV 93',
          trendPoints: [70, 68, 74, 81, 79, 82],
        },
      ],
      timeline: [
        { time: '06:00', title: 'Mobility Flow', detail: '12 min spine + hip primers' },
        { time: '12:30', title: 'Camera Meal Scan', detail: '36g protein bowl logged' },
        {
          time: '18:15',
          title: 'Push Day - Neural Load: Green',
          detail: 'Bench complex + accessory superset',
        },
      ],
      macroSplits: [
        { label: 'Protein', value: '142g', percent: 71 },
        { label: 'Carbs', value: '188g', percent: 63 },
        { label: 'Fats', value: '48g', percent: 54 },
      ],
      mealLog: [
        {
          title: 'Breakfast shake',
          protein: '42g',
          calories: '410 kcal',
          status: 'verified',
          mealType: 'Breakfast',
        },
        {
          title: 'Power bowl',
          protein: '36g',
          calories: '520 kcal',
          status: 'camera',
          mealType: 'Lunch',
        },
        {
          title: 'Post-lift wrap',
          protein: '28g',
          calories: '430 kcal',
          status: 'manual',
          mealType: 'Dinner',
        },
      ],
      planTracks: [
        {
          name: 'Push / Pull / Legs',
          detail: 'AI reshuffles intensity every 48h based on streak momentum and HRV.',
          focus: 'Power + Hypertrophy',
        },
        {
          name: 'Hybrid Engine',
          detail: 'Lift heavy, run fast. Aerobic sessions adapt to your protein timing.',
          focus: 'Strength + Conditioning',
        },
        {
          name: 'Travel Mode',
          detail: 'Bodyweight-first program with band swaps and hotel gym detection.',
          focus: 'Maintenance + Mobility',
        },
      ],
      quickActions: ['Generate new split', 'Sync wearable data', 'Download PDF'],
      streak: {
        length: 76,
        grid: generateStreakGrid(),
      },
      analyticsDays: [
        {
          id: 'today',
          label: 'Today',
          date: 'Tue · Dec 3',
          fitnessScore: 92,
          dietScore: 88,
          readiness: 'High · 91% primed',
          streakRisk: 'Safe · +3 day buffer',
          nutritionGap: '+12g protein to hit target',
          sliderIndex: 6,
          fitnessGoals: [
            { label: 'Strength Volume', percent: 36, accent: '#ff9f7c' },
            { label: 'Conditioning Load', percent: 28, accent: '#f75f8f' },
            { label: 'Mobility & Primers', percent: 18, accent: '#9779ff' },
            { label: 'Recovery Blocks', percent: 18, accent: '#36c9c3' },
          ],
          dietSlices: [
            { label: 'Protein-Dense Meals', percent: 42, accent: '#ffd76f' },
            { label: 'Smart Carbs', percent: 33, accent: '#ff9f7c' },
            { label: 'Good Fats', percent: 15, accent: '#5fd4c6' },
            { label: 'Indulgences', percent: 10, accent: '#c488ff' },
          ],
          meals: [
            {
              name: 'Breakfast shake',
              time: '07:05',
              calories: '410 kcal',
              protein: '42g protein',
              source: 'verified',
              mealType: 'Breakfast',
            },
            {
              name: 'Power bowl',
              time: '12:38',
              calories: '520 kcal',
              protein: '36g protein',
              source: 'camera',
              mealType: 'Lunch',
            },
            {
              name: 'Aloo tikki wrap',
              time: '15:10',
              calories: '320 kcal',
              protein: '22g protein',
              source: 'manual',
              mealType: 'Snack',
            },
            {
              name: 'Paneer quinoa bowl',
              time: '19:20',
              calories: '610 kcal',
              protein: '38g protein',
              source: 'verified',
              mealType: 'Dinner',
            },
          ],
        },
        {
          id: 'yesterday',
          label: 'Yesterday',
          date: 'Mon · Dec 2',
          fitnessScore: 86,
          dietScore: 91,
          readiness: 'Stable · 82% primed',
          streakRisk: 'Protected · +1 day buffer',
          nutritionGap: '+6g carbs suggested',
          sliderIndex: 5,
          fitnessGoals: [
            { label: 'Strength Volume', percent: 28, accent: '#ff9f7c' },
            { label: 'Conditioning Load', percent: 34, accent: '#f75f8f' },
            { label: 'Mobility & Primers', percent: 16, accent: '#9779ff' },
            { label: 'Recovery Blocks', percent: 22, accent: '#36c9c3' },
          ],
          dietSlices: [
            { label: 'Protein-Dense Meals', percent: 38, accent: '#ffd76f' },
            { label: 'Smart Carbs', percent: 30, accent: '#ff9f7c' },
            { label: 'Good Fats', percent: 20, accent: '#5fd4c6' },
            { label: 'Indulgences', percent: 12, accent: '#c488ff' },
          ],
          meals: [
            {
              name: 'Masala oats',
              time: '08:10',
              calories: '360 kcal',
              protein: '24g protein',
              source: 'camera',
              mealType: 'Breakfast',
            },
            {
              name: 'Tofu stir fry',
              time: '13:05',
              calories: '450 kcal',
              protein: '32g protein',
              source: 'verified',
              mealType: 'Lunch',
            },
            {
              name: 'Channa salad',
              time: '17:45',
              calories: '280 kcal',
              protein: '18g protein',
              source: 'manual',
              mealType: 'Snack',
            },
            {
              name: 'Tandoori salmon',
              time: '20:30',
              calories: '540 kcal',
              protein: '41g protein',
              source: 'verified',
              mealType: 'Dinner',
            },
          ],
        },
        {
          id: 'twoDaysAgo',
          label: 'Sun',
          date: 'Sun · Dec 1',
          fitnessScore: 74,
          dietScore: 79,
          readiness: 'Moderate · 68% primed',
          streakRisk: 'Watch · repair mobility',
          nutritionGap: '-18g protein logged',
          sliderIndex: 4,
          fitnessGoals: [
            { label: 'Strength Volume', percent: 22, accent: '#ff9f7c' },
            { label: 'Conditioning Load', percent: 25, accent: '#f75f8f' },
            { label: 'Mobility & Primers', percent: 22, accent: '#9779ff' },
            { label: 'Recovery Blocks', percent: 31, accent: '#36c9c3' },
          ],
          dietSlices: [
            { label: 'Protein-Dense Meals', percent: 33, accent: '#ffd76f' },
            { label: 'Smart Carbs', percent: 29, accent: '#ff9f7c' },
            { label: 'Good Fats', percent: 21, accent: '#5fd4c6' },
            { label: 'Indulgences', percent: 17, accent: '#c488ff' },
          ],
          meals: [
            {
              name: 'Ragi dosa',
              time: '09:00',
              calories: '310 kcal',
              protein: '18g protein',
              source: 'manual',
              mealType: 'Breakfast',
            },
            {
              name: 'Quinoa khichdi',
              time: '13:20',
              calories: '480 kcal',
              protein: '28g protein',
              source: 'camera',
              mealType: 'Lunch',
            },
            {
              name: 'Protein laddoo',
              time: '17:30',
              calories: '220 kcal',
              protein: '16g protein',
              source: 'verified',
              mealType: 'Snack',
            },
            {
              name: 'Dal makhani bowl',
              time: '21:00',
              calories: '560 kcal',
              protein: '32g protein',
              source: 'manual',
              mealType: 'Dinner',
            },
          ],
        },
        {
          id: 'threeDaysAgo',
          label: 'Sat',
          date: 'Sat · Nov 30',
          fitnessScore: 81,
          dietScore: 84,
          readiness: 'High · 87% primed',
          streakRisk: 'Safe · deload done',
          nutritionGap: '+9g fats remaining',
          sliderIndex: 3,
          fitnessGoals: [
            { label: 'Strength Volume', percent: 34, accent: '#ff9f7c' },
            { label: 'Conditioning Load', percent: 32, accent: '#f75f8f' },
            { label: 'Mobility & Primers', percent: 14, accent: '#9779ff' },
            { label: 'Recovery Blocks', percent: 20, accent: '#36c9c3' },
          ],
          dietSlices: [
            { label: 'Protein-Dense Meals', percent: 40, accent: '#ffd76f' },
            { label: 'Smart Carbs', percent: 31, accent: '#ff9f7c' },
            { label: 'Good Fats', percent: 20, accent: '#5fd4c6' },
            { label: 'Indulgences', percent: 9, accent: '#c488ff' },
          ],
          meals: [
            {
              name: 'Paneer toastie',
              time: '08:30',
              calories: '380 kcal',
              protein: '30g protein',
              source: 'verified',
              mealType: 'Breakfast',
            },
            {
              name: 'Lentil pasta',
              time: '13:10',
              calories: '530 kcal',
              protein: '35g protein',
              source: 'manual',
              mealType: 'Lunch',
            },
            {
              name: 'Chaat bowl',
              time: '17:00',
              calories: '290 kcal',
              protein: '14g protein',
              source: 'camera',
              mealType: 'Snack',
            },
            {
              name: 'Salmon rice',
              time: '20:45',
              calories: '600 kcal',
              protein: '41g protein',
              source: 'verified',
              mealType: 'Dinner',
            },
          ],
        },
        {
          id: 'fourDaysAgo',
          label: 'Fri',
          date: 'Fri · Nov 29',
          fitnessScore: 69,
          dietScore: 76,
          readiness: 'Low · 55% primed',
          streakRisk: 'Fragile · repair streak',
          nutritionGap: '-24g carbs logged',
          sliderIndex: 2,
          fitnessGoals: [
            { label: 'Strength Volume', percent: 26, accent: '#ff9f7c' },
            { label: 'Conditioning Load', percent: 21, accent: '#f75f8f' },
            { label: 'Mobility & Primers', percent: 24, accent: '#9779ff' },
            { label: 'Recovery Blocks', percent: 29, accent: '#36c9c3' },
          ],
          dietSlices: [
            { label: 'Protein-Dense Meals', percent: 29, accent: '#ffd76f' },
            { label: 'Smart Carbs', percent: 27, accent: '#ff9f7c' },
            { label: 'Good Fats', percent: 25, accent: '#5fd4c6' },
            { label: 'Indulgences', percent: 19, accent: '#c488ff' },
          ],
          meals: [
            {
              name: 'Moong cheela',
              time: '07:45',
              calories: '330 kcal',
              protein: '24g protein',
              source: 'camera',
              mealType: 'Breakfast',
            },
            {
              name: 'Burrito bowl',
              time: '13:25',
              calories: '570 kcal',
              protein: '34g protein',
              source: 'manual',
              mealType: 'Lunch',
            },
            {
              name: 'Protein yoghurt',
              time: '16:50',
              calories: '210 kcal',
              protein: '20g protein',
              source: 'verified',
              mealType: 'Snack',
            },
            {
              name: 'Veg kathi roll',
              time: '20:15',
              calories: '520 kcal',
              protein: '29g protein',
              source: 'manual',
              mealType: 'Dinner',
            },
          ],
        },
        {
          id: 'fiveDaysAgo',
          label: 'Thu',
          date: 'Thu · Nov 28',
          fitnessScore: 78,
          dietScore: 80,
          readiness: 'Balanced · 75% primed',
          streakRisk: 'Stable · add hydration',
          nutritionGap: '+5g fats remaining',
          sliderIndex: 1,
          fitnessGoals: [
            { label: 'Strength Volume', percent: 31, accent: '#ff9f7c' },
            { label: 'Conditioning Load', percent: 27, accent: '#f75f8f' },
            { label: 'Mobility & Primers', percent: 20, accent: '#9779ff' },
            { label: 'Recovery Blocks', percent: 22, accent: '#36c9c3' },
          ],
          dietSlices: [
            { label: 'Protein-Dense Meals', percent: 37, accent: '#ffd76f' },
            { label: 'Smart Carbs', percent: 32, accent: '#ff9f7c' },
            { label: 'Good Fats', percent: 18, accent: '#5fd4c6' },
            { label: 'Indulgences', percent: 13, accent: '#c488ff' },
          ],
          meals: [
            {
              name: 'Overnight oats',
              time: '06:50',
              calories: '340 kcal',
              protein: '25g protein',
              source: 'manual',
              mealType: 'Breakfast',
            },
            {
              name: 'Paneer tikka bowl',
              time: '12:45',
              calories: '510 kcal',
              protein: '37g protein',
              source: 'verified',
              mealType: 'Lunch',
            },
            {
              name: 'Trail mix',
              time: '16:10',
              calories: '260 kcal',
              protein: '12g protein',
              source: 'camera',
              mealType: 'Snack',
            },
            {
              name: 'Pho fusion bowl',
              time: '19:40',
              calories: '590 kcal',
              protein: '34g protein',
              source: 'verified',
              mealType: 'Dinner',
            },
          ],
        },
      ],
    }),
    [],
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
