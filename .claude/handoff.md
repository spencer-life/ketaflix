---
created: 2026-03-28T03:15
project: ketaflix
branch: main
---

## Completed

- KetaflixLogo component (`src/components/KetaflixLogo.tsx`) — horse head SVG silhouette (Gemini CLI generated path) + "Ketaflix" wordmark with emerald gradient
- Logo integrated into home page feed header (148px) and landing page card (200px)
- NavBar Feed icon replaced with horse brand mark (matching logo path)
- NavBar: active tab now uses emerald accent color, inactive bumped to /45, added px-6 pb-1
- Settings page redesigned: removed outer card wrapper, circular emoji avatars with emerald ring + ring-offset selected state, discoverable card simplified, sign out button cleaned up, pb-36 for nav clearance
- Profile page: avatar now rounded-full with emerald/amber gradient background, text contrast boosted
- Global text contrast boost: text-white/20→/35, /25→/40, /30→/45, /40→/55 across all pages
- Input field styling: border from 0.08→0.1 opacity, padding from 1rem→1.15rem
- Stitch CLI harness built at `/tmp/cli-anything/stitch/agent-harness/` (Click-based, installable)
- Committed as 556c8fe on main

## Current State

- Build: zero errors, zero lint warnings
- Branch: main at 556c8fe
- Dev server was running on port 3088 (may need restart)
- Stitch CLI installed in venv at `/tmp/cli-anything/stitch/agent-harness/.venv/`
- Stitch CLI NOT authenticated yet — needs `STITCH_API_KEY` or Google ADC setup

## Gemini Pro Scores (Round 1 baseline, before fixes)

| Page | Score | Key Issues |
|------|-------|-----------|
| Home | 7.8 | NavBar Feed icon, text contrast, spacing rhythm |
| Discover | 8.2 | Missing emerald on active states, genre pill icons |
| Rooms | 7.5 | Tab border too bright, spacing rhythm, nav icon |
| Room Detail | 7.5 | Text contrast, Follow button too weak, nav icon |
| Profile | 7.0 | Muddy cards, generic avatars, Follow button |
| Settings | 5.5 | Outer card wrapper, emoji grid cheap, nav overlap |

Scores after fixes were inconsistent (Gemini Pro is stochastic, ranging ±2 between runs). The fixes addressed every specific critique but the scorer variance makes round-over-round comparison unreliable.

## Data State

N/A — no database in this project. Frontend visual quality iteration only.

## Next Steps

### Step 1: Set up Stitch CLI auth and create Ketaflix project

```bash
# Activate the stitch CLI
source /tmp/cli-anything/stitch/agent-harness/.venv/bin/activate

# Option A: API key (if you have one)
export STITCH_API_KEY="your-key"

# Option B: Google ADC
# The CLI will auto-detect google-auth credentials
# May need: gcloud auth application-default login

# Create the Ketaflix project
cli-anything-stitch project create "Ketaflix UI Redesign"

# Verify
cli-anything-stitch session status
```

### Step 2: Generate redesigned screens with Stitch

Use Stitch to generate high-fidelity redesigns for each of the 6 pages. Use the 3-Layer Vibe Structure for prompts:

**Anatomy** (layout) + **Vibe** (aesthetic) + **Content** (data)

Example prompts for each page:

```bash
# Home Feed
cli-anything-stitch screen generate "Mobile dark-mode social movie feed. Emerald (#34d399) accent on deep black (#050608). Glassmorphism cards. Horse logo top-left. Sections: trending poster carousel, genre pills, crew cards, people to follow, popular movies grid. Space Grotesk font. Cinematic premium feel like Letterboxd meets Netflix." --device PHONE

# Discover
cli-anything-stitch screen generate "Mobile movie discovery page. Dark mode, emerald accent. Hero section with featured movie backdrop + gradient overlay. Browse by genre pills with small icons. Now Playing poster grid with rating badges. Premium streaming app aesthetic." --device PHONE

# Rooms (Ketacrew)
cli-anything-stitch screen generate "Mobile crew/group join page for movie app. Dark mode, emerald accent. Segmented control: Join Crew | Create Crew. Code input field. List of existing crews below. Clean, minimal, premium." --device PHONE

# Room Detail
cli-anything-stitch screen generate "Mobile crew dashboard for movie group. Dark mode, emerald accent. Header with crew name and member count. Tabbed content: Activity, Watched, Queue, Stats. Movie poster thumbnails in lists. Social activity feed." --device PHONE

# Profile
cli-anything-stitch screen generate "Mobile user profile for movie app. Dark mode, emerald accent. Large circular avatar with gradient bg. Username, bio, stats row (followers, following, films). Recent activity list with movie poster thumbnails." --device PHONE

# Settings
cli-anything-stitch screen generate "Mobile settings/profile editor. Dark mode, emerald accent. Circular emoji avatar picker with selection ring. Display name input, bio textarea, discoverable toggle. Save button. Sign out at bottom. No card wrapper, floating layout." --device PHONE
```

