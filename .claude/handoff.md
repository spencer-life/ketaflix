---
created: 2026-03-30T18:00
project: ketaflix
branch: feat/invite-links-icon-upgrade
---

# Handoff: Ketaflix

## Completed
- **Supabase data wipe** — all 8 tables + auth.users truncated to 0 rows (fresh start)
- **CLAUDE.md updated** — fixed animation libs (removed Framer Motion/GSAP/Lottie/Lenis, kept anime.js v4 only), added branding section, Stitch reference, invite links architecture
- **MEMORY-BANK.md updated** — added 9 completed items, 6 key decisions, 3 session log entries, updated branding map with UI labels, added 5 key files, bumped to v3.0
- **SOP.md updated** — fixed animation references, filled patterns-to-follow (6 items) and anti-patterns (5 items)
- **DESIGN.md updated** — updated NavBar icons (Lucide names), added logo section (UXWing CC0), updated feature names with Flix/Krew UI labels
- **Stale handoff deleted** — previous handoff from 2026-03-28 removed (all work complete)
- **Memory file updated** — `project_ketaflix_stitch.md` marked Stitch integration as completed

## Current State
- **Build:** zero errors, zero warnings (`npm run build` passes clean)
- **Branch:** `feat/invite-links-icon-upgrade` — 8 commits ahead of main
- **Database:** completely empty — ready for real user accounts
- **Uncommitted changes:** doc updates (CLAUDE.md, MEMORY-BANK.md, SOP.md, DESIGN.md), handoff deletion, plus ~60 untracked screenshot/design files from previous design iteration sessions
- **Supabase CLI:** linked to project `ketamovies` (ref `amcxmbgkgkweuytdibqs`) via GitHub-linked account (separate from `schofieldspencer@gmail.com` Supabase account)
- **Dev server:** not running (was on port 3088 previously)

## Data State
- All tables empty (0 rows): profiles, follows, activity_feed, rooms, users, movies, watchlist, watched
- auth.users also cleared (0 accounts)
- App is ready for fresh user signups — no test data remains
- Supabase project: `ketamovies` (ref `amcxmbgkgkweuytdibqs`, East US North Virginia)

## Traps & Notes
- **Two Supabase accounts:** CLI default profile is the GitHub-linked account (has ketamovies, NIGEL, Licensing, C.H.A.R.M). The `schofieldspencer@gmail.com` account has novo-insurance-partners. Use default profile for Ketaflix.
- **Supabase CLI queries:** `npx supabase db query --linked "SQL"` (project must be linked first)
- **anime.js v4 only** — Framer Motion, GSAP, Lottie, Lenis are NOT installed despite old docs listing them. All animations use anime.js v4.
- **Prettier auto-formats** on every Edit — re-read file before subsequent edits
- **Doppler:** `-p ketaflix -c dev_personal` for Next.js secrets, `-p charm -c dev_personal` for gemini-vision
- **Port 3088** can get stuck — use `fuser -k 3088/tcp`
- **Brand vs DB:** UI says "Krew" and "Flix" but DB tables are `rooms` and the discover page route. Never rename DB tables for branding.
- **Logo:** UXWing horse head SVG (CC0), HorseIcon for ratings (CC BY 4.0). The `iconOnly` prop on KetaflixLogo shows just the horse.

## Relevant Files
- `CLAUDE.md` — project config (just updated)
- `docs/MEMORY-BANK.md` — full project context (v3.0, just updated)
- `docs/SOP.md` — patterns and anti-patterns (just updated)
- `.stitch/DESIGN.md` — design system (just updated)
- `src/lib/db.ts` — all Supabase CRUD operations
- `src/lib/auth.ts` — auth (signup/login with synthetic emails)
- `src/lib/supabase.ts` — Supabase client setup
- `src/components/KetaflixLogo.tsx` — horse head SVG + wordmark
- `src/components/NavBar.tsx` — bottom nav with Lucide icons
- `src/components/HorseIcon.tsx` — horse-shaped rating icons
- `src/components/UserAvatar.tsx` — circular avatar with gradient ring
- `src/app/join/[code]/page.tsx` — invite link auto-join page
- `src/app/page.tsx` — home (landing + feed)
- `src/app/discover/page.tsx` — Flix discovery page

## Next Steps
1. **Merge `feat/invite-links-icon-upgrade` into main** — 8 commits of completed work, build is clean
2. **Commit doc updates** — the CLAUDE.md, MEMORY-BANK.md, SOP.md, DESIGN.md changes from this session
3. **Deploy to Netlify** — push to main triggers auto-deploy
4. **Create first real user account** — test the fresh signup flow
5. **Configure Google OAuth** — code is done, needs Google Cloud Console + Supabase Dashboard setup
6. **Set up E2E tests** — no test framework installed yet
