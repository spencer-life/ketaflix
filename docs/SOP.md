# Ketaflix — Standard Operating Procedures

## Development Workflow

### Before Starting Work
1. Read `docs/MEMORY-BANK.md` for current project state
2. Check this file for relevant patterns and decisions
3. Pull latest from main

### Component Patterns
- Use Tailwind CSS with glassmorphism aesthetic
- Combine `clsx` + `tailwind-merge` for dynamic classes
- Framer Motion for enter/exit animations
- GSAP for complex animation sequences
- anime.js v4 for particle/background effects

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
- [Add patterns as they emerge during development]

## Anti-patterns to Avoid
- [Add anti-patterns as they're discovered]
