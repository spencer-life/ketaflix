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
- **Animation:** anime.js v4 (only animation lib installed)
- **Icons:** Lucide React (individual named imports)
- **Backend:** Supabase (auth, database, realtime)
- **External API:** TMDB (movie data)
- **Deploy:** Netlify
- **Secrets:** Doppler CLI — never create .env files
- **Design System:** `.stitch/DESIGN.md` (Stitch-generated, used as visual reference only)

## Architecture Notes
- Username-only auth (synthetic email `user@ketaflix.app`) — simple for friend groups
- Supabase Realtime for live watchlist sync
- PWA-enabled for mobile install
- Crew-based model: users create/join Krews via invite links (`/join/[code]`)

## Branding
- UI labels differ from internal brand names. DB tables never change.
- **Ketaqueue** (watchlist) — UI: "Ketaqueue", DB: `watchlist`
- **Ketalogs** (watch history) — UI: "Ketalogs", DB: `watched`
- **Ketacrew** (groups) — UI: "Krew", DB: `rooms` + `users`
- **Discover** — UI: "Flix"

## Code Conventions
- Use `clsx` + `tailwind-merge` for conditional class composition
- anime.js v4 API only (v3 patterns are breaking) — dynamic import with useRef guard
- Lucide icons: individual named imports, never import full set
- Stitch designs are reference only — translate visuals into existing Tailwind components
