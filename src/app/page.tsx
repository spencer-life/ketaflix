"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const session = getSession();
    if (session) {
      router.push(`/room/${session.roomCode}`);
    }
  }, [router]);

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
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="fade-in-up max-w-2xl">
          <p className="eyebrow mb-4">Shared Movie Diary</p>
          <h1 className="section-title gradient-text">
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

        <section className="fade-in-up surface-card p-5 sm:p-7" style={{ animationDelay: "0.08s" }}>
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
