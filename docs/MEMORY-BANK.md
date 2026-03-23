# Project Memory Bank

**Purpose:** Centralized context for all agents. Cache this file to reduce token usage by 40-60%.

---

## 1. Project Identity

| Property | Value |
|----------|-------|
| **Project Name** | Ketaflix |
| **Purpose** | Watch movies with friends — log the vibes |
| **Tech Stack** | Next.js 15, React 19, TypeScript, Supabase, Tailwind CSS, Framer Motion, GSAP, anime.js, Lottie, Lenis |
| **Repository Type** | Social movie-watching app (friend group tool) |
| **Primary Use Case** | Create rooms, build watchlists together, log movies with ratings/vibes/notes, track group stats |
| **Hosting** | Netlify (see netlify.toml) |
| **Database** | Supabase (project: amcxmbgkgkweuytdibqs) |
| **External API** | TMDB (movie data + posters) |

---

## 2. Current State

### Completed
- Initial project scaffolding (Next.js 15 + Tailwind)
- Username-only auth (no email/password)
- Shareable room codes
- Real-time watchlist via Supabase Realtime
- TMDB movie search with posters + metadata
- Watch log with star ratings, vibe tags, notes
- Confetti on movie log
- Stats: genre breakdown, avg ratings, top picker
- PWA support (installable)
- Glassmorphism + particle field animations
- anime.js v4 API migration

### In Progress
- [To be filled]

### Planned
- [To be filled]

---

## 3. Key Decisions Log

| Date | Decision | Rationale | Impact |
|------|----------|-----------|--------|
| 2026-03-20 | Initialized Memory Bank | Establish structured project context for agent collaboration | Enables consistent cross-session context |

---

## 4. Agent Collaboration Log

### Session: 2026-03-20

**Participants:**
- Claude Code — Project initialization

**Work Completed:**
- [x] Created Memory Bank structure
- [x] Created CLAUDE.md with agent delegation strategy
- [x] Created SOP.md for project patterns

**Next Agent Assignments:**
- [To be determined based on project goals]

---

## 5. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| (none logged yet) | — | — | — |

---

## 6. Quick Reference

### Essential Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm start            # Start production server

# File locations
docs/MEMORY-BANK.md  # Project context (THIS FILE)
docs/SOP.md          # Standard Operating Procedures
CLAUDE.md            # Agent delegation strategy
```

### Key Files by Purpose

| File | Purpose | When to Reference |
|------|---------|-------------------|
| `CLAUDE.md` | Agent delegation strategy | Starting new work |
| `docs/MEMORY-BANK.md` | Project context (cached) | Every agent conversation |
| `docs/SOP.md` | Implementation procedures & decisions | During development |
| `src/` | Application source code | Development |
| `netlify.toml` | Deployment config | Deploy changes |

### Directory Structure

```
ketaflix/
├── docs/
│   ├── MEMORY-BANK.md          # THIS FILE (context cache)
│   └── SOP.md                  # Standard Operating Procedures
├── src/                        # Next.js app source
├── public/                     # Static assets
├── CLAUDE.md                   # Agent delegation strategy
├── netlify.toml                # Netlify deploy config
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
└── package.json
```

---

## 7. Update Checklist

**After Each Major Work:**

- [ ] Update "Current State" section with progress
- [ ] Add entry to "Agent Collaboration Log"
- [ ] Log decisions in "Key Decisions Log" if architectural choices made
- [ ] Update "Known Issues" if bugs found
- [ ] Refresh "Quick Reference" if commands/files changed

---

**Last Updated:** 2026-03-20
**Version:** 1.0
**Caching Status:** Ready for caching (40-60% token savings)
