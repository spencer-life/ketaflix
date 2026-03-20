# 🎬 Ketaflix

Watch movies with your friends. Log the vibes.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment** — copy `.env.local.example` to `.env.local` and fill in:
   - Supabase keys from [supabase.com/dashboard/project/amcxmbgkgkweuytdibqs/settings/api](https://supabase.com/dashboard/project/amcxmbgkgkweuytdibqs/settings/api)
   - TMDB API key (free) from [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

3. **Run locally**
   ```bash
   npm run dev
   ```

## Features
- Username-only join, no email/password
- Shareable room codes for friends
- Real-time watchlist via Supabase Realtime
- TMDB movie search with posters + data
- Watch log with star ratings, vibe tags, notes
- Confetti when logging a watched movie
- Stats: genre breakdown, avg ratings, top picker
- PWA installable on phone
- Glassmorphism + particle field animations
