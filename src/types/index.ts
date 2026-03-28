// ─── Auth & Social ──────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_emoji: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_discoverable: boolean;
  created_at: string;
  updated_at: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export type ActivityType =
  | "rated"
  | "watchlisted" // legacy, kept for existing DB rows
  | "queued" // new canonical name for Ketaqueue adds
  | "watched"
  | "joined_room"
  | "created_room"
  | "followed";

export interface ActivityFeedItem {
  id: string;
  profile_id: string;
  activity_type: ActivityType;
  movie_id: string | null;
  tmdb_id: number | null;
  movie_title: string | null;
  movie_poster_path: string | null;
  related_profile_id: string | null;
  data: Record<string, unknown>;
  created_at: string;
  // Joined fields
  profile?: Profile;
  related_profile?: Profile;
  movie?: Movie;
}

// ─── Room & Movies ──────────────────────────────────────────────────────────

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

export interface KetaqueueItem {
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
  watched_with: string[];
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
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

export const KETA_TAGS = [
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

export type KetaTag = (typeof KETA_TAGS)[number];

export interface TMDBGenre {
  id: number;
  name: string;
}
