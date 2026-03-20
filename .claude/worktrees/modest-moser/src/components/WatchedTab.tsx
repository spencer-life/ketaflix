"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { getWatched } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { tmdbImage } from "@/lib/tmdb";
import { getAverageRating } from "@/lib/utils";
import type { WatchedItem } from "@/types";

interface WatchedTabProps {
  roomCode: string;
  username: string;
}

export default function WatchedTab({ roomCode, username: _ }: WatchedTabProps) {
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getWatched(roomCode).then((data) => {
      setItems(data);
      setLoading(false);
      animateCards();
    });

    const sub = supabase
      .channel(`watched:${roomCode}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "watched", filter: `room_code=eq.${roomCode}` },
        () => getWatched(roomCode).then(setItems)
      )
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [roomCode]);

  function animateCards() {
    import("animejs").then((m) => {
      const anime = m.default ?? m;
      if (listRef.current) {
        anime({
          targets: listRef.current.querySelectorAll(".watched-card"),
          opacity: [0, 1],
          translateX: [-20, 0],
          delay: anime.stagger(60),
          duration: 450,
          easing: "easeOutExpo",
        });
      }
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="shimmer h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center mt-4" style={{ border: "1px dashed rgba(255,255,255,0.1)" }}>
        <p className="text-4xl mb-3">📽️</p>
        <p className="font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>No movies watched yet</p>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>Add to watchlist and mark as watched</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="mt-4 flex flex-col gap-3">
      {items.map((item) => {
        const movie = item.movie;
        const avg = getAverageRating(item.ratings);
        const isExpanded = expanded === item.id;

        return (
          <div
            key={item.id}
            className="watched-card glass glass-hover rounded-2xl overflow-hidden cursor-pointer"
            style={{ opacity: 0 }}
            onClick={() => setExpanded(isExpanded ? null : item.id)}
          >
            <div className="flex gap-3 p-3">
              {/* Poster */}
              <div className="shrink-0 rounded-xl overflow-hidden" style={{ width: 52, height: 78 }}>
                {movie?.poster_path ? (
                  <Image src={tmdbImage(movie.poster_path, "w92")!} alt={movie.title} width={52} height={78} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl" style={{ background: "rgba(139,92,246,0.1)" }}>🎬</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight truncate">{movie?.title}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {new Date(item.watched_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                {item.picked_by && (
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Picked by {item.picked_by}
                  </p>
                )}
                {avg !== null && (
                  <p className="text-sm mt-1 font-mono" style={{ color: "#f59e0b" }}>
                    {"★".repeat(Math.round(avg))}{"☆".repeat(5 - Math.round(avg))}
                    <span className="ml-1 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {avg.toFixed(1)} avg
                    </span>
                  </p>
                )}

                {/* Vibe tags preview */}
                {item.vibe_tags.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {item.vibe_tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="vibe-tag" style={{ fontSize: 11, padding: "2px 8px" }}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-xs self-center" style={{ color: "rgba(255,255,255,0.2)" }}>
                {isExpanded ? "▲" : "▼"}
              </div>
            </div>

            {/* Expanded */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {item.ratings.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Ratings</p>
                    <div className="flex flex-col gap-1.5">
                      {item.ratings.map((r) => (
                        <div key={r.username} className="flex items-center justify-between">
                          <span className="text-sm">{r.username}</span>
                          <span className="font-mono" style={{ color: "#f59e0b" }}>
                            {"★".repeat(r.score)}{"☆".repeat(5 - r.score)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.notes && (
                  <div className="mt-3">
                    <p className="text-xs font-medium mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>Notes</p>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{item.notes}</p>
                  </div>
                )}

                {item.vibe_tags.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>Vibes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.vibe_tags.map((tag) => (
                        <span key={tag} className="vibe-tag active">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
