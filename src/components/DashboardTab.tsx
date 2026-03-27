"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Popcorn,
  ListTodo,
  Star,
  UsersRound,
  Clapperboard,
  CirclePlus,
} from "lucide-react";
import { getCrewMembers, getKetaqueue, getWatched } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { getAverageRating } from "@/lib/utils";
import { tmdbImage } from "@/lib/tmdb";
import type { Room, KetaqueueItem, WatchedItem } from "@/types";

interface DashboardTabProps {
  room: Room;
  roomCode: string;
  username: string;
}

export default function DashboardTab({
  room,
  roomCode,
  username,
}: DashboardTabProps) {
  const [ketaqueue, setKetaqueue] = useState<KetaqueueItem[]>([]);
  const [watched, setWatched] = useState<WatchedItem[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const [ketaqueueData, watchedData, memberData] = await Promise.all([
        getKetaqueue(roomCode),
        getWatched(roomCode),
        getCrewMembers(roomCode),
      ]);

      if (!active) return;

      setKetaqueue(ketaqueueData);
      setWatched(watchedData);
      setMembers(memberData);
      setLoading(false);
    }

    loadDashboard();

    // NOTE: table filter stays "watchlist" — that's the Supabase table name
    const ketaqueueChannel = supabase
      .channel(`dashboard:ketaqueue:${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "watchlist",
          filter: `room_code=eq.${roomCode}`,
        },
        loadDashboard,
      )
      .subscribe();

    const watchedChannel = supabase
      .channel(`dashboard:watched:${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "watched",
          filter: `room_code=eq.${roomCode}`,
        },
        loadDashboard,
      )
      .subscribe();

    const usersChannel = supabase
      .channel(`dashboard:users:${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
          filter: `room_code=eq.${roomCode}`,
        },
        loadDashboard,
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(ketaqueueChannel);
      supabase.removeChannel(watchedChannel);
      supabase.removeChannel(usersChannel);
    };
  }, [roomCode]);

  useEffect(() => {
    const container = containerRef.current;
    if (loading || !container) return;

    import("animejs").then(({ animate, stagger }) => {
      animate(container.querySelectorAll("[data-dashboard-card]"), {
        opacity: [0, 1],
        translateY: [28, 0],
        delay: stagger(85, { start: 80 }),
        duration: 700,
        easing: "easeOutExpo",
      });
    });
  }, [loading, ketaqueue.length, watched.length, members.length]);

  if (loading) {
    return (
      <div className="mt-2 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="shimmer h-72 rounded-[28px]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="shimmer h-24 rounded-[24px]" />
          ))}
        </div>
      </div>
    );
  }

  const heroMovie = watched[0]?.movie ?? ketaqueue[0]?.movie ?? null;
  const heroBackdrop = tmdbImage(heroMovie?.backdrop_path ?? null, "w780");
  const latestEntries = watched.slice(0, 3);
  const onDeck = ketaqueue.slice(0, 5);
  const totalRatings = watched.flatMap((entry) =>
    entry.ratings.map((rating) => rating.score),
  );
  const overallAverage =
    totalRatings.length > 0
      ? totalRatings.reduce((sum, score) => sum + score, 0) /
        totalRatings.length
      : null;

  const pickerCounts: Record<string, number> = {};
  watched.forEach((entry) => {
    if (entry.picked_by) {
      pickerCounts[entry.picked_by] = (pickerCounts[entry.picked_by] ?? 0) + 1;
    }
  });
  const topPicker = Object.entries(pickerCounts).sort((a, b) => b[1] - a[1])[0];

  const vibeCounts: Record<string, number> = {};
  watched.forEach((entry) => {
    entry.vibe_tags.forEach((tag) => {
      vibeCounts[tag] = (vibeCounts[tag] ?? 0) + 1;
    });
  });
  const topVibe = Object.entries(vibeCounts).sort((a, b) => b[1] - a[1])[0];

  const summaryCards = [
    {
      label: "Crew",
      value: members.length.toString(),
      sub:
        members.length === 1
          ? "1 member in crew"
          : `${members.length} members in crew`,
      icon: UsersRound,
    },
    {
      label: "On Deck",
      value: ketaqueue.length.toString(),
      sub:
        ketaqueue.length === 1
          ? "1 film waiting"
          : `${ketaqueue.length} films waiting`,
      icon: ListTodo,
    },
    {
      label: "Ketalogs",
      value: watched.length.toString(),
      sub:
        watched.length === 1
          ? "1 movie logged"
          : `${watched.length} movies logged`,
      icon: Popcorn,
    },
    {
      label: "Avg Score",
      value: overallAverage ? overallAverage.toFixed(1) : "—",
      sub: overallAverage ? "across all ratings" : "no ratings yet",
      icon: Star,
    },
  ];

  return (
    <div
      ref={containerRef}
      className="mt-2 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]"
    >
      <section
        data-dashboard-card
        className="dashboard-hero relative overflow-hidden rounded-[30px] border border-white/10 p-6 opacity-0 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-8"
      >
        {heroBackdrop && (
          <Image
            src={heroBackdrop}
            alt={heroMovie?.title ?? room.name ?? room.code}
            fill
            className="object-cover opacity-30"
            sizes="(max-width: 1280px) 100vw, 60vw"
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(7,9,11,0.92),rgba(20,24,28,0.74))]" />

        <div className="relative z-10 flex h-full flex-col justify-between gap-8">
          <div className="max-w-2xl">
            <p className="eyebrow">Dashboard</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
              Welcome back, {username}.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/70">
              {room.name ?? `${room.created_by}’s Crew`} is live. Track what is
              queued, what just got logged, and who is driving the crew&apos;s
              taste tonight.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="info-chip">Crew {room.code}</span>
              <span className="info-chip">Created by {room.created_by}</span>
              {topPicker && (
                <span className="info-chip">Top picker {topPicker[0]}</span>
              )}
              {topVibe && (
                <span className="info-chip">Main vibe {topVibe[0]}</span>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {summaryCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="rounded-2xl border border-white/6 bg-white/[0.04] p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="meta">{card.label}</p>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
                      <Icon
                        className="h-3.5 w-3.5 text-[var(--accent)]"
                        strokeWidth={2}
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-3xl font-bold tracking-tight">
                    {card.value}
                  </p>
                  <p className="mt-1 text-xs text-white/45">{card.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        <section
          data-dashboard-card
          className="surface-card rounded-[28px] p-5 opacity-0"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Recently Logged</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                Latest ketalog entries
              </h3>
            </div>
            <p className="text-sm text-white/45">{watched.length} total</p>
          </div>

          {latestEntries.length ? (
            <div className="mt-5 flex flex-col gap-3">
              {latestEntries.map((entry) => {
                const average = getAverageRating(entry.ratings);
                const poster = tmdbImage(
                  entry.movie?.poster_path ?? null,
                  "w92",
                );

                return (
                  <div
                    key={entry.id}
                    className="surface-soft flex items-center gap-3 p-3"
                  >
                    <div className="poster-frame h-[72px] w-12 shrink-0">
                      {poster ? (
                        <Image
                          src={poster}
                          alt={entry.movie?.title ?? "Movie poster"}
                          width={48}
                          height={72}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/55">
                          🎬
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {entry.movie?.title}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        {new Date(entry.watched_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                        {entry.picked_by
                          ? ` · picked by ${entry.picked_by}`
                          : ""}
                      </p>
                      {average !== null && (
                        <p className="mt-2 text-xs font-mono text-[var(--accent-warm)]">
                          {average.toFixed(1)} 🐴 / 10
                        </p>
                      )}
                    </div>
                    {entry.vibe_tags[0] && (
                      <span className="vibe-tag active">
                        {entry.vibe_tags[0]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-white/6 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04]">
                <Clapperboard
                  className="h-6 w-6 text-white/55"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-sm font-medium text-white/45">
                No ketalog entries yet
              </p>
              <p className="text-xs text-white/45">
                Mark something watched to populate the dashboard.
              </p>
            </div>
          )}
        </section>

        <section
          data-dashboard-card
          className="surface-card rounded-[28px] p-5 opacity-0"
        >
          <p className="eyebrow">On Deck</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">
            Ketaqueue
          </h3>

          {onDeck.length ? (
            <div className="mt-5 grid grid-cols-5 gap-3">
              {onDeck.map((item) => {
                const poster = tmdbImage(
                  item.movie?.poster_path ?? null,
                  "w342",
                );

                return (
                  <div key={item.id} className="min-w-0">
                    <div className="poster-frame aspect-[2/3]">
                      {poster ? (
                        <Image
                          src={poster}
                          alt={item.movie?.title ?? "Movie poster"}
                          fill
                          className="object-cover"
                          sizes="20vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/55">
                          🎬
                        </div>
                      )}
                    </div>
                    <p className="mt-2 truncate text-xs text-white/55">
                      {item.movie?.title}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-white/6 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04]">
                <CirclePlus
                  className="h-6 w-6 text-white/55"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-sm font-medium text-white/45">
                Ketaqueue is empty
              </p>
              <p className="text-xs text-white/45">
                Add a few films and the dashboard will start to breathe.
              </p>
            </div>
          )}
        </section>

        <section
          data-dashboard-card
          className="surface-card rounded-[28px] p-5 opacity-0"
        >
          <p className="eyebrow">Crew</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight">
            Who&apos;s in the crew
          </h3>

          <div className="mt-5 flex flex-wrap gap-2">
            {members.length ? (
              members.map((member) => (
                <span
                  key={member}
                  className={`vibe-tag ${member === username ? "active" : ""}`}
                >
                  {member}
                  {member === room.created_by ? (
                    <span className="text-white/45">host</span>
                  ) : null}
                </span>
              ))
            ) : (
              <span className="text-sm text-white/50">No members found.</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
