"use client";

import Image from "next/image";
import { tmdbImage } from "@/lib/tmdb";
import type { ActivityFeedItem } from "@/types";

interface FeedMovieCardProps {
  movieTitle: string;
  posterPath: string | null;
  activities: ActivityFeedItem[];
}

export default function FeedMovieCard({
  movieTitle,
  posterPath,
  activities,
}: FeedMovieCardProps) {
  // Collect unique watchers and ratings
  const watchers = new Map<string, { name: string; emoji: string }>();
  const ratings: number[] = [];

  activities.forEach((a) => {
    const name = a.profile?.display_name || a.profile?.username || "Someone";
    const emoji = a.profile?.avatar_emoji || "🎬";
    if (a.profile?.id) {
      watchers.set(a.profile.id, { name, emoji });
    }
    if (
      a.activity_type === "rated" &&
      a.data &&
      "score" in a.data &&
      typeof a.data.score === "number"
    ) {
      ratings.push(a.data.score);
    }
  });

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : null;

  return (
    <div className="movie-card overflow-hidden">
      {/* Poster */}
      {posterPath ? (
        <Image
          src={tmdbImage(posterPath, "w342")!}
          alt={movieTitle}
          width={342}
          height={513}
          className="aspect-[2/3] w-full object-cover"
        />
      ) : (
        <div className="flex aspect-[2/3] items-center justify-center bg-white/5 text-3xl">
          🎬
        </div>
      )}

      {/* Info overlay */}
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold">{movieTitle}</h3>

        {avgRating && (
          <p className="mt-1 text-xs text-[var(--accent-warm)]">
            ★ {avgRating} avg from friends
          </p>
        )}

        {/* Watcher avatars */}
        {watchers.size > 0 && (
          <div className="mt-2 flex items-center gap-1">
            {Array.from(watchers.values())
              .slice(0, 4)
              .map((w, i) => (
                <span
                  key={i}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/8 text-xs"
                  title={w.name}
                >
                  {w.emoji}
                </span>
              ))}
            {watchers.size > 4 && (
              <span className="text-xs text-white/35">
                +{watchers.size - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
