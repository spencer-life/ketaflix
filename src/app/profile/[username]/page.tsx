"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import {
  getProfile,
  getFollowerCount,
  getFollowingCount,
  isFollowing,
  getProfileActivity,
} from "@/lib/db";
import { tmdbImage } from "@/lib/tmdb";
import FollowButton from "@/components/FollowButton";
import Link from "next/link";
import type { Profile, ActivityFeedItem } from "@/types";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [userFollows, setUserFollows] = useState(false);
  const [activity, setActivity] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const p = await getProfile(decodeURIComponent(username));
      if (!p) {
        router.push("/");
        return;
      }
      setProfile(p);

      const promises: [
        Promise<number>,
        Promise<number>,
        Promise<ActivityFeedItem[]>,
        ...Promise<boolean>[],
      ] = [
        getFollowerCount(p.id),
        getFollowingCount(p.id),
        getProfileActivity(p.id, 10),
      ];
      if (user && user.id !== p.id) {
        promises.push(isFollowing(user.id, p.id));
      }
      const [fc, fgc, act, follows] = await Promise.all(promises);
      setFollowers(fc);
      setFollowing(fgc);
      setActivity(act);
      if (follows !== undefined) setUserFollows(follows as boolean);

      setLoading(false);
    }
    load();
  }, [username, user, router]);

  useEffect(() => {
    if (loading || !contentRef.current) return;
    import("animejs").then(({ animate }) => {
      if (!contentRef.current) return;
      animate(contentRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: "easeOutExpo",
      });
    });
  }, [loading]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-sm text-white/40">Loading profile...</div>
      </div>
    );
  }

  if (!profile) return null;

  const isOwnProfile = user?.id === profile.id;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-3xl px-4 py-10 sm:px-6">
      <div ref={contentRef} className="opacity-0">
        {/* Profile Header */}
        <div className="surface-card p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/5 text-5xl">
              {profile.avatar_emoji || "🎬"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {profile.display_name || profile.username}
                  </h1>
                  <p className="text-sm text-white/45">@{profile.username}</p>
                </div>

                {isOwnProfile ? (
                  <Link
                    href="/settings"
                    className="btn-ghost px-4 py-2 text-sm"
                  >
                    Edit Profile
                  </Link>
                ) : (
                  <FollowButton
                    targetId={profile.id}
                    initialFollowing={userFollows}
                    onToggle={(f) => setFollowers((c) => (f ? c + 1 : c - 1))}
                  />
                )}
              </div>

              {profile.bio && (
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  {profile.bio}
                </p>
              )}

              {/* Stats row */}
              <div className="mt-4 flex gap-6">
                <div>
                  <span className="text-lg font-bold">{followers}</span>
                  <span className="ml-1 text-sm text-white/45">followers</span>
                </div>
                <div>
                  <span className="text-lg font-bold">{following}</span>
                  <span className="ml-1 text-sm text-white/45">following</span>
                </div>
                <div>
                  <span className="text-lg font-bold">
                    {
                      activity.filter(
                        (a) =>
                          a.activity_type === "watched" ||
                          a.activity_type === "rated",
                      ).length
                    }
                  </span>
                  <span className="ml-1 text-sm text-white/45">films</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6">
          <h2 className="mb-4 text-lg font-bold">Recent Activity</h2>
          {activity.length === 0 ? (
            <div className="empty-state rounded-2xl p-8 text-center">
              <p className="text-3xl">🎬</p>
              <p className="mt-2 text-sm text-white/45">
                No activity yet. Movies are waiting to be watched.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="surface-soft flex items-center gap-4 p-4"
                >
                  {item.movie_poster_path && (
                    <Image
                      src={tmdbImage(item.movie_poster_path, "w92")!}
                      alt=""
                      width={44}
                      height={64}
                      className="rounded-lg object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">
                        {profile.display_name || profile.username}
                      </span>{" "}
                      <span className="text-white/55">
                        {item.activity_type === "rated" && "rated"}
                        {item.activity_type === "watchlisted" &&
                          "added to watchlist"}
                        {item.activity_type === "watched" && "watched"}
                        {item.activity_type === "joined_room" &&
                          "joined a room"}
                        {item.activity_type === "created_room" &&
                          "created a room"}
                        {item.activity_type === "followed" &&
                          "followed someone"}
                      </span>{" "}
                      {item.movie_title && (
                        <span className="font-medium">{item.movie_title}</span>
                      )}
                    </p>
                    {item.activity_type === "rated" &&
                      item.data &&
                      typeof item.data === "object" &&
                      "score" in item.data && (
                        <p className="mt-0.5 text-xs text-[var(--accent-warm)]">
                          {"★".repeat(item.data.score as number)}
                          {"☆".repeat(5 - (item.data.score as number))}
                        </p>
                      )}
                    <p className="mt-1 text-xs text-white/30">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
