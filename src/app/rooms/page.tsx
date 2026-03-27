"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getOrCreateCrew, getUserCrews, joinCrew } from "@/lib/db";
import CrewCard from "@/components/CrewCard";
import type { Room } from "@/types";
import { setSession } from "@/lib/supabase";
import { generateCrewCode } from "@/lib/utils";

export default function RoomsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"join" | "create">("join");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [crews, setCrews] = useState<Room[]>([]);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
    if (user) {
      getUserCrews(user.id).then(setCrews);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    let mounted = true;
    import("animejs").then(({ animate }) => {
      if (!mounted || !cardRef.current) return;
      animate(cardRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: "easeOutExpo",
      });
    });
    return () => {
      mounted = false;
    };
  }, [authLoading]);

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
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <section ref={cardRef} className="surface-card p-6 opacity-0 sm:p-8">
        <div className="mb-8 text-center">
          <p className="eyebrow mb-2">Ketacrew</p>
          <h1 className="text-3xl font-bold tracking-tight">
            {mode === "join" ? "Join a Ketacrew" : "Create a Ketacrew"}
          </h1>
          <p className="mt-2 text-sm text-white/50">
            {mode === "join"
              ? "Enter a crew code to join."
              : "Start a new Ketacrew."}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 rounded-full border border-white/10 bg-white/5 p-1.5">
          {(["join", "create"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`tab-btn ${mode === m ? "active" : ""}`}
              type="button"
            >
              {m === "join" ? "Join Crew" : "Create Crew"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "join" ? (
            <div>
              <label className="meta mb-2 block">Crew Code</label>
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
              A fresh crew code is generated automatically, ready to copy and
              share.
            </div>
          )}

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            className="btn-primary mt-2 w-full"
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
          <p className="mt-5 text-center text-sm text-white/35">
            Joining as {profile.display_name || profile.username}
          </p>
        )}
      </section>

      {/* Existing crews */}
      {crews.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/40">
            Your Ketacrews
          </h2>
          <div className="flex flex-col gap-2">
            {crews.map((crew) => (
              <CrewCard key={crew.code} crew={crew} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
