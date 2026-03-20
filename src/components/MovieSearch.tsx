"use client";

import { useState, useRef, useEffect } from "react";
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

  // Load trending on open
  useEffect(() => {
    inputRef.current?.focus();
    getTrending().then(setResults).catch(() => {});
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      getTrending().then(setResults).catch(() => {});
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      searchMovies(query)
        .then(setResults)
        .finally(() => setLoading(false));
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  // Anime.js entrance
  useEffect(() => {
    import("animejs").then((m) => {
      const anime = m.default ?? m;
      if (overlayRef.current) {
        anime({
          targets: overlayRef.current.querySelector(".search-panel"),
          translateY: ["100%", "0%"],
          duration: 400,
          easing: "easeOutExpo",
        });
      }
    });
  }, []);

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
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(10,10,15,0.7)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="search-panel flex flex-col h-full max-h-[90dvh] mt-auto rounded-t-2xl overflow-hidden"
        style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Search header */}
        <div className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              className="keta-input flex-1"
              placeholder="Search movies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={onClose} className="btn-ghost px-3 py-2 shrink-0">
              Cancel
            </button>
          </div>
        </div>

        {/* Label */}
        <div className="px-4 py-2">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            {query ? `Results for "${query}"` : "Trending this week"}
          </span>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
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
                  className="movie-card flex gap-3 p-3 text-left w-full"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  {/* Poster */}
                  <div
                    className="shrink-0 rounded-lg overflow-hidden"
                    style={{ width: 48, height: 72 }}
                  >
                    {r.poster_path ? (
                      <Image
                        src={tmdbImage(r.poster_path, "w92")!}
                        alt={r.title}
                        width={48}
                        height={72}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-xl"
                        style={{ background: "rgba(139,92,246,0.1)" }}
                      >
                        🎬
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-tight truncate">
                      {r.title}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      {r.release_date ? new Date(r.release_date).getFullYear() : "Unknown"}
                      {r.vote_average > 0 && (
                        <span className="ml-2">⭐ {r.vote_average.toFixed(1)}</span>
                      )}
                    </p>
                    <p
                      className="text-xs mt-1 line-clamp-2 leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      {r.overview}
                    </p>
                  </div>

                  {selecting === r.id && (
                    <div
                      className="shrink-0 text-xs self-center"
                      style={{ color: "#a78bfa" }}
                    >
                      Adding...
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
