"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { tmdbImage } from "@/lib/tmdb";
import type { WatchlistItem, Movie } from "@/types";
import MovieSearch from "./MovieSearch";
import LogWatchedModal from "./LogWatchedModal";

interface WatchlistTabProps {
  roomCode: string;
  username: string;
}

export default function WatchlistTab({ roomCode, username }: WatchlistTabProps) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [logItem, setLogItem] = useState<WatchlistItem | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function loadWatchlist() {
      const data = await getWatchlist(roomCode);
      if (!active) return;
      setItems(data);
      setLoading(false);
    }

    loadWatchlist();

    const sub = supabase
      .channel(`watchlist:${roomCode}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "watchlist", filter: `room_code=eq.${roomCode}` },
        () => loadWatchlist()
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(sub);
    };
  }, [roomCode]);

  useEffect(() => {
    const grid = gridRef.current;
    if (loading || !grid) return;

    import("animejs").then(({ animate, stagger }) => {
      animate(grid.querySelectorAll(".watchlist-card"), {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(80),
        duration: 560,
        easing: "easeOutExpo",
      });
    });
  }, [items, loading]);

  async function handleMovieSelected(movie: Movie) {
    setShowSearch(false);
    try {
      await addToWatchlist(roomCode, movie.id, username);
    } catch {
      // Already in watchlist
    }
  }

  async function handleRemove(id: string) {
    await removeFromWatchlist(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading) {
    return (
      <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="shimmer aspect-[2/3] rounded-[22px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Watchlist</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">Your next stack</h2>
          <p className="mt-1 text-sm text-white/55">
            {items.length ? `${items.length} films waiting in the room.` : "Start building the list."}
          </p>
        </div>
        <button onClick={() => setShowSearch(true)} className="btn-primary sm:w-auto">
          Add Film
        </button>
      </div>

      {items.length === 0 ? (
        <div className="surface-card empty-state rounded-[28px] p-10 text-center">
          <p className="text-4xl">🎬</p>
          <p className="mt-4 text-lg font-semibold">Nothing queued yet</p>
          <p className="mt-2 text-sm text-white/50">Pick the first film and the poster wall starts filling in.</p>
        </div>
      ) : (
        <div ref={gridRef} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <WatchlistCard
              key={item.id}
              item={item}
              currentUser={username}
              onRemove={() => handleRemove(item.id)}
              onMarkWatched={() => setLogItem(item)}
            />
          ))}
        </div>
      )}

      {showSearch && (
        <MovieSearch
          onSelect={handleMovieSelected}
          onClose={() => setShowSearch(false)}
        />
      )}

      {logItem && (
        <LogWatchedModal
          item={logItem}
          roomCode={roomCode}
          username={username}
          onClose={() => setLogItem(null)}
          onLogged={() => {
            setLogItem(null);
            getWatchlist(roomCode).then(setItems);
          }}
        />
      )}
    </div>
  );
}

function WatchlistCard({
  item,
  currentUser,
  onRemove,
  onMarkWatched,
}: {
  item: WatchlistItem;
  currentUser: string;
  onRemove: () => void;
  onMarkWatched: () => void;
}) {
  const movie = item.movie;
  const poster = tmdbImage(movie?.poster_path ?? null);

  return (
    <article className="watchlist-card surface-card overflow-hidden rounded-[26px] opacity-0">
      <div className="poster-frame aspect-[2/3] w-full rounded-none border-x-0 border-t-0">
        {poster ? (
          <Image
            src={poster}
            alt={movie?.title ?? ""}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-white/40">🎬</div>
        )}
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div>
          <p className="meta">{movie?.release_year ?? "Unknown year"}</p>
          <h3 className="mt-2 text-lg font-semibold leading-tight">{movie?.title}</h3>
          <p className="mt-2 text-sm text-white/50">
            Added by {item.added_by}
            {movie?.tmdb_rating ? ` · TMDB ${movie.tmdb_rating.toFixed(1)}` : ""}
          </p>
        </div>

        {movie?.overview && (
          <p className="line-clamp-3 text-sm leading-6 text-white/55">{movie.overview}</p>
        )}

        {movie?.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {movie.genres.slice(0, 3).map((g) => (
              <span key={g.id} className="vibe-tag">
                {g.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex gap-2">
          <button onClick={onMarkWatched} className="btn-primary flex-1">
            Mark Watched
          </button>
          {item.added_by === currentUser && (
            <button onClick={onRemove} className="btn-ghost px-4 py-3 text-sm">
              Remove
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
