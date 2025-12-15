import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'Clerk secret key is required'),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_API_URL: z.string().url().default('https://api.openai.com/v1/chat/completions'),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000'),
})

function validateEnv() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('❌ Invalid environment variables:')
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
    })
    process.exit(1)
  }

  return result.data
}

export const env = validateEnv()

export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
export const isTest = env.NODE_ENV === 'test'
