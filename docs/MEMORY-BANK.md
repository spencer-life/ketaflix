# Project Memory Bank

**Purpose:** Centralized context for all agents. Cache this file to reduce token usage by 40-60%.

---

## 1. Project Identity

| Property | Value |
|----------|-------|
| **Project Name** | Ketaflix |
| **Purpose** | Watch movies with friends — log the vibes |
| **Tech Stack** | Next.js 15, React 19, TypeScript, Supabase, Tailwind CSS 3, anime.js v4 |
| **Repository Type** | Social movie-watching app (friend group tool) |
| **Primary Use Case** | Create Ketacrews, build Ketaqueues together, log movies (Ketalogs) with ratings/vibes/notes, track group stats |
| **Hosting** | Netlify (see netlify.toml) |
| **Database** | Supabase (project: amcxmbgkgkweuytdibqs) |
| **External API** | TMDB (movie data + posters) |

---

## 2. Current State

### Completed
- Initial project scaffolding (Next.js 15 + Tailwind)
- Username-only auth with synthetic email (no real email required)
- Google OAuth buttons (code-side complete, needs Cloud Console + Supabase config)
- Social features: profiles, follows, activity feed
- Shareable crew codes (5-char alphanumeric)
- Real-time Ketaqueue sync via Supabase Realtime
- TMDB movie search with posters + metadata
- Movie discovery page with genre grid, curated sections (Now Playing, Trending, Popular, Top Rated)
- "Because you watched [X]" recommendations on Discover (uses `getRecommendations()`)
- Watch log (Ketalogs) with star ratings, vibe tags, notes
- Confetti on movie log
- Stats: genre breakdown, avg ratings, top picker
- PWA support (installable)
- Glassmorphism + particle field animations (toned down)
- anime.js v4 API migration
- **Branding:** Ketalogs (diary), Ketaqueue (watchlist), Ketacrew (rooms)
- **Persistent crew membership:** join once, always accessible via "My Ketacrews"
- **Home page redesign:** movie-centric landing with trending posters, enhanced feed with crew cards
- **Accessibility:** improved contrast, focus-visible outlines, alt text, ARIA labels

### In Progress
- Google OAuth configuration (external: Google Cloud Console + Supabase Dashboard)

### Planned
- E2E test the full flow (no test framework installed yet)
- User search / explore page
- Room list on user profiles

---

## 3. Key Decisions Log

| Date | Decision | Rationale | Impact |
|------|----------|-----------|--------|
| 2026-03-20 | Initialized Memory Bank | Establish structured project context | Enables consistent cross-session context |
| 2026-03-27 | Renamed Rooms to Ketacrew | Complete the Keta-prefix trifecta (Ketaqueue, Ketalogs, Ketacrew) | ~15 files updated, DB tables unchanged |
| 2026-03-27 | DB table names preserved | Avoid risky migrations; only rename UI text and function names | Tables still `rooms`, `users`, `watchlist` |
| 2026-03-27 | Persistent crew membership | Users should join once and always find their crews | Added `getUserCrews()`, CrewCard component |
| 2026-03-27 | Toned down particle animation | Landing page felt too "crypto" | Particle count 72→40, opacity 0.55→0.3 |

---

## 4. Agent Collaboration Log

### Session: 2026-03-20
**Work:** Memory Bank initialization, CLAUDE.md, SOP.md

### Session: 2026-03-26
**Work:** Social features (auth, profiles, follows, feed), anime.js v4 migration

### Session: 2026-03-27 (AM)
**Work:** Ketalogs/Ketaqueue rebrand, Discover page with TMDB, deployed to Netlify

### Session: 2026-03-27 (PM)
**Work:** Ketacrew rebrand, persistent crews, home page redesign, recommendations, accessibility polish

---

## 5. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| Google OAuth needs external config | Medium | Open | Code done; needs Google Cloud Console + Supabase Dashboard setup |
| No test framework | Low | Open | No Jest/Vitest/Playwright installed |
| Low contrast on some secondary text | Low | Fixed | Bumped `--text-muted` and timestamp opacity |

---

## 6. Quick Reference

### Essential Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm start            # Start production server
```

### Branding Map

| App Concept | DB Table | Brand Name |
|-------------|----------|------------|
| Watch queue | `watchlist` | **Ketaqueue** |
| Watch history | `watched` | **Ketalogs** |
| Groups | `rooms` + `users` | **Ketacrew** |

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/db.ts` | All Supabase CRUD (crews, movies, queue, watched, profiles, follows, feed) |
| `src/lib/tmdb.ts` | TMDB API (search, details, trending, genres, recommendations) |
| `src/lib/auth.ts` | Auth functions (signup, login, Google OAuth) |
| `src/lib/auth-context.tsx` | React auth context (user, profile, loading) |
| `src/app/page.tsx` | Landing page (unauth) + Feed page (auth) |
| `src/app/discover/page.tsx` | Movie discovery with recommendations |
| `src/app/room/[code]/page.tsx` | Ketacrew dashboard (4 tabs) |
| `src/components/CrewCard.tsx` | Persistent crew entry card |

### Directory Structure

```
ketaflix/
├── docs/
│   ├── MEMORY-BANK.md          # THIS FILE
│   └── SOP.md                  # Standard Operating Procedures
├── src/
│   ├── app/
│   │   ├── page.tsx            # Home (landing + feed)
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Design system
│   │   ├── discover/           # Movie discovery
│   │   ├── room/[code]/        # Ketacrew dashboard
│   │   ├── rooms/              # Join/create crew
│   │   ├── profile/[username]/ # User profiles
│   │   ├── settings/           # Account settings
│   │   ├── (auth)/             # Login + Register
│   │   └── auth/callback/      # OAuth callback
│   ├── components/             # 12 React components
│   ├── lib/                    # 5 core modules (db, tmdb, auth, supabase, utils)
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets + PWA manifest
├── CLAUDE.md                   # Agent instructions
├── netlify.toml                # Netlify deploy config
└── package.json
```

---

**Last Updated:** 2026-03-27
**Version:** 2.0
