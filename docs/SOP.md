# Ketaflix — Standard Operating Procedures

## Development Workflow

### Before Starting Work
1. Read `docs/MEMORY-BANK.md` for current project state
2. Check this file for relevant patterns and decisions
3. Pull latest from main

### Component Patterns
- Use Tailwind CSS with glassmorphism aesthetic
- Combine `clsx` + `tailwind-merge` for dynamic classes
- anime.js v4 for all animations (only animation lib installed)
- Lucide React for icons (individual named imports)

### Database (Supabase)
- Use `@supabase/ssr` for server-side operations
- Realtime subscriptions for watchlist sync
- Row-level security policies on all tables

### API Integration (TMDB)
- Cache responses where possible
- Handle rate limits gracefully
- Always include poster fallback for missing images

### Deployment
- Netlify (auto-deploy from main)
- Environment variables managed via Doppler
- Run `npm run build` locally before pushing to catch SSR issues

## Decision Log

Architectural decisions that inform future work:

1. **Username-only auth** — No email/password. Optimized for casual friend-group usage, not enterprise security.
2. **Room-based model** — All movie activity is scoped to rooms. Users can be in multiple rooms.
3. **PWA-first** — Designed for mobile install. Test on mobile viewports.

## Patterns to Follow
- **anime.js v4 imports:** dynamic `import("animejs")` with `useRef` guard to prevent double-init
- **Lucide icons:** individual named imports (`import { Clapperboard } from "lucide-react"`), never import the full set
- **Brand vs DB names:** use UI labels (Krew, Flix) in components, keep DB table names (`rooms`, `watchlist`) unchanged
- **Invite links:** use Web Share API + `/join/[code]` route for crew sharing, not raw codes
- **Genre filtering:** use `EXCLUDED_GENRE_IDS` constant from `tmdb.ts` for filtering
- **Stitch designs:** use as visual reference only — study the screenshot, apply changes to existing Tailwind components

## Anti-patterns to Avoid
- **Don't rename DB tables/columns** for UI branding — only change labels in components
- **Don't import Framer Motion** — it's not installed despite old docs listing it
- **Don't use anime.js v3 patterns** — v4 is a breaking change (different API)
- **Don't hard-code genre IDs** — use `EXCLUDED_GENRE_IDS` from `tmdb.ts`
- **Don't copy-paste Stitch HTML** — translate visual patterns into existing component architecture
