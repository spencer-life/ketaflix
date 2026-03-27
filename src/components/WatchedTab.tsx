"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getWatched } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { tmdbImage } from "@/lib/tmdb";
import { getAverageRating } from "@/lib/utils";
import type { WatchedItem } from "@/types";

interface WatchedTabProps {
  roomCode: string;
}

export default function WatchedTab({ roomCode }: WatchedTabProps) {
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function loadWatched() {
      const data = await getWatched(roomCode);
      if (!active) return;
      setItems(data);
      setLoading(false);
    }

    loadWatched();

    const sub = supabase
      .channel(`watched:${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "watched",
          filter: `room_code=eq.${roomCode}`,
        },
        () => loadWatched(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(sub);
    };
  }, [roomCode]);

  useEffect(() => {
    const list = listRef.current;
    if (loading || !list) return;

    import("animejs").then(({ animate, stagger }) => {
      animate(list.querySelectorAll(".watched-card"), {
        opacity: [0, 1],
        translateX: [-24, 0],
        delay: stagger(70),
        duration: 540,
        easing: "easeOutExpo",
      });
    });
  }, [items, loading]);

  if (loading) {
    return (
      <div className="mt-2 flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="shimmer h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="surface-card empty-state mt-2 rounded-[28px] p-10 text-center">
        <p className="text-4xl">📽️</p>
        <p className="mt-4 text-lg font-semibold">No ketalog entries yet</p>
        <p className="mt-2 text-sm text-white/50">
          Mark something watched and the crew history starts here.
        </p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="mt-2 flex flex-col gap-4">
      {items.map((item) => {
        const movie = item.movie;
        const avg = getAverageRating(item.ratings);
        const isExpanded = expanded === item.id;

        return (
          <article
            key={item.id}
            className="watched-card surface-card overflow-hidden rounded-[26px] opacity-0"
            onClick={() => setExpanded(isExpanded ? null : item.id)}
          >
            <div className="flex gap-4 p-4 sm:p-5">
              <div className="poster-frame h-[114px] w-[76px] shrink-0">
                {movie?.poster_path ? (
                  <Image
                    src={tmdbImage(movie.poster_path, "w92")!}
                    alt={movie.title}
                    width={76}
                    height={114}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl text-white/45">
                    🎬
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="meta">
                  {new Date(item.watched_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <h3 className="mt-2 text-xl font-semibold leading-tight">
                  {movie?.title}
                </h3>
                {item.picked_by && (
                  <p className="mt-2 text-sm text-white/52">
                    Picked by {item.picked_by}
                  </p>
                )}
                {avg !== null && (
                  <p className="mt-3 text-sm font-mono text-[var(--accent-warm)]">
                    {avg.toFixed(1)} 🐴 / 10
                  </p>
                )}

                {item.vibe_tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.vibe_tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="vibe-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="self-start rounded-full border border-white/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/35">
                {isExpanded ? "Hide" : "Open"}
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-white/8 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                {item.ratings.length > 0 && (
                  <div className="mt-3">
                    <p className="meta mb-3">Ratings</p>
                    <div className="flex flex-col gap-1.5">
                      {item.ratings.map((r) => (
                        <div
                          key={r.username}
                          className="surface-soft flex items-center justify-between px-4 py-3"
                        >
                          <span className="text-sm">{r.username}</span>
                          <span className="font-mono text-sm text-[var(--accent-warm)]">
                            {r.score} 🐴 / 10
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.notes && (
                  <div className="mt-3">
                    <p className="meta mb-2">Notes</p>
                    <div className="surface-soft p-4 text-sm leading-7 text-white/72">
                      {item.notes}
                    </div>
                  </div>
                )}

                {item.vibe_tags.length > 0 && (
                  <div className="mt-3">
                    <p className="meta mb-2">Vibes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.vibe_tags.map((tag) => (
                        <span key={tag} className="vibe-tag active">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
