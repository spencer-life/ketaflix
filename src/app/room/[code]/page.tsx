"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getSession, clearSession } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { getCrew } from "@/lib/db";
import DashboardTab from "@/components/DashboardTab";
import KetaqueueTab from "@/components/KetaqueueTab";
import WatchedTab from "@/components/WatchedTab";
import StatsTab from "@/components/StatsTab";
import type { Room } from "@/types";

type Tab = "dashboard" | "ketaqueue" | "watched" | "stats";

export default function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [session, setSessionState] = useState<{
    username: string;
    roomCode: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const s = getSession();
    if (!s || s.roomCode !== code) {
      router.push("/");
      return;
    }
    setSessionState(s);
    getCrew(code).then((r) => {
      if (!r) {
        router.push("/");
        return;
      }
      setRoom(r);
      setLoading(false);
    });
  }, [code, router]);

  useEffect(() => {
    const content = contentRef.current;
    if (loading || !content) return;

    import("animejs").then(({ animate }) => {
      animate(content, {
        opacity: [0, 1],
        translateY: [18, 0],
        duration: 520,
        easing: "easeOutExpo",
      });
    });
  }, [activeTab, loading]);

  function handleLeave() {
    clearSession();
    router.push("/");
  }

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Loading...
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "ketaqueue", label: "Ketaqueue" },
    { id: "watched", label: "Ketalogs" },
    { id: "stats", label: "Stats" },
  ];

  // Pass profileId to child components when authenticated
  const profileId = user?.id;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-10 sm:px-6 lg:px-8">
      <header
        className="sticky top-0 z-40 -mx-4 mb-6 border-b border-white/5 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        style={{ background: "rgba(20,24,28,0.84)" }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Ketacrew</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Ketaflix
              </h1>
              <button
                onClick={copyCode}
                className="mt-2 flex items-center gap-2 text-left font-mono text-sm text-white/50 transition-colors hover:text-white/75"
              >
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 tracking-[0.3em]">
                  {code}
                </span>
                <span>{copied ? "Copied" : "Tap to copy crew code"}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="info-chip">{session?.username}</span>
              {room?.name ? (
                <span className="info-chip">{room.name}</span>
              ) : null}
              <button
                onClick={handleLeave}
                className="btn-ghost px-4 py-3 text-sm"
              >
                Leave Crew
              </button>
            </div>
          </div>

          <div className="surface-soft inline-flex w-full gap-2 overflow-x-auto p-1.5 sm:w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn min-w-fit flex-1 sm:flex-none ${activeTab === tab.id ? "active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main ref={contentRef} className="flex-1 opacity-0">
        {activeTab === "dashboard" && session && room && (
          <DashboardTab
            room={room}
            roomCode={code}
            username={session.username}
          />
        )}
        {activeTab === "ketaqueue" && session && (
          <KetaqueueTab
            roomCode={code}
            username={session.username}
            profileId={profileId}
          />
        )}
        {activeTab === "watched" && session && <WatchedTab roomCode={code} />}
        {activeTab === "stats" && <StatsTab roomCode={code} />}
      </main>
    </div>
  );
}
