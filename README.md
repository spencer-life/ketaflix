# 🎬 Ketamovies

Watch movies with your friends. Log the vibes.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from [supabase.com/dashboard/project/amcxmbgkgkweuytdibqs/settings/api](https://supabase.com/dashboard/project/amcxmbgkgkweuytdibqs/settings/api)
   - `NEXT_PUBLIC_TMDB_API_KEY` — free key from [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

3. **Run locally**
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

## Features
- Username-only join (no email/password)
- Room codes to share with friends
- Real-time watchlist updates via Supabase Realtime
- TMDB movie search with real posters + data
- Watch log with star ratings, vibe tags, notes
- Stats page with genre breakdown and top picks
- PWA installable on phone
- Glassmorphism design with particle animations

## Deploy to Netlify
1. Push to GitHub
2. Connect repo on [netlify.com](https://netlify.com)
3. Add environment variables in Netlify dashboard
4. Deploy!
