export interface Room {
  id: string;
  code: string;
  name: string | null;
  created_by: string;
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  room_code: string;
  created_at: string;
}

export interface Movie {
  id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  release_year: number | null;
  runtime: number | null;
  genres: { id: number; name: string }[] | null;
  tmdb_rating: number | null;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  room_code: string;
  movie_id: string;
  added_by: string;
  notes: string | null;
  created_at: string;
  movie?: Movie;
}

export interface WatchedItem {
  id: string;
  room_code: string;
  movie_id: string;
  watched_at: string;
  picked_by: string | null;
  ratings: { username: string; score: number }[];
  notes: string | null;
  vibe_tags: string[];
  created_at: string;
  movie?: Movie;
}

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
  vote_average: number;
}

export interface TMDBSearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

export const VIBE_TAGS = [
  "mind-bending",
  "hilarious",
  "emotional",
  "action-packed",
  "wtf",
  "beautiful",
  "disturbing",
  "wholesome",
  "slow-burn",
  "trippy",
  "banger",
  "underrated",
] as const;

export type VibeTag = (typeof VIBE_TAGS)[number];
