"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateRoom, joinRoom } from "@/lib/db";
import { setSession, getSession } from "@/lib/supabase";
import { generateRoomCode } from "@/lib/utils";

export default function LandingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"join" | "create">("join");
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const session = getSession();
    if (session) {
      router.push(`/room/${session.roomCode}`);
    }
  }, [router]);

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

    const colors = ["#00c030", "#72f48b", "#ff9f1c", "#ffffff"];

    for (let index = 0; index < 72; index += 1) {
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

      particles.forEach((particle, index) => {
        particles.slice(index + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 140) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(255,255,255,${0.05 * (1 - distance / 140)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

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
        const text = title.innerText;
        title.innerHTML = text
          .split("")
          .map((char) =>
            `<span class="char" style="display:inline-block;opacity:0">${char === " " ? "&nbsp;" : char}</span>`
          )
          .join("");

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const u = username.trim();
    if (!u || u.length < 2) { setError("Username must be at least 2 characters"); return; }
    const code = mode === "create" ? generateRoomCode() : roomCode.trim().toUpperCase();
    if (!code || code.length < 4) { setError("Enter a valid room code"); return; }
    setLoading(true);
    try {
      await getOrCreateRoom(code, u);
      await joinRoom(u, code);
      setSession({ username: u, roomCode: code });
      router.push(`/room/${code}`);
    } catch {
      setError("Something went wrong. Check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <canvas ref={canvasRef} id="particles" />
      <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="fade-in-up max-w-2xl">
          <p className="eyebrow mb-4">Shared Movie Diary</p>
          <h1 ref={titleRef} className="section-title gradient-text">
            Ketaflix feels better when it looks like a film club, not a crypto landing page.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
            Spin up a room, stack a watchlist, and log each movie like a proper diary entry.
            Darker surfaces, cleaner metadata, poster-first browsing.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="info-chip">Poster grid watchlists</span>
            <span className="info-chip">Shared ratings and notes</span>
            <span className="info-chip">Quick join with room codes</span>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="surface-soft p-4">
              <p className="meta">Track</p>
              <p className="mt-2 text-2xl font-bold">Watchlist</p>
              <p className="mt-1 text-sm text-white/55">Keep the next picks visible.</p>
            </div>
            <div className="surface-soft p-4">
              <p className="meta">Log</p>
              <p className="mt-2 text-2xl font-bold">Diary</p>
              <p className="mt-1 text-sm text-white/55">Store ratings, notes, and vibes.</p>
            </div>
            <div className="surface-soft p-4">
              <p className="meta">Share</p>
              <p className="mt-2 text-2xl font-bold">Room Code</p>
              <p className="mt-1 text-sm text-white/55">No accounts, no extra friction.</p>
            </div>
          </div>
        </section>

        <section
          ref={cardRef}
          className="surface-card relative z-10 p-5 opacity-0 sm:p-7"
        >
          <div className="mb-8">
            <p className="meta">Enter The Room</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight">Ketaflix</h2>
            <p className="mt-2 text-sm text-white/55">Join your crew or start a new screening room.</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-2 rounded-full border border-white/10 bg-white/5 p-1.5">
            {(["join", "create"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`tab-btn ${mode === m ? "active" : ""}`}
                type="button"
              >
                {m === "join" ? "Join Room" : "Create Room"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="meta mb-2 block">Display Name</label>
              <input
                className="keta-input"
                placeholder="e.g. Spencer"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
                autoComplete="off"
              />
            </div>

            {mode === "join" ? (
              <div>
                <label className="meta mb-2 block">Room Code</label>
                <input
                  className="keta-input font-mono uppercase tracking-[0.35em]"
                  placeholder="ABCD1"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  autoComplete="off"
                />
              </div>
            ) : (
              <div className="surface-soft p-4 text-sm leading-6 text-white/60">
                A fresh room code is generated automatically, ready to copy and share.
              </div>
            )}

            {error && <p className="text-sm text-red-300">{error}</p>}

            <button type="submit" className="btn-primary mt-2 w-full" disabled={loading}>
              {loading ? "Loading..." : mode === "join" ? "Join Room" : "Create Room"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-white/35">No account needed. Just pick a name.</p>
        </section>
      </div>
    </main>
  );
}
