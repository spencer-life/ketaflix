"use client";

import Link from "next/link";
import Image from "next/image";
import { tmdbImage } from "@/lib/tmdb";
import type { ActivityFeedItem, ActivityType } from "@/types";

function activityVerb(type: ActivityType): string {
  switch (type) {
    case "rated":
      return "rated";
    case "watchlisted":
    case "queued":
      return "added to Ketaqueue";
    case "watched":
      return "watched";
    case "joined_room":
      return "joined a room";
    case "created_room":
      return "created a room";
    case "followed":
      return "started following someone";
    default:
      return type;
  }
}

export default function FeedActivityItem({ item }: { item: ActivityFeedItem }) {
  const profile = item.profile;
  const displayName = profile?.display_name || profile?.username || "Someone";

  return (
    <div className="surface-soft flex gap-4 p-4">
      {/* Avatar */}
      <Link
        href={`/profile/${profile?.username ?? ""}`}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-xl"
      >
        {profile?.avatar_emoji || "🎬"}
      </Link>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed">
          <Link
            href={`/profile/${profile?.username ?? ""}`}
            className="font-medium transition-colors hover:text-[var(--accent)]"
          >
            {displayName}
          </Link>{" "}
          <span className="text-white/50">
            {activityVerb(item.activity_type)}
          </span>
          {item.movie_title && (
            <>
              {" "}
              <span className="font-medium">{item.movie_title}</span>
            </>
          )}
        </p>

        {/* Rating stars */}
        {item.activity_type === "rated" &&
          item.data &&
          "score" in item.data && (
            <p className="mt-1 text-sm text-[var(--accent-warm)]">
              {"★".repeat(item.data.score as number)}
              {"☆".repeat(5 - (item.data.score as number))}
            </p>
          )}

        {/* Vibe tags */}
        {item.activity_type === "watched" &&
          item.data &&
          "vibe_tags" in item.data &&
          Array.isArray(item.data.vibe_tags) &&
          item.data.vibe_tags.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {(item.data.vibe_tags as string[]).slice(0, 3).map((tag) => (
                <span key={tag} className="vibe-tag text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}

        <p className="mt-1.5 text-xs text-white/25">
          {timeAgo(item.created_at)}
        </p>
      </div>

      {/* Movie poster */}
      {item.movie_poster_path && (
        <Image
          src={tmdbImage(item.movie_poster_path, "w92")!}
          alt=""
          width={56}
          height={80}
          className="shrink-0 rounded-lg object-cover"
        />
      )}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
