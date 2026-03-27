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
import MoviePoster from "@/components/MoviePoster";
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
      className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-28 sm:px-6 lg:px-8"
    >
      {/* Hero Featured Movie */}
      {sections[0]?.movies[0] && (
        <section className="-mx-4 sm:-mx-6 lg:-mx-8" data-discover-item>
          <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/7]">
            {tmdbImage(
              sections[0].movies[0].backdrop_path ??
                sections[0].movies[0].poster_path,
              "w1280",
            ) && (
              <Image
                src={
                  tmdbImage(
                    sections[0].movies[0].backdrop_path ??
                      sections[0].movies[0].poster_path,
                    "w1280",
                  )!
                }
                alt={sections[0].movies[0].title}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 sm:px-8 sm:pb-10">
              <p className="eyebrow">Featured</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-4xl">
                {sections[0].movies[0].title}
              </h1>
              {sections[0].movies[0].overview && (
                <p className="mt-2.5 line-clamp-2 max-w-lg text-sm leading-relaxed text-white/70">
                  {sections[0].movies[0].overview}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Genre Scroller */}
      <section data-discover-item className="mt-8 opacity-0">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/55">
          Browse by Genre
        </h2>
        <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {genres
            .filter((g) => g.id !== 10770)
            .map((genre) => {
              const Icon = GENRE_ICONS[genre.id] || Film;
              return (
                <Link
                  key={genre.id}
                  href={`/discover/genre/${genre.id}`}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
                >
                  <Icon
                    className="h-3.5 w-3.5 text-white/45"
                    strokeWidth={1.6}
                  />
                  <span className="whitespace-nowrap">{genre.name}</span>
                </Link>
              );
            })}
        </div>
      </section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section data-discover-item className="mt-10 opacity-0">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/55">
            Because you watched {recSeedTitle}
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {recommendations.map((movie) => (
              <div key={movie.id} className="group min-w-0">
                <MoviePoster
                  posterPath={movie.poster_path}
                  title={movie.title}
                  voteAverage={movie.vote_average}
                />
                <p className="mt-2 truncate text-[13px] font-semibold leading-tight tracking-tight text-white/90">
                  {movie.title}
                </p>
                <p className="mt-0.5 text-[11px] text-white/45">
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
          className="mt-14 opacity-0"
        >
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/55">
            {section.title}
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {section.movies.map((movie) => (
              <div key={movie.id} className="group min-w-0">
                <MoviePoster
                  posterPath={movie.poster_path}
                  title={movie.title}
                  voteAverage={movie.vote_average}
                />
                <p className="mt-2 truncate text-[13px] font-semibold leading-tight tracking-tight text-white/90">
                  {movie.title}
                </p>
                <p className="mt-0.5 text-[11px] text-white/45">
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
