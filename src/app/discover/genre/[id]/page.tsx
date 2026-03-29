"use client";

import { useEffect, useRef, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getGenres,
  discoverByGenre,
  tmdbImage,
  EXCLUDED_GENRE_IDS,
} from "@/lib/tmdb";
import type { TMDBSearchResult } from "@/types";

export default function GenrePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const genreId = parseInt(id, 10);

  const [genreName, setGenreName] = useState("");
  const [movies, setMovies] = useState<TMDBSearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (EXCLUDED_GENRE_IDS.includes(genreId)) {
      setBlocked(true);
      setLoading(false);
      return;
    }

    async function load() {
      const [genres, results] = await Promise.all([
        getGenres(),
        discoverByGenre(genreId, 1),
      ]);
      const genre = genres.find((g) => g.id === genreId);
      setGenreName(genre?.name ?? "Unknown Genre");
      setMovies(results);
      setLoading(false);
    }

    load();
  }, [genreId]);

  useEffect(() => {
    const grid = gridRef.current;
    if (loading || !grid) return;

    import("animejs").then(({ animate, stagger }) => {
      animate(grid.querySelectorAll(".genre-card"), {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(40),
        duration: 500,
        easing: "easeOutExpo",
      });
    });
  }, [loading, movies.length]);

  async function handleLoadMore() {
    setLoadingMore(true);
    const nextPage = page + 1;
    const more = await discoverByGenre(genreId, nextPage);
    setMovies((prev) => [...prev, ...more]);
    setPage(nextPage);
    setLoadingMore(false);
  }

  if (loading) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="shimmer mb-2 h-4 w-20 rounded" />
          <div className="shimmer h-10 w-48 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="shimmer aspect-[2/3] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-semibold">Not available on Ketaflix</p>
        <p className="mt-2 text-sm text-white/50">
          This genre isn&apos;t part of the Ketaflix vibe. Browse something more
          fun instead.
        </p>
        <Link href="/discover" className="btn-primary mt-6">
          Back to Discover
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="py-8">
        <Link
          href="/discover"
          className="btn-ghost mb-4 inline-flex items-center gap-2 px-3 py-1.5 text-xs"
        >
          &larr; Back to Discover
        </Link>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {genreName}
        </h1>
        <p className="mt-2 text-sm text-white/55">
          {movies.length} films found
        </p>
      </header>

      {/* Results Grid */}
      <div
        ref={gridRef}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        {movies.map((movie, idx) => (
          <article
            key={`${movie.id}-${idx}`}
            className="genre-card group min-w-0 opacity-0"
          >
            <div className="poster-frame aspect-[2/3] overflow-hidden">
              {movie.poster_path ? (
                <Image
                  src={tmdbImage(movie.poster_path, "w342")!}
                  alt={movie.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl text-white/55">
                  🎬
                </div>
              )}
              {movie.vote_average > 0 && (
                <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-xs font-mono text-[#d8ffe3] backdrop-blur-sm">
                  {movie.vote_average.toFixed(1)}
                </div>
              )}
            </div>
            <p className="mt-2 truncate text-sm font-medium text-white/70">
              {movie.title}
            </p>
            <p className="text-xs text-white/35">
              {movie.release_date
                ? new Date(movie.release_date).getFullYear()
                : ""}
            </p>
          </article>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="btn-ghost px-6 py-3"
        >
          {loadingMore ? "Loading..." : "Load More"}
        </button>
      </div>
    </div>
  );
}
