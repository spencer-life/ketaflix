"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { getFeed, getUserCrews, searchProfiles } from "@/lib/db";
import { getTrending, getPopular, getGenres, tmdbImage } from "@/lib/tmdb";
import FeedActivityItem from "@/components/FeedActivityItem";
import FeedMovieCard from "@/components/FeedMovieCard";
import CrewCard from "@/components/CrewCard";
import ProfileCard from "@/components/ProfileCard";
import Link from "next/link";
import { GENRE_ICONS } from "@/lib/genre-icons";
import { Film, Users, ChevronRight } from "lucide-react";
import type {
  ActivityFeedItem,
  Profile,
  Room,
  TMDBSearchResult,
  TMDBGenre,
} from "@/types";

export default function HomePage() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-sm text-white/40">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <LandingPage />;
  }

  return <FeedPage />;
}

// ─── Feed (Authenticated) ──────────────────────────────────────────────────

function FeedPage() {
  const { user } = useAuth();
  const [feed, setFeed] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState<Profile[]>([]);
  const [crews, setCrews] = useState<Room[]>([]);
  const [trending, setTrending] = useState<TMDBSearchResult[]>([]);
  const [popular, setPopular] = useState<TMDBSearchResult[]>([]);
  const [genres, setGenresState] = useState<TMDBGenre[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [feedData, users, userCrews, trendingData, popularData, genreData] =
        await Promise.all([
          getFeed(user!.id),
          searchProfiles("", 6),
          getUserCrews(user!.id),
          getTrending(),
          getPopular(),
          getGenres(),
        ]);
      setFeed(feedData);
      setSuggestedUsers(users.filter((u) => u.id !== user!.id));
      setCrews(userCrews);
      setTrending(trendingData);
      setPopular(popularData);
      setGenresState(genreData);
      setLoading(false);
    }
    load();
  }, [user]);

  useEffect(() => {
    if (loading || !contentRef.current) return;
    import("animejs").then(({ animate }) => {
      if (!contentRef.current) return;
      animate(contentRef.current, {
        opacity: [0, 1],
        translateY: [12, 0],
        duration: 650,
        easing: "cubicBezier(0.33, 1, 0.68, 1)",
      });
    });
  }, [loading]);

  const trendingMovies = useMemo(() => {
    const movieActivities = new Map<
      string,
      { title: string; poster: string | null; items: ActivityFeedItem[] }
    >();
    feed.forEach((item) => {
      if (
        item.movie_title &&
        (item.activity_type === "watched" || item.activity_type === "rated")
      ) {
        const key = item.movie_title;
        if (!movieActivities.has(key)) {
          movieActivities.set(key, {
            title: item.movie_title,
            poster: item.movie_poster_path,
            items: [],
          });
        }
        movieActivities.get(key)!.items.push(item);
      }
    });
    return Array.from(movieActivities.values())
      .sort((a, b) => b.items.length - a.items.length)
      .slice(0, 6);
  }, [feed]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-sm text-white/40">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-4xl px-4 pb-28 sm:px-6">
      {/* Header */}
      <header className="py-5">
        <h1 className="text-xl font-bold tracking-tight">Ketaflix</h1>
        <p className="text-sm text-white/55">What your crew is watching</p>
      </header>

      <div ref={contentRef} className="opacity-0">
        {/* Trending poster strip */}
        {trending.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/55">
              Trending This Week
            </h2>
            <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4">
              {trending.slice(0, 10).map((movie) => {
                const poster = tmdbImage(movie.poster_path, "w342");
                if (!poster) return null;
                return (
                  <div
                    key={movie.id}
                    className="poster-frame aspect-[2/3] w-28 shrink-0 sm:w-32"
                  >
                    <Image
                      src={poster}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                    {movie.vote_average > 0 && (
                      <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white/80 backdrop-blur-xl">
                        {movie.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Genre chips */}
        {genres.length > 0 && (
          <section className="mb-10">
            <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4">
              {genres.slice(0, 12).map((genre) => {
                const Icon = GENRE_ICONS[genre.id] || Film;
                return (
                  <Link
                    key={genre.id}
                    href={`/discover/genre/${genre.id}`}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3.5 py-2 text-xs font-medium transition-colors hover:bg-white/10"
                  >
                    <Icon
                      className="h-3.5 w-3.5 text-white/45"
                      strokeWidth={1.6}
                    />
                    <span>{genre.name}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* My Ketacrews */}
        {crews.length > 0 ? (
          <section className="mb-10">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/55">
                My Ketacrews
              </h2>
              <Link
                href="/rooms"
                className="text-xs text-[var(--accent)] transition-colors hover:text-[var(--accent)]/80"
              >
                Join or Create
              </Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {crews.map((crew) => (
                <CrewCard key={crew.code} crew={crew} />
              ))}
            </div>
          </section>
        ) : (
          <section className="mb-10">
            <Link
              href="/rooms"
              className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/8 p-5 transition-all hover:border-white/12"
              style={{
                background:
                  "radial-gradient(circle at right, rgba(52,211,153,0.08), transparent 60%), linear-gradient(135deg, rgba(14,17,22,0.96), rgba(20,24,28,0.92))",
              }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] transition-transform group-hover:scale-105">
                <Users
                  className="h-6 w-6 text-[var(--accent)]"
                  strokeWidth={1.8}
                />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  Create Your First Ketacrew
                </p>
                <p className="mt-0.5 text-xs text-white/50">
                  Watch movies together with friends
                </p>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-white/20 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </section>
        )}

        {/* Popular with friends (from feed) */}
        {trendingMovies.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/55">
              Popular with Friends
            </h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {trendingMovies.map((movie) => (
                <FeedMovieCard
                  key={movie.title}
                  movieTitle={movie.title}
                  posterPath={movie.poster}
                  activities={movie.items}
                />
              ))}
            </div>
          </section>
        )}

        {/* People to follow — visible on all screens */}
        {suggestedUsers.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/55">
              People to Follow
            </h2>
            <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
              {suggestedUsers.slice(0, 5).map((u) => (
                <div key={u.id} className="shrink-0 lg:shrink">
                  <ProfileCard profile={u} showFollowButton />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Popular right now */}
        {popular.length > 0 && (
          <section className="mb-10">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-white/55">
                Popular Right Now
              </h2>
              <Link
                href="/discover"
                className="text-xs text-[var(--accent)] hover:underline"
              >
                See All →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {popular.slice(0, 6).map((movie) => {
                const poster = tmdbImage(movie.poster_path, "w342");
                return (
                  <div key={movie.id} className="min-w-0">
                    <div className="poster-frame aspect-[2/3]">
                      {poster ? (
                        <Image
                          src={poster}
                          alt={movie.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 33vw, 16vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/40">
                          🎬
                        </div>
                      )}
                    </div>
                    <p className="mt-2 truncate text-[13px] font-semibold leading-tight tracking-tight text-white/90">
                      {movie.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Recent activity */}
        {feed.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/55">
              Recent Activity
            </h2>
            <div className="flex flex-col gap-3">
              {feed.map((item) => (
                <FeedActivityItem key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Landing Page (Unauthenticated) ────────────────────────────────────────
// NOTE: The anime.js character stagger animation uses innerText splitting,
// which only processes the element's own safe text content (no user input).

function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [trending, setTrending] = useState<TMDBSearchResult[]>([]);

  useEffect(() => {
    getTrending().then(setTrending);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
    }[] = [];

    const colors = ["#34d399", "#6ee7b7", "#f59e0b", "#ffffff"];

    for (let index = 0; index < 40; index += 1) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.45 + 0.08,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animId = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.05 * (1 - distance / 140)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particle.color}${Math.floor(particle.alpha * 255)
          .toString(16)
          .padStart(2, "0")}`;
        ctx.fill();

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    import("animejs").then(({ animate, stagger }) => {
      if (!mounted) return;
      const title = titleRef.current;
      const card = cardRef.current;

      if (title) {
        // Safe: innerText is from our own hardcoded heading, not user input
        const text = title.innerText;
        const fragment = document.createDocumentFragment();
        text.split("").forEach((char) => {
          const span = document.createElement("span");
          span.className = "char";
          span.style.display = "inline-block";
          span.style.opacity = "0";
          span.textContent = char === " " ? "\u00A0" : char;
          fragment.appendChild(span);
        });
        title.textContent = "";
        title.appendChild(fragment);

        animate(title.querySelectorAll(".char"), {
          opacity: [0, 1],
          translateY: [30, 0],
          delay: stagger(42),
          duration: 760,
          easing: "easeOutExpo",
        });
      }

      if (card) {
        animate(card, {
          opacity: [0, 1],
          translateY: [36, 0],
          delay: 200,
          duration: 820,
          easing: "easeOutExpo",
        });
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <canvas ref={canvasRef} id="particles" />
      <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="fade-in-up max-w-2xl">
          <p className="eyebrow mb-4">Ketalogs</p>
          <h1 ref={titleRef} className="section-title gradient-text">
            Track films with your crew. Rate, vibe, repeat.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
            Build a Ketaqueue, log your Ketalogs, and share the experience with
            your Ketacrew.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="info-chip">Poster grid queues</span>
            <span className="info-chip">Follow your friends</span>
            <span className="info-chip">Activity feed</span>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="surface-soft p-4">
              <p className="meta">Track</p>
              <p className="mt-2 text-2xl font-bold">Ketaqueue</p>
              <p className="mt-1 text-sm text-white/55">
                Keep the next picks visible.
              </p>
            </div>
            <div className="surface-soft p-4">
              <p className="meta">Log</p>
              <p className="mt-2 text-2xl font-bold">Ketalogs</p>
              <p className="mt-1 text-sm text-white/55">
                Store ratings, notes, and vibes.
              </p>
            </div>
            <div className="surface-soft p-4">
              <p className="meta">Connect</p>
              <p className="mt-2 text-2xl font-bold">Ketacrew</p>
              <p className="mt-1 text-sm text-white/55">
                Your people, your movie nights.
              </p>
            </div>
          </div>
        </section>

        <section
          ref={cardRef}
          className="surface-card relative z-10 p-5 opacity-0 sm:p-7"
        >
          <div className="mb-8">
            <p className="meta">Join the Film Club</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight">Ketaflix</h2>
            <p className="mt-2 text-sm text-white/55">
              Create your account or sign in to get started.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/register" className="btn-primary w-full text-center">
              Create Account
            </Link>
            <Link href="/login" className="btn-ghost w-full text-center">
              Sign In
            </Link>
          </div>

          <p className="mt-5 text-center text-sm text-white/35">
            Pick a username, set a password, and you&apos;re in.
          </p>
        </section>
      </div>

      {/* Trending poster strip */}
      {trending.length > 0 && (
        <div className="relative z-10 mt-12">
          <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-white/30">
            Trending This Week
          </p>
          <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
            {trending.slice(0, 10).map((movie) => {
              const poster = tmdbImage(movie.poster_path, "w342");
              if (!poster) return null;
              return (
                <div
                  key={movie.id}
                  className="poster-frame aspect-[2/3] w-28 shrink-0 sm:w-32"
                >
                  <Image
                    src={poster}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