### Step 3: Export Stitch code and integrate

For each generated screen:
```bash
cli-anything-stitch screen code <screen-id> --output ./stitch-exports/<page>/
cli-anything-stitch screen image <screen-id> --output ./screenshots/stitch-<page>.png
```

Use the exported HTML/CSS as reference to update the actual Next.js/Tailwind pages. Don't copy-paste directly — translate the Stitch designs into the existing component architecture.

### Step 4: Re-score with Gemini Pro

After integrating Stitch designs, re-run the scoring loop:
```bash
# Screenshot all 6 pages
chrome-devtools emulate --viewport "390x844x3,mobile,touch" --colorScheme dark
# ... navigate + screenshot each page ...

# Score in parallel
doppler run -p charm -c dev_personal -- gemini-vision --pro <screenshot> "<scoring prompt>"
```

Target: 9.0+ on every page.

### Known Issues Gemini Pro Keeps Flagging

1. **NavBar Feed icon** — horse silhouette reads ambiguously at 20px. Consider using a simple filled home/house icon instead if Stitch designs suggest it
2. **Text contrast** — some secondary text still flagged despite boost
3. **Genre pill icon stroke weights** — inconsistent per Gemini
4. **Follow button** — too subtle (thin outline)
5. **Rating badges** — inconsistent presence across posters

### Brand Guidelines (Stay On Brand)

- **Colors**: Emerald accent `#34d399`, warm amber `#f59e0b`, deep bg `#050608`
- **Font**: Space Grotesk (already imported via Google Fonts)
- **Aesthetic**: Cinematic dark mode, glassmorphism cards, minimal borders, content-first
- **DO NOT**: Change app name, rename features (Ketalogs, Ketaqueue, Ketacrew), or change core layout
- **DO**: Refine CSS, swap icons, adjust spacing, improve micro-interactions

## Relevant Files

- `src/components/KetaflixLogo.tsx` -- horse head SVG logo + wordmark component
- `src/app/globals.css` -- all CSS custom properties, utility classes, component styles
- `src/app/page.tsx` -- home/landing page (FeedPage + LandingPage)
- `src/app/discover/page.tsx` -- discover page
- `src/app/rooms/page.tsx` -- rooms page
- `src/app/room/[code]/page.tsx` -- room detail page
- `src/app/profile/[username]/page.tsx` -- profile page
- `src/app/settings/page.tsx` -- settings page (redesigned this session)
- `src/components/NavBar.tsx` -- bottom nav with horse icon
- `src/components/MoviePoster.tsx` -- poster component
- `src/components/FollowButton.tsx` -- follow/unfollow button
- `src/components/ProfileCard.tsx` -- user card in "People to Follow"

## Stitch CLI Reference

| Command | What it does |
|---------|-------------|
| `source /tmp/cli-anything/stitch/agent-harness/.venv/bin/activate` | Activate venv |
| `cli-anything-stitch --help` | Full command listing |
| `cli-anything-stitch project list` | List Stitch projects |
| `cli-anything-stitch project create "Name"` | Create project (auto-sets active) |
| `cli-anything-stitch project use <id>` | Set active project |
| `cli-anything-stitch screen generate "prompt" --device PHONE` | Generate screen from text |
| `cli-anything-stitch screen list` | List screens in active project |
| `cli-anything-stitch screen image <id> --output path.png` | Export rendered image |
| `cli-anything-stitch screen code <id> --output dir/` | Export HTML/CSS code |
| `cli-anything-stitch screen variants "prompt" --count 3` | Generate N design variants |
| `cli-anything-stitch session status` | Show active project + session |

**Note**: The CLI lives in `/tmp/` which gets wiped on reboot. If lost, regenerate with `/cli-anything stitch` or rebuild from the Context7 docs.

## Traps

- Supabase Realtime filters use DB table names — do NOT rename
- framer-motion listed in CLAUDE.md but NOT installed; all animations use anime.js v4
- Prettier auto-formats on every Edit — re-read file before subsequent edits
- `gemini-vision --pro` prompt must be short to avoid ENOENT filename-too-long
- Doppler: `-p ketaflix -c dev_personal` for Next.js, `-p charm -c dev_personal` for gemini-vision
- chrome-devtools: uses `evaluate_script` (not `evaluate`)
- Dev server needs `.next` cache cleared after changing lucide icon imports
- Port 3088 can get stuck — use `fuser -k 3088/tcp`
- Viewport emulation must be set before EACH browser session
- Gemini Pro scores are stochastic (±2 variance between runs for same page)
- Stitch CLI venv at `/tmp/` — survives session but not reboot

## Open Decisions

- Whether to keep horse icon in NavBar or swap for simpler home icon
- Whether to use Stitch-generated designs as direct code or just visual reference
