const isProduction = process.env.NODE_ENV === 'production'

export function errorHandler(err, req, res, next) {
  // Log error details (redact sensitive info in production)
  const logError = {
    message: err.message,
    path: req.path,
    method: req.method,
    userId: req.auth?.userId || 'anonymous',
    timestamp: new Date().toISOString(),
  }

  if (!isProduction) {
    logError.stack = err.stack
  }

  console.error('Request error:', JSON.stringify(logError))

  // Determine status code
  let status = err.status || err.statusCode || 500

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400
  } else if (err.name === 'CastError') {
    status = 400
  } else if (err.code === 11000) {
    status = 409 // Duplicate key
  } else if (err.name === 'JsonWebTokenError') {
    status = 401
  } else if (err.name === 'TokenExpiredError') {
    status = 401
  }

  // Build response
  const response = {
    error: true,
    message: isProduction && status === 500
      ? 'An unexpected error occurred'
      : err.message || 'Internal server error',
  }

  // Add details in development
  if (!isProduction) {
    response.stack = err.stack
    response.details = err.details || err.meta
  }

  res.status(status).json(response)
}
