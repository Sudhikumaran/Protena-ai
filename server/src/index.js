import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import athleteRoutes from './routes/athleteRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import workoutRoutes from './routes/workoutRoutes.js'
import { connectDB } from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('Missing CLERK_SECRET_KEY environment variable')
}

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))
app.use(ClerkExpressWithAuth())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.use('/api/athletes', athleteRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/workouts', workoutRoutes)
app.use(errorHandler)

async function startServer() {
  try {
    await connectDB(process.env.MONGODB_URI)
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server', error)
    process.exit(1)
  }
}

startServer()
