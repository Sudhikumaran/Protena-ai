const requestCounts = new Map()

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100

const AI_WINDOW_MS = 60 * 1000
const AI_MAX_REQUESTS = 10

function getClientIdentifier(req) {
  return req.auth?.userId || req.ip || req.headers['x-forwarded-for'] || 'anonymous'
}

function createRateLimiter(windowMs, maxRequests, keyPrefix = '') {
  return (req, res, next) => {
    const clientId = `${keyPrefix}:${getClientIdentifier(req)}`
    const now = Date.now()

    let record = requestCounts.get(clientId)

    if (!record || now - record.windowStart > windowMs) {
      record = { count: 1, windowStart: now }
      requestCounts.set(clientId, record)
    } else {
      record.count++
    }

    const remaining = Math.max(0, maxRequests - record.count)
    const resetTime = Math.ceil((record.windowStart + windowMs - now) / 1000)

    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTime.toString(),
    })

    if (record.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: resetTime,
      })
    }

    next()
  }
}

export const rateLimiter = createRateLimiter(WINDOW_MS, MAX_REQUESTS, 'global')

export const aiRateLimiter = createRateLimiter(AI_WINDOW_MS, AI_MAX_REQUESTS, 'ai')

setInterval(() => {
  const now = Date.now()
  for (const [key, record] of requestCounts.entries()) {
    if (now - record.windowStart > Math.max(WINDOW_MS, AI_WINDOW_MS) * 2) {
      requestCounts.delete(key)
    }
  }
}, 60 * 1000)
