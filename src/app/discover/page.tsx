"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getGenres,
  getNowPlaying,
  getTopRated,
  getPopular,
  getTrending,
  getRecommendations,
  tmdbImage,
} from "@/lib/tmdb";
import { getRecentWatchedByProfile } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";
import { GENRE_ICONS } from "@/lib/genre-icons";
import { Film } from "lucide-react";
import type { TMDBSearchResult, TMDBGenre } from "@/types";

interface MovieSection {
  title: string;
  movies: TMDBSearchResult[];
}

export default function DiscoverPage() {
  const { user } = useAuth();
  const [genres, setGenres] = useState<TMDBGenre[]>([]);
  const [sections, setSections] = useState<MovieSection[]>([]);
  const [recommendations, setRecommendations] = useState<TMDBSearchResult[]>(
    [],
  );
  const [recSeedTitle, setRecSeedTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const [genreList, nowPlaying, topRated, popular, trending] =
        await Promise.all([
          getGenres(),
          getNowPlaying(),
          getTopRated(),
          getPopular(),
          getTrending(),
        ]);

      setGenres(genreList);
      setSections([
        { title: "Now Playing", movies: nowPlaying },
        { title: "Trending This Week", movies: trending },
        { title: "Popular Right Now", movies: popular },
        { title: "Top Rated", movies: topRated },
      ]);
      setLoading(false);

      // Load recommendations if logged in
      if (user) {
        try {
          const watched = await getRecentWatchedByProfile(user.id, 10);
          const withTmdb = watched.filter((w) => w.movie?.tmdb_id);
          if (withTmdb.length > 0) {
            const seed = withTmdb[Math.floor(Math.random() * withTmdb.length)];
            const recs = await getRecommendations(seed.movie!.tmdb_id);
            if (recs.length > 0) {
              setRecSeedTitle(seed.movie!.title);
              setRecommendations(recs);
            }
          }
        } catch {
          // Graceful fallback — no recommendations shown
        }
      }
    }

    load();
  }, [user]);

  useEffect(() => {
    const container = containerRef.current;
    if (loading || !container) return;

    import("animejs").then(({ animate, stagger }) => {
      animate(container.querySelectorAll("[data-discover-item]"), {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(60, { start: 100 }),
        duration: 700,
        easing: "cubicBezier(0.33, 1, 0.68, 1)",
      });
    });
  }, [loading]);

  if (loading) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="shimmer mb-2 h-4 w-24 rounded" />
          <div className="shimmer h-8 w-64 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="shimmer h-16 rounded-2xl" />
          ))}
        </div>
        <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="shimmer aspect-[2/3] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <header className="py-8" data-discover-item>
        <p className="eyebrow">Explore</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Find your next film
        </h1>
        <p className="mt-2 text-sm text-white/55">
          Browse by genre, check what is trending, or explore all-time greats.
        </p>
      </header>

      {/* Genre Grid */}
      <section data-discover-item className="opacity-0">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
          Browse by Genre
        </h2>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {genres
            .filter((g) => g.id !== 10770)
            .map((genre) => {
              const Icon = GENRE_ICONS[genre.id] || Film;
              return (
                <Link
                  key={genre.id}
                  href={`/discover/genre/${genre.id}`}
                  className="surface-soft flex items-center gap-3 px-4 py-3.5 transition-all hover:bg-white/8 hover:border-white/12"
                >
                  <Icon
                    className="h-4 w-4 shrink-0 text-white/50"
                    strokeWidth={1.8}
                  />
                  <span className="text-sm font-medium tracking-tight">
                    {genre.name}
                  </span>
                </Link>
              );
            })}
        </div>
      </section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section data-discover-item className="mt-10 opacity-0">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
            Because you watched {recSeedTitle}
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {recommendations.map((movie) => (
              <div key={movie.id} className="group min-w-0">
                <div className="poster-frame aspect-[2/3] overflow-hidden">
                  {movie.poster_path ? (
                    <Image
                      src={tmdbImage(movie.poster_path, "w342")!}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl text-white/40">
                      🎬
                    </div>
                  )}
                  {movie.vote_average > 0 && (
                    <div className="absolute bottom-1.5 right-1.5 rounded-full border border-white/10 bg-black/40 px-1.5 py-0.5 text-[11px] font-semibold text-white/90 backdrop-blur-md">
                      {movie.vote_average.toFixed(1)}
                    </div>
                  )}
                </div>
                <p className="mt-2 truncate text-xs font-medium text-white/70">
                  {movie.title}
                </p>
                <p className="text-xs text-white/35">
                  {movie.release_date
                    ? new Date(movie.release_date).getFullYear()
                    : ""}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Curated Sections */}
      {sections.map((section) => (
        <section
          key={section.title}
          data-discover-item
          className="mt-12 opacity-0"
        >
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
            {section.title}
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {section.movies.map((movie) => (
              <div key={movie.id} className="group min-w-0">
                <div className="poster-frame aspect-[2/3] overflow-hidden">
                  {movie.poster_path ? (
                    <Image
                      src={tmdbImage(movie.poster_path, "w342")!}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl text-white/40">
                      🎬
                    </div>
                  )}
                  {movie.vote_average > 0 && (
                    <div className="absolute bottom-1.5 right-1.5 rounded-full border border-white/10 bg-black/40 px-1.5 py-0.5 text-[11px] font-semibold text-white/90 backdrop-blur-md">
                      {movie.vote_average.toFixed(1)}
                    </div>
                  )}
                </div>
                <p className="mt-2 truncate text-xs font-medium text-white/70">
                  {movie.title}
                </p>
                <p className="text-xs text-white/35">
                  {movie.release_date
                    ? new Date(movie.release_date).getFullYear()
                    : ""}
                </p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
