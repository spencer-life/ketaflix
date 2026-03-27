"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getOrCreateCrew, getUserCrews, joinCrew } from "@/lib/db";
import CrewCard from "@/components/CrewCard";
import type { Room } from "@/types";
import { setSession } from "@/lib/supabase";
import { generateCrewCode } from "@/lib/utils";
import { UserPlus, Plus, Users, Sparkles } from "lucide-react";

export default function RoomsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"join" | "create">("join");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [crews, setCrews] = useState<Room[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const crewListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user) {
      getUserCrews(user.id).then(setCrews);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading || !containerRef.current) return;
    import("animejs").then(({ animate }) => {
      if (!containerRef.current) return;
      animate(containerRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: "easeOutExpo",
      });
    });
  }, [authLoading]);

  useEffect(() => {
    if (!crewListRef.current || crews.length === 0) return;
    import("animejs").then(({ animate, stagger }) => {
      if (!crewListRef.current) return;
      animate(crewListRef.current.querySelectorAll(".crew-card-item"), {
        opacity: [0, 1],
        translateY: [16, 0],
        delay: stagger(70, { start: 200 }),
        duration: 520,
        easing: "easeOutExpo",
      });
    });
  }, [crews]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!profile) return;

    const username = profile.display_name || profile.username;
    const code =
      mode === "create" ? generateCrewCode() : roomCode.trim().toUpperCase();

    if (!code || code.length < 4) {
      setError("Enter a valid crew code");
      return;
    }

    setLoading(true);
    try {
      await getOrCreateCrew(code, username);
      await joinCrew(username, code, user?.id);
      setSession({ username, roomCode: code });
      router.push(`/room/${code}`);
    } catch {
      setError("Something went wrong. Check your connection and try again.");
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-sm text-white/40">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-24 pt-6">
      {/* Hero header */}
      <div
        ref={containerRef}
        className="relative mb-6 overflow-hidden rounded-[28px] border border-white/8 p-6 opacity-0 sm:p-8"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(0,192,48,0.18), transparent 50%), radial-gradient(circle at bottom left, rgba(255,159,28,0.12), transparent 40%), linear-gradient(135deg, rgba(11,13,16,0.96), rgba(20,24,28,0.92))",
        }}
      >
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
              <Users className="h-4 w-4 text-[var(--accent)]" />
            </div>
            <p className="eyebrow">Ketacrew</p>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {mode === "join" ? "Join a Ketacrew" : "Start a Ketacrew"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-white/60">
            {mode === "join"
              ? "Got a crew code? Punch it in and you're watching together."
              : "Create a fresh crew and share the code with your people."}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-2xl border border-white/8 bg-black/25 p-1.5">
          {(["join", "create"] as const).map((m) => {
            const Icon = m === "join" ? UserPlus : Plus;
            const isActive = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "border border-white/10 bg-white/10 text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                    : "border border-transparent text-white/40 hover:text-white/60"
                }`}
                type="button"
              >
                <Icon className="h-4 w-4" strokeWidth={isActive ? 2.2 : 1.6} />
                {m === "join" ? "Join Crew" : "Create Crew"}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "join" ? (
            <div>
              <label className="meta mb-2 block">Crew Code</label>
              <input
                className="keta-input font-mono uppercase tracking-[0.2em]"
                placeholder="ABCD1"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                autoComplete="off"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.03] p-4">
              <Sparkles className="h-5 w-5 shrink-0 text-[var(--accent)]/60" />
              <p className="text-sm leading-6 text-white/60">
                A fresh crew code is generated automatically, ready to copy and
                share.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            className="btn-primary mt-1 w-full"
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : mode === "join"
                ? "Join Crew"
                : "Create Crew"}
          </button>
        </form>

        {profile && (
          <p className="mt-4 text-center text-sm text-white/30">
            Joining as{" "}
            <span className="text-white/50">
              {profile.display_name || profile.username}
            </span>
          </p>
        )}
      </div>

      {/* Existing crews */}
      {crews.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
              Your Ketacrews
            </h2>
            <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-white/35">
              {crews.length}
            </span>
          </div>
          <div ref={crewListRef} className="flex flex-col gap-2">
            {crews.map((crew) => (
              <div key={crew.code} className="crew-card-item opacity-0">
                <CrewCard crew={crew} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
