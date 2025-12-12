# Protena API Server

Node.js + Express backend feeding the Protena athlete dashboard. MongoDB stores athlete profiles, AI analytics, and meal logs.

## Setup

```bash
cd server
cp .env.example .env
# update MONGODB_URI with your credentials and supply CLERK_SECRET_KEY + OPENAI_API_KEY
npm install
npm run dev
```

- `npm run dev`: start server with nodemon.
- `npm start`: production mode.
- `npm run seed`: load the sample Jordan Vega athlete document.

### Seed data

1. Create `.env` from the example and set `MONGODB_URI` with your password plus `CLERK_SECRET_KEY` from the Clerk dashboard. Add `OPENAI_API_KEY` if you want AI coaching briefs.
2. Run `npm run seed` to wipe the `athletes` collection and insert the curated sample.
3. Start the API (`npm run dev`) and hit `/api/athletes/:id/overview` using the seeded ID printed in the console.

## Endpoints (v1)

- `GET /health` – ping.
- `POST /api/athletes/me` – create/update the signed-in athlete from onboarding inputs.
- `GET /api/athletes/me/overview` – overview scoped to the authenticated Clerk user.
- `GET /api/athletes/me/daily?all=true` – analytics timeline scoped to the authenticated user.
- `GET /api/athletes/:id/overview` – sidebar + hero data.
- `GET /api/athletes/:id/daily?date=YYYY-MM-DD` – analytics and meals for a day (or add `?all=true`).
- `POST /api/athletes/:id/meals` – append a meal to the log and analytics timeline.
- `GET /api/ai/coaching-brief` – AI-generated daily brief for the signed-in athlete.
- `POST /api/ai/meal-suggestion` – send `{ query, mealType }` to get macros + ingredient guidance for a meal.
- `POST /api/ai/plan` – send `{ prompt, trainingDays }` to regenerate the weekly workout schedule.
- `GET /api/workouts/today` – fetch today’s scheduled session based on the latest plan.
- `POST /api/workouts/:id/complete` – mark a session complete and unlock the next workout.

Extend controllers/routes to cover meals, plans, streaks, etc.
