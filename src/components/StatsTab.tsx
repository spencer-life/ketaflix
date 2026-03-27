"use client";

import { useEffect, useRef, useState } from "react";
import { getWatched, getKetaqueue } from "@/lib/db";
import type { WatchedItem } from "@/types";

interface StatsTabProps {
  roomCode: string;
}

export default function StatsTab({ roomCode }: StatsTabProps) {
  const [watched, setWatched] = useState<WatchedItem[]>([]);
  const [ketaqueueCount, setKetaqueueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([getWatched(roomCode), getKetaqueue(roomCode)]).then(
      ([w, wl]) => {
        if (!active) return;
        setWatched(w);
        setKetaqueueCount(wl.length);
        setLoading(false);
      },
    );

    return () => {
      active = false;
    };
  }, [roomCode]);

  useEffect(() => {
    const container = containerRef.current;
    if (loading || !container) return;

    import("animejs").then(({ animate, stagger }) => {
      animate(container.querySelectorAll(".stat-card"), {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(85),
        duration: 540,
        easing: "easeOutExpo",
      });
    });
  }, [loading, watched.length, ketaqueueCount]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 mt-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="shimmer h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  // Compute stats
  const totalWatched = watched.length;

  // Top picker
  const pickerCounts: Record<string, number> = {};
  watched.forEach((w) => {
    if (w.picked_by)
      pickerCounts[w.picked_by] = (pickerCounts[w.picked_by] ?? 0) + 1;
  });
  const topPicker = Object.entries(pickerCounts).sort((a, b) => b[1] - a[1])[0];

  // Genre breakdown
  const genreCounts: Record<string, number> = {};
  watched.forEach((w) => {
    (w.movie?.genres ?? []).forEach((g) => {
      genreCounts[g.name] = (genreCounts[g.name] ?? 0) + 1;
    });
  });
  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Average ratings per person
  const raterTotals: Record<string, { sum: number; count: number }> = {};
  watched.forEach((w) => {
    w.ratings.forEach((r) => {
      if (!raterTotals[r.username])
        raterTotals[r.username] = { sum: 0, count: 0 };
      raterTotals[r.username].sum += r.score;
      raterTotals[r.username].count += 1;
    });
  });
  const raterAvgs = Object.entries(raterTotals)
    .map(([u, { sum, count }]) => ({ username: u, avg: sum / count }))
    .sort((a, b) => b.avg - a.avg);

  // Vibe tag breakdown
  const vibeCounts: Record<string, number> = {};
  watched.forEach((w) => {
    w.vibe_tags.forEach((t) => {
      vibeCounts[t] = (vibeCounts[t] ?? 0) + 1;
    });
  });
  const topVibes = Object.entries(vibeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Overall avg
  const allRatings = watched.flatMap((w) => w.ratings.map((r) => r.score));
  const overallAvg = allRatings.length
    ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
    : null;

  return (
    <div ref={containerRef} className="mt-2 flex flex-col gap-5">
      <div>
        <p className="eyebrow">Room Stats</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">
          The room profile
        </h2>
        <p className="mt-1 text-sm text-white/55">
          A quick read on taste, activity, and who is steering the picks.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Movies Watched" value={totalWatched.toString()} />
        <StatCard label="In Ketaqueue" value={ketaqueueCount.toString()} />
        <StatCard
          label="Avg Rating"
          value={overallAvg ? `${overallAvg.toFixed(1)} / 5` : "—"}
        />
        <StatCard
          label="Top Picker"
          value={topPicker ? `${topPicker[0]}` : "—"}
          sub={topPicker ? `${topPicker[1]} picks` : ""}
        />
      </div>

      {topGenres.length > 0 && (
        <div className="stat-card surface-card rounded-[26px] p-5 opacity-0">
          <p className="meta mb-4">Top Genres</p>
          <div className="flex flex-col gap-2">
            {topGenres.map(([genre, count]) => (
              <div key={genre}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{genre}</span>
                  <span className="text-xs font-mono text-[#d8ffe3]">
                    {count}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(count / topGenres[0][1]) * 100}%`,
                      background: "linear-gradient(90deg, #00c030, #7fff8b)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {raterAvgs.length > 0 && (
        <div className="stat-card surface-card rounded-[26px] p-5 opacity-0">
          <p className="meta mb-4">Average Ratings</p>
          <div className="flex flex-col gap-2">
            {raterAvgs.map((r) => (
              <div
                key={r.username}
                className="surface-soft flex items-center justify-between px-4 py-3"
              >
                <span className="text-sm">{r.username}</span>
                <span className="font-mono text-sm text-[var(--accent-warm)]">
                  {r.avg.toFixed(1)} ★
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {topVibes.length > 0 && (
        <div className="stat-card surface-card rounded-[26px] p-5 opacity-0">
          <p className="meta mb-4">Top Vibes</p>
          <div className="flex flex-wrap gap-2">
            {topVibes.map(([tag, count]) => (
              <div
                key={tag}
                className="vibe-tag active flex items-center gap-1"
              >
                {tag}
                <span className="font-mono text-xs text-white/55">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalWatched === 0 && (
        <div className="stat-card surface-card empty-state rounded-[26px] p-8 text-center opacity-0">
          <p className="text-4xl">📊</p>
          <p className="mt-4 text-lg font-semibold">
            Stats show up after the first logs
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="stat-card surface-card rounded-[24px] p-5 opacity-0">
      <p className="meta">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/45">{sub}</p>}
    </div>
  );
}
