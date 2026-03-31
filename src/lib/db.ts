import { supabase } from "./supabase";
import type {
  Room,
  KetaqueueItem,
  WatchedItem,
  Movie,
  TMDBMovie,
  Profile,
  ActivityFeedItem,
  ActivityType,
  Reaction,
  ReactionEmoji,
} from "@/types";

// ─── Krews ───────────────────────────────────────────────────────────────────
// NOTE: Supabase tables are still named "rooms" / "users" — no risky migration.
// All app-level code uses "Krew" terminology.

export async function getOrCreateCrew(
  code: string,
  createdBy: string,
): Promise<Room> {
  const { data: existing } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", code)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("rooms")
    .insert({ code, created_by: createdBy, name: `${createdBy}'s Crew` })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCrew(code: string): Promise<Room | null> {
  const { data } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", code)
    .single();
  return data;
}

export async function getCrewMembers(roomCode: string): Promise<string[]> {
  const { data } = await supabase
    .from("users")
    .select("username")
    .eq("room_code", roomCode);
  return data?.map((u) => u.username) ?? [];
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function joinCrew(
  username: string,
  roomCode: string,
  profileId?: string,
) {
  const { error } = await supabase
    .from("users")
    .upsert(
      { username, room_code: roomCode, profile_id: profileId },
      { onConflict: "username,room_code" },
    );
  if (error) throw error;

  // Log activity (fire-and-forget)
  if (profileId) {
    addActivity({
      profileId,
      activityType: "joined_room",
      data: { room_code: roomCode },
    }).catch(() => {});
  }
}

export async function getUserCrews(profileId: string): Promise<Room[]> {
  const { data: userRows } = await supabase
    .from("users")
    .select("room_code")
    .eq("profile_id", profileId);
  if (!userRows || userRows.length === 0) return [];
  const codes = userRows.map((r) => r.room_code);
  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .in("code", codes)
    .order("created_at", { ascending: false });
  return (rooms ?? []) as Room[];
}

export async function getCrewMemberCount(roomCode: string): Promise<number> {
  const { count } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("room_code", roomCode);
  return count ?? 0;
}

// ─── Movies ───────────────────────────────────────────────────────────────────

export async function upsertMovie(tmdb: TMDBMovie): Promise<Movie> {
  const movie = {
    tmdb_id: tmdb.id,
    title: tmdb.title,
    poster_path: tmdb.poster_path,
    backdrop_path: tmdb.backdrop_path,
    overview: tmdb.overview,
    release_year: tmdb.release_date
      ? new Date(tmdb.release_date).getFullYear()
      : null,
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

// ─── Ketaqueue ───────────────────────────────────────────────────────────────
// NOTE: Supabase table is still named "watchlist" — no risky migration needed.
// All app-level code uses "Ketaqueue" terminology.

export async function getKetaqueue(roomCode: string): Promise<KetaqueueItem[]> {
  const { data, error } = await supabase
    .from("watchlist")
    .select("*, movie:movies(*)")
    .eq("room_code", roomCode)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addToKetaqueue(
  roomCode: string,
  movieId: string,
  addedBy: string,
  notes?: string,
  profileId?: string,
  mentionedUsers?: string[],
): Promise<KetaqueueItem> {
  const { data, error } = await supabase
    .from("watchlist")
    .insert({
      room_code: roomCode,
      movie_id: movieId,
      added_by: addedBy,
      notes,
      profile_id: profileId,
      mentioned_users: mentionedUsers ?? [],
    })
    .select("*, movie:movies(*)")
    .single();

  if (error) throw error;

  // Log activity (fire-and-forget)
  if (profileId && data.movie) {
    addActivity({
      profileId,
      activityType: "queued",
      movieId,
      movieTitle: data.movie.title,
      moviePosterPath: data.movie.poster_path,
      data: { room_code: roomCode },
    }).catch(() => {});
  }

  return data;
}

export async function removeFromKetaqueue(id: string) {
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

export async function getRecentWatchedByProfile(
  profileId: string,
  limit = 10,
): Promise<WatchedItem[]> {
  const { data } = await supabase
    .from("watched")
    .select("*, movie:movies(*)")
    .eq("profile_id", profileId)
    .order("watched_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as WatchedItem[];
}

export async function logWatched(params: {
  roomCode: string;
  movieId: string;
  pickedBy: string;
  ratings: { username: string; score: number }[];
  watchedWith: string[];
  notes?: string;
  vibeTags?: string[];
  ketaqueueId?: string;
  profileId?: string;
  mentionedUsers?: string[];
}): Promise<WatchedItem> {
  const { data, error } = await supabase
    .from("watched")
    .insert({
      room_code: params.roomCode,
      movie_id: params.movieId,
      picked_by: params.pickedBy,
      ratings: params.ratings,
      watched_with: params.watchedWith,
      notes: params.notes,
      vibe_tags: params.vibeTags ?? [],
      profile_id: params.profileId,
      mentioned_users: params.mentionedUsers ?? [],
    })
    .select("*, movie:movies(*)")
    .single();

  if (error) throw error;

  // Remove from Ketaqueue if present
  if (params.ketaqueueId) {
    await removeFromKetaqueue(params.ketaqueueId);
  }

  // Log activity (fire-and-forget)
  if (params.profileId && data.movie) {
    addActivity({
      profileId: params.profileId,
      activityType: "watched",
      movieId: params.movieId,
      movieTitle: data.movie.title,
      moviePosterPath: data.movie.poster_path,
      data: {
        room_code: params.roomCode,
        vibe_tags: params.vibeTags,
      },
    }).catch(() => {});

    // Log individual rating activity
    const userRating = params.ratings.find(
      (r) => r.username === params.pickedBy,
    );
    if (userRating) {
      addActivity({
        profileId: params.profileId,
        activityType: "rated",
        movieId: params.movieId,
        movieTitle: data.movie.title,
        moviePosterPath: data.movie.poster_path,
        data: { score: userRating.score },
      }).catch(() => {});
    }
  }

  return data;
}

// ─── Profiles ──────────────────────────────────────────────────────────────

export async function getProfile(username: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();
  return data;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function updateProfile(
  id: string,
  updates: Partial<
    Pick<
      Profile,
      "display_name" | "bio" | "avatar_emoji" | "avatar_url" | "is_discoverable"
    >
  >,
) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function searchProfiles(
  query: string,
  limit = 20,
): Promise<Profile[]> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_discoverable", true)
    .or(
      `username.ilike.%${query.replace(/[%_,().]/g, "")}%,display_name.ilike.%${query.replace(/[%_,().]/g, "")}%`,
    )
    .limit(limit);
  return data ?? [];
}

// ─── Follows ───────────────────────────────────────────────────────────────

export async function followUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: followerId, following_id: followingId });
  if (error) throw error;

  // Log activity (fire-and-forget)
  addActivity({
    profileId: followerId,
    activityType: "followed",
    relatedProfileId: followingId,
  }).catch(() => {});
}

export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);
  if (error) throw error;
}

export async function isFollowing(
  followerId: string,
  followingId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .single();
  return !!data;
}

export async function getFollowers(profileId: string): Promise<Profile[]> {
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("following_id", profileId);
  if (!data || data.length === 0) return [];
  const ids = data.map((d) => d.follower_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", ids);
  return (profiles ?? []) as Profile[];
}

export async function getFollowing(profileId: string): Promise<Profile[]> {
  const { data } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", profileId);
  if (!data || data.length === 0) return [];
  const ids = data.map((d) => d.following_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", ids);
  return (profiles ?? []) as Profile[];
}

export async function getFollowerCount(profileId: string): Promise<number> {
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profileId);
  return count ?? 0;
}

export async function getFollowingCount(profileId: string): Promise<number> {
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profileId);
  return count ?? 0;
}

// ─── Activity Feed ─────────────────────────────────────────────────────────

export async function addActivity(params: {
  profileId: string;
  activityType: ActivityType;
  movieId?: string;
  tmdbId?: number;
  movieTitle?: string;
  moviePosterPath?: string | null;
  relatedProfileId?: string;
  data?: Record<string, unknown>;
}) {
  const { error } = await supabase.from("activity_feed").insert({
    profile_id: params.profileId,
    activity_type: params.activityType,
    movie_id: params.movieId,
    tmdb_id: params.tmdbId,
    movie_title: params.movieTitle,
    movie_poster_path: params.moviePosterPath,
    related_profile_id: params.relatedProfileId,
    data: params.data ?? {},
  });
  if (error) throw error;
}

export async function getFeed(
  userId: string,
  limit = 50,
): Promise<ActivityFeedItem[]> {
  // Get following IDs first, then fetch their activity
  const { data: followData } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  const followingIds = followData?.map((f) => f.following_id) ?? [];
  if (followingIds.length === 0) return [];

  const { data } = await supabase
    .from("activity_feed")
    .select(
      "*, profile:profiles!activity_feed_profile_id_fkey(*), movie:movies(*)",
    )
    .in("profile_id", followingIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as ActivityFeedItem[];
}

// ─── Reactions ──────────────────────────────────────────────────────────────

export async function getReactions(
  targetType: "ketaqueue" | "watched",
  targetIds: string[],
): Promise<Reaction[]> {
  if (targetIds.length === 0) return [];
  const { data, error } = await supabase
    .from("reactions")
    .select("*")
    .eq("target_type", targetType)
    .in("target_id", targetIds);
  if (error) throw error;
  return (data ?? []) as Reaction[];
}

export async function toggleReaction(params: {
  roomCode: string;
  targetType: "ketaqueue" | "watched";
  targetId: string;
  username: string;
  emoji: ReactionEmoji;
}): Promise<"added" | "removed"> {
  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("target_id", params.targetId)
    .eq("username", params.username)
    .eq("emoji", params.emoji)
    .single();

  if (existing) {
    await supabase.from("reactions").delete().eq("id", existing.id);
    return "removed";
  } else {
    await supabase.from("reactions").insert({
      room_code: params.roomCode,
      target_type: params.targetType,
      target_id: params.targetId,
      username: params.username,
      emoji: params.emoji,
    });
    return "added";
  }
}

// ─── Mentions ───────────────────────────────────────────────────────────────

export function extractMentions(
  text: string,
  validUsernames: string[],
): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    const username = match[1];
    if (validUsernames.includes(username) && !mentions.includes(username)) {
      mentions.push(username);
    }
  }
  return mentions;
}

export async function getProfileActivity(
  profileId: string,
  limit = 20,
): Promise<ActivityFeedItem[]> {
  const { data } = await supabase
    .from("activity_feed")
    .select(
      "*, profile:profiles!activity_feed_profile_id_fkey(*), movie:movies(*)",
    )
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ActivityFeedItem[];
}
