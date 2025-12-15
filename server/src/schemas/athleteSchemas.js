import { z } from 'zod'

export const onboardingSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z
    .string()
    .email('Invalid email address')
    .optional(),
  weight: z
    .number()
    .min(20, 'Weight must be at least 20 kg')
    .max(300, 'Weight must be less than 300 kg'),
  height: z
    .number()
    .min(100, 'Height must be at least 100 cm')
    .max(250, 'Height must be less than 250 cm')
    .optional(),
  goal: z
    .string()
    .min(1, 'Goal is required')
    .max(100, 'Goal must be less than 100 characters'),
  focus: z
    .string()
    .max(100, 'Focus must be less than 100 characters')
    .optional(),
  dietPreference: z
    .string()
    .max(100, 'Diet preference must be less than 100 characters')
    .optional(),
  trainingFrequency: z
    .number()
    .min(1, 'Training frequency must be at least 1')
    .max(7, 'Training frequency cannot exceed 7 days')
    .optional(),
  badHabits: z
    .array(z.string().max(100))
    .max(10, 'Cannot specify more than 10 habits')
    .optional(),
})

export const mealSchema = z.object({
  title: z
    .string()
    .min(1, 'Meal title is required')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  calories: z
    .union([z.number(), z.string()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d.]/g, '')) : val
      return isNaN(num) ? 0 : num
    })
    .pipe(z.number().min(0, 'Calories cannot be negative').max(10000, 'Calories seem too high')),
  protein: z
    .union([z.number(), z.string()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d.]/g, '')) : val
      return isNaN(num) ? 0 : num
    })
    .pipe(z.number().min(0, 'Protein cannot be negative').max(500, 'Protein seems too high')),
  status: z
    .enum(['manual', 'camera', 'verified', 'ai'])
    .default('manual'),
  mealType: z
    .enum(['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner', 'Post Workout', 'Dessert', 'Snack'])
    .default('Snack'),
  source: z
    .string()
    .max(50)
    .optional(),
  time: z
    .string()
    .optional(),
  dayId: z
    .string()
    .max(50)
    .default('today'),
})

export const mealSuggestionSchema = z.object({
  query: z
    .string()
    .min(1, 'Meal name or description is required')
    .max(500, 'Query must be less than 500 characters')
    .trim(),
  mealType: z
    .enum(['Breakfast', 'Morning Snack', 'Lunch', 'Evening Snack', 'Dinner', 'Post Workout', 'Dessert', 'Snack'])
    .optional(),
})

export const planGenerationSchema = z.object({
  prompt: z
    .string()
    .max(1000, 'Prompt must be less than 1000 characters')
    .default(''),
  trainingDays: z
    .union([z.number(), z.string()])
    .transform((val) => {
      const num = typeof val === 'string' ? parseInt(val, 10) : val
      return isNaN(num) ? 4 : num
    })
    .pipe(z.number().min(3, 'Minimum 3 training days').max(7, 'Maximum 7 training days'))
    .optional(),
})

export function validateRequest(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))

      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      })
    }

    req.validatedBody = result.data
    next()
  }
}
