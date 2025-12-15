# Protena AI

A premium athlete experience app featuring AI-powered training, nutrition tracking, and streak management.

## Architecture

```
protena-ai/
├── client/           # React 19 + Vite frontend
├── server/           # Express 5 + MongoDB API
├── docker-compose.yml        # Production deployment
└── docker-compose.dev.yml    # Development (DB only)
```

## Quick Start (Development)

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Clerk account (authentication)
- OpenAI API key (optional, for AI features)

### 1. Clone and Install

```bash
git clone <repo-url>
cd protena-ai

# Install server dependencies
cd server
npm install
cp .env.example .env
# Edit .env with your credentials

# Install client dependencies
cd ../client
npm install
cp .env.example .env
# Edit .env with your credentials
```

### 2. Configure Environment

**Server (.env)**

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/protena
CLERK_SECRET_KEY=sk_test_xxxxx
OPENAI_API_KEY=sk-xxxxx  # Optional
```

**Client (.env)**

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

### 3. Run Development

```bash
# Terminal 1: Start MongoDB (or use Docker)
docker compose -f docker-compose.dev.yml up -d

# Terminal 2: Start server
cd server
npm run dev

# Terminal 3: Start client
cd client
npm run dev
```

### 4. Seed Sample Data

```bash
cd server
npm run seed
```

## Production Deployment

### Docker Compose (Recommended)

```bash
# Set environment variables
export CLERK_SECRET_KEY=sk_live_xxxxx
export VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
export OPENAI_API_KEY=sk-xxxxx
export MONGO_ROOT_PASSWORD=secure-password

# Build and deploy
docker compose up -d --build
```

### Manual Deployment

**Server:**

```bash
cd server
npm ci --only=production
NODE_ENV=production npm start
```

**Client:**

```bash
cd client
npm ci
npm run build
# Deploy dist/ folder to static host
```

## API Endpoints

### Health & Readiness

- `GET /health` - Basic health check
- `GET /ready` - Readiness probe (includes DB)

### Athletes (Protected)

- `GET /api/athletes/me/overview` - Current user overview
- `GET /api/athletes/me/daily?all=true` - Analytics timeline
- `POST /api/athletes/me` - Create/update profile (onboarding)
- `POST /api/athletes/me/meals` - Log a meal

### AI Features (Protected, Rate Limited)

- `GET /api/ai/coaching-brief` - Daily AI coaching summary
- `POST /api/ai/meal-suggestion` - AI-powered nutrition lookup
- `POST /api/ai/plan` - Generate workout plan

### Workouts (Protected)

- `GET /api/workouts/today` - Today's scheduled session
- `POST /api/workouts/:id/complete` - Mark workout complete

## Environment Variables

### Server

| Variable                  | Required | Default     | Description                       |
| ------------------------- | -------- | ----------- | --------------------------------- |
| `NODE_ENV`                | No       | development | Environment mode                  |
| `PORT`                    | No       | 4000        | Server port                       |
| `MONGODB_URI`             | Yes      | -           | MongoDB connection string         |
| `CLERK_SECRET_KEY`        | Yes      | -           | Clerk backend secret              |
| `OPENAI_API_KEY`          | No       | -           | OpenAI API key                    |
| `CORS_ORIGINS`            | No       | localhost   | Allowed origins (comma-separated) |
| `RATE_LIMIT_WINDOW_MS`    | No       | 900000      | Rate limit window (15 min)        |
| `RATE_LIMIT_MAX_REQUESTS` | No       | 100         | Max requests per window           |

### Client

| Variable                     | Required | Description        |
| ---------------------------- | -------- | ------------------ |
| `VITE_API_BASE_URL`          | Yes      | API server URL     |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes      | Clerk frontend key |

## Security Features

- ✅ Zod schema validation on all inputs
- ✅ Rate limiting (global + AI-specific)
- ✅ Security headers (XSS, CSRF, clickjacking)
- ✅ Input sanitization
- ✅ Production-safe error messages
- ✅ Request body size limits
- ✅ CORS configuration
- ✅ Clerk authentication on all protected routes

## Monitoring

### Health Checks

```bash
# Basic health
curl http://localhost:4000/health

# Readiness (includes DB)
curl http://localhost:4000/ready
```

### Logs

Production logs are JSON formatted:

```json
{
  "method": "GET",
  "path": "/api/athletes/me/overview",
  "status": 200,
  "duration": "45ms",
  "userId": "user_xxx"
}
```

## Development

### Code Structure

**Server:**

- `src/config/` - Environment & database configuration
- `src/controllers/` - Request handlers
- `src/middleware/` - Express middleware
- `src/models/` - Mongoose schemas
- `src/routes/` - Route definitions
- `src/schemas/` - Zod validation schemas
- `src/services/` - External service clients

**Client:**

- `src/components/` - Reusable UI components
- `src/context/` - React context providers
- `src/hooks/` - Custom React hooks
- `src/pages/` - Page components

### Running Tests

```bash
# Server
cd server
npm test

# Client
cd client
npm test
```

## License

ISC
