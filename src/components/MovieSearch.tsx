"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { searchMovies, getTrending, getMovieDetails, tmdbImage } from "@/lib/tmdb";
import { upsertMovie } from "@/lib/db";
import type { TMDBSearchResult, Movie } from "@/types";

interface MovieSearchProps {
  onSelect: (movie: Movie) => void;
  onClose: () => void;
}

export default function MovieSearch({ onSelect, onClose }: MovieSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    import("animejs").then(({ animate }) => {
      const panel = overlayRef.current?.querySelector(".search-panel");
      if (!panel) return;

      animate(panel, {
        translateY: ["100%", "0%"],
        duration: 420,
        easing: "easeOutExpo",
      });
    });
  }, []);

  useEffect(() => {
    let active = true;

    if (!query.trim()) {
      setLoading(false);
      getTrending()
        .then((data) => {
          if (active) setResults(data);
        })
        .catch(() => {});

      return () => {
        active = false;
      };
    }

    setLoading(true);
    const t = setTimeout(() => {
      searchMovies(query)
        .then((data) => {
          if (active) setResults(data);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 350);

    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  async function handleSelect(result: TMDBSearchResult) {
    setSelecting(result.id);
    try {
      const details = await getMovieDetails(result.id);
      const movie = await upsertMovie(details);
      onSelect(movie);
    } catch {
      setSelecting(null);
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="search-panel surface-card mt-auto flex h-full max-h-[90dvh] flex-col overflow-hidden rounded-t-[28px] rounded-b-none"
      >
        <div className="border-b border-white/8 p-4 sm:p-5">
          <p className="meta mb-3">Add To Watchlist</p>
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              className="keta-input flex-1"
              placeholder="Search for a film"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={onClose} className="btn-ghost shrink-0 px-4 py-3">
              Cancel
            </button>
          </div>
        </div>

        <div className="px-4 py-3 sm:px-5">
          <span className="meta">
            {query ? `Results for "${query}"` : "Trending this week"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6 sm:px-5">
          {loading ? (
            <div className="flex flex-col gap-3 mt-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="shimmer h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-1">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r)}
                  disabled={selecting === r.id}
                  className="movie-card flex w-full gap-3 p-3 text-left"
                >
                  <div className="poster-frame h-[72px] w-12 shrink-0">
                    {r.poster_path ? (
                      <Image
                        src={tmdbImage(r.poster_path, "w92")!}
                        alt={r.title}
                        width={48}
                        height={72}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl text-white/45">
                        🎬
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold leading-tight">{r.title}</p>
                    <p className="mt-1 text-xs text-white/45">
                      {r.release_date ? new Date(r.release_date).getFullYear() : "Unknown"}
                      {r.vote_average > 0 && (
                        <span className="ml-2">TMDB {r.vote_average.toFixed(1)}</span>
                      )}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/35">
                      {r.overview || "No synopsis available."}
                    </p>
                  </div>

                  {selecting === r.id && (
                    <div className="shrink-0 self-center text-xs text-[#d8ffe3]">
                      Adding...
                    </div>
                  )}
                </button>
              ))}
              {!results.length && (
                <div className="surface-soft p-6 text-center text-sm text-white/50">
                  No movies matched that search.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
