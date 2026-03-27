# Ketaflix — Claude Code Project Config

## Context Loading
- Always read `docs/MEMORY-BANK.md` at session start for project context
- Check `docs/SOP.md` for project-specific patterns before implementing

## Project Commands
```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm start            # Production server
```

## Tech Stack
- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 3, glassmorphism design
- **Animation:** Framer Motion, GSAP, anime.js v4, Lottie, Lenis (smooth scroll)
- **Backend:** Supabase (auth, database, realtime)
- **External API:** TMDB (movie data)
- **Deploy:** Netlify
- **Secrets:** Doppler CLI — never create .env files

## Architecture Notes
- Username-only auth (no email/password) — intentionally simple for friend groups
- Supabase Realtime for live watchlist sync
- PWA-enabled for mobile install
- Crew-based model (Ketacrew): users create/join crews via shareable codes

## Code Conventions
- Use `clsx` + `tailwind-merge` for conditional class composition
- Prefer Framer Motion for component animations, GSAP for complex timelines
- anime.js v4 API (not v3) — see commit c7a8633 for migration details
