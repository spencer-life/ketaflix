import { supabase } from "./supabase";
import type { Room, WatchlistItem, WatchedItem, Movie, TMDBMovie } from "@/types";

// ─── Rooms ────────────────────────────────────────────────────────────────────

export async function getOrCreateRoom(code: string, createdBy: string): Promise<Room> {
  const { data: existing } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", code)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("rooms")
    .insert({ code, created_by: createdBy, name: `${createdBy}'s Room` })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getRoom(code: string): Promise<Room | null> {
  const { data } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", code)
    .single();
  return data;
}

export async function getRoomMembers(roomCode: string): Promise<string[]> {
  const { data } = await supabase
    .from("users")
    .select("username")
    .eq("room_code", roomCode);
  return data?.map((u) => u.username) ?? [];
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function joinRoom(username: string, roomCode: string) {
  const { error } = await supabase
    .from("users")
    .upsert({ username, room_code: roomCode }, { onConflict: "username,room_code" });
  if (error) throw error;
}

// ─── Movies ───────────────────────────────────────────────────────────────────

export async function upsertMovie(tmdb: TMDBMovie): Promise<Movie> {
  const movie = {
    tmdb_id: tmdb.id,
    title: tmdb.title,
    poster_path: tmdb.poster_path,
    backdrop_path: tmdb.backdrop_path,
    overview: tmdb.overview,
    release_year: tmdb.release_date ? new Date(tmdb.release_date).getFullYear() : null,
    runtime: tmdb.runtime,
    genres: tmdb.genres,
    tmdb_rating: tmdb.vote_average,
  };

  const { data, error } = await supabase
    .from("movies")
    .upsert(movie, { onConflict: "tmdb_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

export async function getWatchlist(roomCode: string): Promise<WatchlistItem[]> {
  const { data, error } = await supabase
    .from("watchlist")
    .select("*, movie:movies(*)")
    .eq("room_code", roomCode)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addToWatchlist(
  roomCode: string,
  movieId: string,
  addedBy: string,
  notes?: string
): Promise<WatchlistItem> {
  const { data, error } = await supabase
    .from("watchlist")
    .insert({ room_code: roomCode, movie_id: movieId, added_by: addedBy, notes })
    .select("*, movie:movies(*)")
    .single();

  if (error) throw error;
  return data;
}

export async function removeFromWatchlist(id: string) {
  const { error } = await supabase.from("watchlist").delete().eq("id", id);
  if (error) throw error;
}

// ─── Watched ──────────────────────────────────────────────────────────────────

export async function getWatched(roomCode: string): Promise<WatchedItem[]> {
  const { data, error } = await supabase
    .from("watched")
    .select("*, movie:movies(*)")
    .eq("room_code", roomCode)
    .order("watched_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function logWatched(params: {
  roomCode: string;
  movieId: string;
  pickedBy: string;
  ratings: { username: string; score: number }[];
  notes?: string;
  vibeTags?: string[];
  watchlistId?: string;
}): Promise<WatchedItem> {
  const { data, error } = await supabase
    .from("watched")
    .insert({
      room_code: params.roomCode,
      movie_id: params.movieId,
      picked_by: params.pickedBy,
      ratings: params.ratings,
      notes: params.notes,
      vibe_tags: params.vibeTags ?? [],
    })
    .select("*, movie:movies(*)")
    .single();

  if (error) throw error;

  // Remove from watchlist if present
  if (params.watchlistId) {
    await removeFromWatchlist(params.watchlistId);
  }

  return data;
}
