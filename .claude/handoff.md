---
created: 2026-04-12T15:30
project: ketaflix
branch: main
---

# Handoff: Ketaflix

## Completed
- **Doppler env vars complete** — added `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Doppler (`ketaflix/dev_personal`). All 3 required vars now present: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_TMDB_API_KEY`
- **Netlify env vars complete** — added `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Netlify site env
- **Production deploy** — deployed to https://ketaflix-app.netlify.app, verified working (homepage 200, discover 200, TMDB data loading)
- **Feature branch merged** — `feat/invite-links-icon-upgrade` merged to main (PR #12)
- **Git cleanup** — deleted 3 stale local branches, pruned 2 stale remote tracking refs
- **Build verification** — `npm run build` passes clean, 10 routes generated

## Current State
- **Build:** zero errors, zero warnings
- **Branch:** `main` — up to date with origin
- **Database:** completely empty (wiped 2026-03-30) — ready for real user accounts
- **Dev server:** `doppler run -p ketaflix -c dev_personal -- npm run dev` (localhost:3000)
- **Production:** https://ketaflix-app.netlify.app (live, auto-deploys on push to main)
- **Supabase CLI:** linked to project `ketamovies` (ref `amcxmbgkgkweuytdibqs`)

## Traps & Notes
- **Two Supabase accounts:** CLI default profile is the GitHub-linked account (has ketamovies, NIGEL, Licensing, C.H.A.R.M). The `schofieldspencer@gmail.com` account has novo-insurance-partners.
- **anime.js v4 only** — no other animation libs installed
- **Prettier auto-formats** on every Edit — re-read file before subsequent edits
- **Doppler:** `-p ketaflix -c dev_personal` for all Next.js secrets
- **Port 3088** can get stuck — use `fuser -k 3088/tcp`
- **Brand vs DB:** UI says "Krew" and "Flix" but DB tables are `rooms` and discover route. Never rename DB tables for branding.

## Next Steps
1. **Create first real user account** — test the signup -> login -> create Krew -> add movie flow
2. **Configure Google OAuth** — code is done, needs Google Cloud Console + Supabase Dashboard setup
3. **Add E2E tests** — Playwright or Cypress for critical flows
