"use client";

import { useState, useEffect, useRef } from "react";
import { getWatched, getWatchlist } from "@/lib/db";
import { getAverageRating } from "@/lib/utils";
import type { WatchedItem } from "@/types";

interface StatsTabProps {
  roomCode: string;
}

export default function StatsTab({ roomCode }: StatsTabProps) {
  const [watched, setWatched] = useState<WatchedItem[]>([]);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      getWatched(roomCode),
      getWatchlist(roomCode),
    ]).then(([w, wl]) => {
      setWatched(w);
      setWatchlistCount(wl.length);
      setLoading(false);
    });
  }, [roomCode]);

  // Animate stats cards on load
  useEffect(() => {
    if (!loading && containerRef.current) {
      import("animejs").then((m) => {
        const anime = m.default ?? m;
        anime({
          targets: containerRef.current!.querySelectorAll(".stat-card"),
          opacity: [0, 1],
          translateY: [20, 0],
          delay: anime.stagger(80),
          duration: 500,
          easing: "easeOutExpo",
        });
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3 mt-4">
        {[...Array(4)].map((_, i) => <div key={i} className="shimmer h-24 rounded-2xl" />)}
      </div>
    );
  }

  // Compute stats
  const totalWatched = watched.length;

  // Top picker
  const pickerCounts: Record<string, number> = {};
  watched.forEach((w) => {
    if (w.picked_by) pickerCounts[w.picked_by] = (pickerCounts[w.picked_by] ?? 0) + 1;
  });
  const topPicker = Object.entries(pickerCounts).sort((a, b) => b[1] - a[1])[0];

  // Genre breakdown
  const genreCounts: Record<string, number> = {};
  watched.forEach((w) => {
    (w.movie?.genres ?? []).forEach((g) => {
      genreCounts[g.name] = (genreCounts[g.name] ?? 0) + 1;
    });
  });
  const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Average ratings per person
  const raterTotals: Record<string, { sum: number; count: number }> = {};
  watched.forEach((w) => {
    w.ratings.forEach((r) => {
      if (!raterTotals[r.username]) raterTotals[r.username] = { sum: 0, count: 0 };
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
  const topVibes = Object.entries(vibeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Overall avg
  const allRatings = watched.flatMap((w) => w.ratings.map((r) => r.score));
  const overallAvg = allRatings.length ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : null;

  return (
    <div ref={containerRef} className="mt-4 flex flex-col gap-4">
      {/* Top row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          emoji="🎬"
          label="Movies Watched"
          value={totalWatched.toString()}
        />
        <StatCard
          emoji="📋"
          label="On Watchlist"
          value={watchlistCount.toString()}
        />
        <StatCard
          emoji="⭐"
          label="Avg Rating"
          value={overallAvg ? `${overallAvg.toFixed(1)} / 5` : "—"}
        />
        <StatCard
          emoji="👑"
          label="Top Picker"
          value={topPicker ? `${topPicker[0]}` : "—"}
          sub={topPicker ? `${topPicker[1]} picks` : ""}
        />
      </div>

      {/* Genres */}
      {topGenres.length > 0 && (
        <div className="glass rounded-2xl p-4 stat-card" style={{ opacity: 0 }}>
          <p className="text-xs font-medium mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
            🎭 Top Genres
          </p>
          <div className="flex flex-col gap-2">
            {topGenres.map(([genre, count]) => (
              <div key={genre}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{genre}</span>
                  <span className="text-xs font-mono" style={{ color: "#a78bfa" }}>{count}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(count / topGenres[0][1]) * 100}%`,
                      background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ratings per person */}
      {raterAvgs.length > 0 && (
        <div className="glass rounded-2xl p-4 stat-card" style={{ opacity: 0 }}>
          <p className="text-xs font-medium mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
            ⭐ Average Ratings
          </p>
          <div className="flex flex-col gap-2">
            {raterAvgs.map((r) => (
              <div key={r.username} className="flex items-center justify-between">
                <span className="text-sm">{r.username}</span>
                <span className="font-mono text-sm" style={{ color: "#f59e0b" }}>
                  {r.avg.toFixed(1)} ★
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vibe tags */}
      {topVibes.length > 0 && (
        <div className="glass rounded-2xl p-4 stat-card" style={{ opacity: 0 }}>
          <p className="text-xs font-medium mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
            🌀 Top Vibes
          </p>
          <div className="flex flex-wrap gap-2">
            {topVibes.map(([tag, count]) => (
              <div key={tag} className="vibe-tag active flex items-center gap-1">
                {tag}
                <span
                  className="font-mono text-xs"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalWatched === 0 && (
        <div
          className="glass rounded-2xl p-8 text-center stat-card"
          style={{ opacity: 0, border: "1px dashed rgba(255,255,255,0.1)" }}
        >
          <p className="text-4xl mb-3">📊</p>
          <p className="font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
            Stats will appear after you log some movies
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  emoji,
  label,
  value,
  sub,
}: {
  emoji: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="glass rounded-2xl p-4 stat-card" style={{ opacity: 0 }}>
      <p className="text-2xl mb-1">{emoji}</p>
      <p className="text-xl font-bold gradient-text">{value}</p>
      {sub && (
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{sub}</p>
      )}
      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
        {label}
      </p>
    </div>
  );
}
