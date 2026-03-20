"use client";

import { useState, useEffect, useRef } from "react";
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
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getWatchlist(roomCode).then((data) => {
      setItems(data);
      setLoading(false);
      animateCards();
    });

    // Realtime subscription
    const sub = supabase
      .channel(`watchlist:${roomCode}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "watchlist", filter: `room_code=eq.${roomCode}` },
        () => {
          getWatchlist(roomCode).then(setItems);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [roomCode]);

  function animateCards() {
    import("animejs").then((m) => {
      const anime = m.default ?? m;
      if (listRef.current) {
        const cards = listRef.current.querySelectorAll(".watchlist-card");
        anime({
          targets: cards,
          opacity: [0, 1],
          translateY: [20, 0],
          delay: anime.stagger(80),
          duration: 500,
          easing: "easeOutExpo",
        });
      }
    });
  }

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
      <div className="flex flex-col gap-3 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="shimmer h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Add button */}
      <button
        onClick={() => setShowSearch(true)}
        className="btn-primary mb-4"
        style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}
      >
        + Add Movie
      </button>

      {items.length === 0 ? (
        <div
          className="glass rounded-2xl p-8 text-center"
          style={{ border: "1px dashed rgba(255,255,255,0.1)" }}
        >
          <p className="text-4xl mb-3">🎬</p>
          <p className="font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
            Nothing on the list yet
          </p>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            Add a movie to get started
          </p>
        </div>
      ) : (
        <div ref={listRef} className="flex flex-col gap-3">
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
    <div
      className="watchlist-card glass glass-hover rounded-2xl overflow-hidden flex gap-3 p-3"
      style={{ opacity: 0 }}
    >
      {/* Poster */}
      <div
        className="shrink-0 rounded-xl overflow-hidden"
        style={{ width: 60, height: 88 }}
      >
        {poster ? (
          <Image
            src={poster}
            alt={movie?.title ?? ""}
            width={60}
            height={88}
            className="object-cover w-full h-full"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-2xl"
            style={{ background: "rgba(139,92,246,0.1)" }}
          >
            🎬
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight">{movie?.title}</p>
        <p
          className="text-xs mt-0.5"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {movie?.release_year} · {movie?.tmdb_rating ? `⭐ ${movie.tmdb_rating}` : ""}
        </p>
        <p
          className="text-xs mt-1"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Added by {item.added_by}
        </p>
        {movie?.genres && movie.genres.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {movie.genres.slice(0, 2).map((g) => (
              <span
                key={g.id}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {g.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5 shrink-0">
        <button
          onClick={onMarkWatched}
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{
            background: "rgba(139,92,246,0.2)",
            color: "#a78bfa",
            border: "1px solid rgba(139,92,246,0.3)",
          }}
        >
          Watched ✓
        </button>
        {item.added_by === currentUser && (
          <button
            onClick={onRemove}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{
              background: "rgba(255,59,48,0.1)",
              color: "rgba(255,100,100,0.7)",
              border: "1px solid rgba(255,59,48,0.15)",
            }}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
