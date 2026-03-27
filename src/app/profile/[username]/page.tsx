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
import { SlidersHorizontal, Popcorn, Clapperboard } from "lucide-react";
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
    import("animejs").then(({ animate, stagger }) => {
      if (!contentRef.current) return;
      animate(contentRef.current.querySelectorAll("[data-profile-section]"), {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(80, { start: 60 }),
        duration: 600,
        easing: "easeOutExpo",
      });
    });
  }, [loading]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-sm text-white/55">Loading profile...</div>
      </div>
    );
  }

  if (!profile) return null;

  const isOwnProfile = user?.id === profile.id;
  const filmCount = activity.filter(
    (a) => a.activity_type === "watched" || a.activity_type === "rated",
  ).length;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-3xl px-4 pb-32 pt-6 sm:px-6">
      <div ref={contentRef}>
        {/* Profile Header Card */}
        <section
          data-profile-section
          className="relative overflow-hidden rounded-[28px] border border-white/6 p-6 opacity-0 sm:p-8"
          style={{
            background:
              "radial-gradient(ellipse at top right, rgba(52,211,153,0.08), transparent 50%), radial-gradient(ellipse at bottom left, rgba(245,158,11,0.05), transparent 40%), linear-gradient(135deg, rgba(14,17,22,0.96), rgba(20,24,28,0.92))",
          }}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {/* Avatar — Stitch-inspired glow ring */}
            <div className="avatar-glow flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--bg)] text-4xl shadow-lg">
              {profile.avatar_emoji || "🎬"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {profile.display_name || profile.username}
                  </h1>
                  <p className="mt-0.5 text-sm text-white/50">
                    @{profile.username}
                  </p>
                </div>

                {isOwnProfile ? (
                  <Link
                    href="/settings"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/8 bg-white/[0.04] px-4 py-2 text-sm text-white/55 transition-all hover:border-white/14 hover:text-white/75"
                  >
                    <SlidersHorizontal
                      className="h-3.5 w-3.5"
                      strokeWidth={1.8}
                    />
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

              {/* Stats row — Stitch-inspired emerald stat boxes */}
              <div className="mt-5 flex gap-3">
                {[
                  { value: followers, label: "followers" },
                  { value: following, label: "following" },
                  { value: filmCount, label: "films" },
                ].map((stat) => (
                  <div key={stat.label} className="stat-box flex-1">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section data-profile-section className="mt-6 opacity-0">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/55">
              Recent Activity
            </h2>
          </div>
          {activity.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[22px] border border-white/6 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
                <Popcorn className="h-7 w-7 text-white/50" strokeWidth={1.4} />
              </div>
              <p className="text-sm font-medium text-white/55">
                No activity yet
              </p>
              <p className="text-xs text-white/55">
                Movies are waiting to be watched.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {activity.map((item) => (
                <div
                  key={item.id}
                  className="surface-card flex items-center gap-4 p-4 transition-colors hover:bg-white/[0.04]"
                >
                  {item.movie_poster_path ? (
                    <div className="poster-frame h-16 w-[42px] shrink-0">
                      <Image
                        src={tmdbImage(item.movie_poster_path, "w92")!}
                        alt={item.movie_title ?? "Movie poster"}
                        width={42}
                        height={64}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-[42px] shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                      <Clapperboard
                        className="h-5 w-5 text-white/50"
                        strokeWidth={1.5}
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">
                        {profile.display_name || profile.username}
                      </span>{" "}
                      <span className="text-white/55">
                        {item.activity_type === "rated" && "rated"}
                        {(item.activity_type === "watchlisted" ||
                          item.activity_type === "queued") &&
                          "added to Ketaqueue"}
                        {item.activity_type === "watched" && "watched"}
                        {item.activity_type === "joined_room" &&
                          "joined a Ketacrew"}
                        {item.activity_type === "created_room" &&
                          "created a Ketacrew"}
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
                          {item.data.score as number} / 10
                        </p>
                      )}
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-white/50">
                      {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
