import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import compression from 'compression'
import dotenv from 'dotenv'
dotenv.config()

import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import athleteRoutes from './routes/athleteRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import workoutRoutes from './routes/workoutRoutes.js'
import { connectDB } from './config/db.js'
import { errorHandler } from './middleware/errorHandler.js'
import { rateLimiter } from './middleware/rateLimiter.js'
import { securityHeaders, sanitizeInput, requestLogger } from './middleware/security.js'
import { env, isProduction } from './config/env.js'

const app = express()
const PORT = env.PORT

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1)

// Security middleware
app.use(securityHeaders)
app.use(sanitizeInput)

// CORS configuration
const corsOrigins = env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
app.use(cors({
  origin: isProduction ? corsOrigins : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Compression for responses
app.use(compression())

// Body parsing with limits
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Logging
app.use(isProduction ? requestLogger : morgan('dev'))

// Rate limiting
app.use(rateLimiter)

// Authentication
app.use(ClerkExpressWithAuth())

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || '0.1.0',
  })
})

// Readiness check (includes DB)
app.get('/ready', async (req, res) => {
  try {
    const mongoose = (await import('mongoose')).default
    const dbState = mongoose.connection.readyState
    if (dbState !== 1) {
      return res.status(503).json({ status: 'not ready', db: 'disconnected' })
    }
    res.json({ status: 'ready', db: 'connected' })
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message })
  }
})

app.use('/api/athletes', athleteRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/workouts', workoutRoutes)
app.use(errorHandler)

let server

async function startServer() {
  try {
    await connectDB(env.MONGODB_URI)
    server = app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT} [${env.NODE_ENV}]`)
    })
  } catch (error) {
    console.error('Failed to start server', error)
    process.exit(1)
  }
}

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`)

  if (server) {
    server.close(async () => {
      console.log('HTTP server closed')
      try {
        const mongoose = (await import('mongoose')).default
        await mongoose.connection.close()
        console.log('MongoDB connection closed')
        process.exit(0)
      } catch (error) {
        console.error('Error during shutdown:', error)
        process.exit(1)
      }
    })

    // Force shutdown after 30 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout')
      process.exit(1)
    }, 30000)
  } else {
    process.exit(0)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

startServer()
