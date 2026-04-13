# Project Memory Bank

**Purpose:** Centralized context for all agents. Cache this file to reduce token usage by 40-60%.

---

## 1. Project Identity

| Property | Value |
|----------|-------|
| **Project Name** | Ketaflix |
| **Purpose** | Watch movies with friends — log the vibes |
| **Tech Stack** | Next.js 15, React 19, TypeScript, Supabase, Tailwind CSS 3, anime.js v4, Lucide React |
| **Repository Type** | Social movie-watching app (friend group tool) |
| **Primary Use Case** | Create Ketacrews, build Ketaqueues together, log movies (Ketalogs) with ratings/vibes/notes, track group stats |
| **Hosting** | Netlify — https://ketaflix-app.netlify.app |
| **Database** | Supabase (project: amcxmbgkgkweuytdibqs) |
| **External API** | TMDB (movie data + posters) |

---

## 2. Current State

### Completed
- Initial project scaffolding (Next.js 15 + Tailwind)
- Username-only auth with synthetic email (no real email required)
- Google OAuth buttons (code-side complete, needs Cloud Console + Supabase config)
- Social features: profiles, follows, activity feed
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
- **Persistent crew membership:** join once, always accessible via "My Krews"
- **Home page redesign:** movie-centric landing with trending posters, enhanced feed with crew cards
- **Accessibility:** improved contrast, focus-visible outlines, alt text, ARIA labels
- **Logo:** UXWing horse head SVG silhouette (CC0) + emerald gradient wordmark (KetaflixLogo component)
- **Stitch-inspired redesign:** premium visual overhaul across all pages
- **NavBar icons:** Lucide icons — Clapperboard (Feed), Telescope (Flix), Sofa (Krew), UserRound (Profile), Settings
- **Invite links:** replaced shareable crew codes with Web Share API invite links + `/join/[code]` auto-join page
- **UI renames:** Discover → Flix, Ketacrew → Krew (DB tables unchanged)
- **Auth page redesign:** login/register layout with logo and improved spacing
- **Genre filtering:** horror/thriller/war/crime excluded from discovery suggestions
- **New components:** HorseIcon (horse-shaped ratings), UserAvatar (circular with gradient ring)
- **Data wipe:** all test data cleared from Supabase (2026-03-30) — fresh start

### In Progress
- Google OAuth configuration (external: Google Cloud Console + Supabase Dashboard)

### Planned
- E2E test the full flow (no test framework installed yet)
- User search / explore page

---

## 3. Key Decisions Log

| Date | Decision | Rationale | Impact |
|------|----------|-----------|--------|
| 2026-03-20 | Initialized Memory Bank | Establish structured project context | Enables consistent cross-session context |
| 2026-03-27 | Renamed Rooms to Ketacrew | Complete the Keta-prefix trifecta (Ketaqueue, Ketalogs, Ketacrew) | ~15 files updated, DB tables unchanged |
| 2026-03-27 | DB table names preserved | Avoid risky migrations; only rename UI text and function names | Tables still `rooms`, `users`, `watchlist` |
| 2026-03-27 | Persistent crew membership | Users should join once and always find their crews | Added `getUserCrews()`, CrewCard component |
| 2026-03-27 | Toned down particle animation | Landing page felt too "crypto" | Particle count 72→40, opacity 0.55→0.3 |
| 2026-03-28 | Discover → Flix | Better brand identity, matches Keta-prefix theme | NavBar label + page header updated |
| 2026-03-28 | Ketacrew → Krew (UI only) | Shorter, punchier label for the UI | ~15 files updated, DB tables unchanged |
| 2026-03-28 | Invite links over crew codes | Easier sharing via native share sheet | New `/join/[code]` page, Web Share API |
| 2026-03-28 | UXWing horse head logo | CC0 license, clean silhouette, works at all sizes | Replaced dragon-like FA icon |
| 2026-03-28 | Filter violent genres from discovery | App is for friend groups, not horror fans | EXCLUDED_GENRE_IDS in tmdb.ts |
| 2026-03-28 | Stitch designs as reference only | Preserve component architecture, don't rewire | Study screenshots, apply to existing Tailwind |

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

### Session: 2026-03-28
**Work:** KetaflixLogo component (horse head SVG), NavBar horse icon + emerald active state, Settings page redesign (emoji avatars, ring selection), Profile page avatar redesign, global text contrast boost, Stitch CLI harness built

### Session: 2026-03-28–29
**Work:** Discover→Flix rename, Ketacrew→Krew rename, genre filtering, auth page redesign, logo fix (UXWing concept-3), invite links replacing crew codes, Stitch-inspired premium redesign + Lucide icons, HorseIcon + UserAvatar components

### Session: 2026-03-30
**Work:** Supabase test data wipe (fresh start), all project documentation updated to reflect current state

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

| App Concept | DB Table | Brand Name | UI Label |
|-------------|----------|------------|----------|
| Watch queue | `watchlist` | **Ketaqueue** | Ketaqueue |
| Watch history | `watched` | **Ketalogs** | Ketalogs |
| Groups | `rooms` + `users` | **Ketacrew** | **Krew** |
| Discovery | — | — | **Flix** |

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/db.ts` | All Supabase CRUD (crews, movies, queue, watched, profiles, follows, feed) |
| `src/lib/tmdb.ts` | TMDB API (search, details, trending, genres, recommendations) |
| `src/lib/auth.ts` | Auth functions (signup, login, Google OAuth) |
| `src/lib/auth-context.tsx` | React auth context (user, profile, loading) |
| `src/app/page.tsx` | Landing page (unauth) + Feed page (auth) |
| `src/app/discover/page.tsx` | Flix — movie discovery with recommendations |
| `src/app/room/[code]/page.tsx` | Krew dashboard (4 tabs) |
| `src/app/join/[code]/page.tsx` | Invite link auto-join page |
| `src/components/KetaflixLogo.tsx` | Horse head SVG logo + emerald wordmark |
| `src/components/NavBar.tsx` | Bottom nav with Lucide icons |
| `src/components/HorseIcon.tsx` | Horse-shaped rating icons (filled/dim) |
| `src/components/UserAvatar.tsx` | Circular avatar with gradient ring |
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
│   ├── components/             # 16+ React components
│   ├── lib/                    # 5 core modules (db, tmdb, auth, supabase, utils)
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets + PWA manifest
├── .stitch/                    # Stitch design system + generated designs
├── logos/                      # Logo concepts + iterations
├── screenshots/                # Design iteration screenshots
├── CLAUDE.md                   # Agent instructions
├── netlify.toml                # Netlify deploy config
└── package.json
```

---

**Last Updated:** 2026-04-12
**Version:** 3.1
