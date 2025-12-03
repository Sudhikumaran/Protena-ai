# Protena AI Athlete Console

Premium athlete experience inspired by boutique training ateliers. The app pairs calm editorial layouts with live AI briefings, immersive analytics, and nutrition planning tools.

## Highlights

- **Adaptive sidebar + mobile drawer** keeps navigation, streak stats, and quick actions always at hand.
- **Home + Dashboard storytelling** with hero cards, AI readiness briefings, radial timeline scrubber, and meal intelligence filters.
- **Nutrition + Plans + Streaks pages** mirror the Arsthanea aesthetic with scroll-reveal animations and contextual data tiles.
- **Accessibility controls** let users toggle high-contrast surfaces or calm-motion transitions without reloading.

## Getting Started

```bash
cd client
npm install
npm run dev
```

- `npm run dev` – start Vite dev server with React Fast Refresh.
- `npm run build` – production build (used to verify commits).
- `npm run preview` – serve the build locally for QA sessions.

## Project Structure

```
client/
	src/
		App.jsx          # shell + sidebar, routing, accessibility toggles
		App.css          # design system + page layouts and animations
		context/         # Athlete data context feeding every page
		pages/           # Home, Dashboard, Nutrition, Plans, Streaks
		components/      # Sparkline + shared UI atoms
		hooks/           # Scroll reveal + parallax helpers
```

## Design Notes

- Scroll progress powers the ambient radial glow across pages.
- Sidebar sticks on desktop and becomes an off-canvas drawer on mobile via `menu-trigger`.
- Animations respect the “Calm motion” toggle by disabling transitions through a data attribute.

## Deployment

Any static host that can serve the `client/dist` output works (Vercel, Netlify, Azure Static Web Apps, etc.).

1. Run `npm run build` in `client`.
2. Upload the generated `dist` folder to your host of choice.

Feel free to adapt copy, data, or styling to match your training brand’s tone.
