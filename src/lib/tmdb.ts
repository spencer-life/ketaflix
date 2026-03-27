import type { TMDBMovie, TMDBSearchResult, TMDBGenre } from "@/types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export const tmdbImage = (path: string | null, size = "w500") =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;

async function tmdbFetch<T>(endpoint: string): Promise<T> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const res = await fetch(
    `${TMDB_BASE}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${apiKey}`,
  );
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export async function searchMovies(query: string): Promise<TMDBSearchResult[]> {
  if (!query.trim()) return [];
  const data = await tmdbFetch<{ results: TMDBSearchResult[] }>(
    `/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
  );
  return data.results.slice(0, 12);
}

export async function getMovieDetails(tmdbId: number): Promise<TMDBMovie> {
  return tmdbFetch<TMDBMovie>(`/movie/${tmdbId}?language=en-US`);
}

export async function getTrending(): Promise<TMDBSearchResult[]> {
  const data = await tmdbFetch<{ results: TMDBSearchResult[] }>(
    `/trending/movie/week?language=en-US`,
  );
  return data.results.slice(0, 12);
}

// ─── Discovery ─────────────────────────────────────────────────────────────

export async function getGenres(): Promise<TMDBGenre[]> {
  const data = await tmdbFetch<{ genres: TMDBGenre[] }>(
    `/genre/movie/list?language=en-US`,
  );
  return data.genres;
}

export async function discoverByGenre(
  genreId: number,
  page = 1,
): Promise<TMDBSearchResult[]> {
  const data = await tmdbFetch<{ results: TMDBSearchResult[] }>(
    `/discover/movie?with_genres=${genreId}&include_adult=false&language=en-US&sort_by=popularity.desc&page=${page}`,
  );
  return data.results;
}

export async function getNowPlaying(): Promise<TMDBSearchResult[]> {
  const data = await tmdbFetch<{ results: TMDBSearchResult[] }>(
    `/movie/now_playing?language=en-US&page=1`,
  );
  return data.results.slice(0, 12);
}

export async function getTopRated(): Promise<TMDBSearchResult[]> {
  const data = await tmdbFetch<{ results: TMDBSearchResult[] }>(
    `/movie/top_rated?language=en-US&page=1`,
  );
  return data.results.slice(0, 12);
}

export async function getPopular(): Promise<TMDBSearchResult[]> {
  const data = await tmdbFetch<{ results: TMDBSearchResult[] }>(
    `/movie/popular?language=en-US&page=1`,
  );
  return data.results.slice(0, 12);
}

export async function getRecommendations(
  tmdbId: number,
): Promise<TMDBSearchResult[]> {
  const data = await tmdbFetch<{ results: TMDBSearchResult[] }>(
    `/movie/${tmdbId}/recommendations?language=en-US&page=1`,
  );
  return data.results.slice(0, 12);
}
