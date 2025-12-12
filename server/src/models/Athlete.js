import mongoose from 'mongoose'

const { Schema } = mongoose

const ProfileSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    focus: String,
    age: Number,
    weight: String,
    height: String,
    fitnessLevel: String,
    badHabits: [String],
    goal: String,
  },
  { _id: false },
)

const GoalPrescriptionSchema = new Schema(
  {
    calories: String,
    proteinTarget: String,
    dietPlan: String,
    workoutPlan: String,
    notes: String,
  },
  { _id: false },
)

const OverviewStatSchema = new Schema(
  {
    label: String,
    value: String,
    delta: String,
    unit: String,
  },
  { _id: false },
)

const FocusCardSchema = new Schema(
  {
    label: String,
    value: String,
    trend: String,
    trendPoints: [Number],
  },
  { _id: false },
)

const TimelineEntrySchema = new Schema(
  {
    time: String,
    title: String,
    detail: String,
  },
  { _id: false },
)

const MacroSplitSchema = new Schema(
  {
    label: String,
    value: String,
    percent: Number,
  },
  { _id: false },
)

const MealLogSchema = new Schema(
  {
    title: String,
    protein: String,
    calories: String,
    status: String,
    mealType: String,
  },
  { _id: false },
)

const PlanTrackSchema = new Schema(
  {
    name: String,
    detail: String,
    focus: String,
  },
  { _id: false },
)

const WorkoutSegmentSchema = new Schema(
  {
    title: String,
    detail: String,
  },
  { _id: false },
)

const DailyWorkoutSchema = new Schema(
  {
    id: { type: String, required: true },
    day: String,
    focus: String,
    intensity: String,
    duration: String,
    scheduledFor: String,
    segments: [WorkoutSegmentSchema],
    notes: String,
    completed: { type: Boolean, default: false },
    completedAt: String,
  },
  { _id: false },
)

const StreakCellSchema = new Schema(
  {
    completed: Boolean,
    today: Boolean,
    proteinPerfect: Boolean,
  },
  { _id: false },
)

const AnalyticsMealSchema = new Schema(
  {
    name: String,
    time: String,
    calories: String,
    protein: String,
    source: String,
    mealType: String,
  },
  { _id: false },
)

const AnalyticsSliceSchema = new Schema(
  {
    label: String,
    percent: Number,
    accent: String,
  },
  { _id: false },
)

const AnalyticsSchema = new Schema(
  {
    id: String,
    label: String,
    date: String,
    fitnessScore: Number,
    dietScore: Number,
    readiness: String,
    streakRisk: String,
    nutritionGap: String,
    sliderIndex: Number,
    fitnessGoals: [AnalyticsSliceSchema],
    dietSlices: [AnalyticsSliceSchema],
    meals: [AnalyticsMealSchema],
  },
  { _id: false },
)

const AthleteSchema = new Schema(
  {
    clerkUserId: { type: String, unique: true, sparse: true },
    profile: ProfileSchema,
    goalPrescription: GoalPrescriptionSchema,
    overviewStats: [OverviewStatSchema],
    heroBadges: [String],
    statHighlights: [OverviewStatSchema],
    focusCards: [FocusCardSchema],
    timeline: [TimelineEntrySchema],
    macroSplits: [MacroSplitSchema],
    mealLog: [MealLogSchema],
    planTracks: [PlanTrackSchema],
    dailyWorkouts: [DailyWorkoutSchema],
    quickActions: [String],
    streak: {
      length: Number,
      grid: [StreakCellSchema],
    },
    analyticsDays: [AnalyticsSchema],
  },
  { timestamps: true },
)

export default mongoose.model('Athlete', AthleteSchema)
