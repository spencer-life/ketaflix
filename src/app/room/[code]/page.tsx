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
import {
  LayoutDashboard,
  ListVideo,
  BookOpen,
  BarChart3,
  Copy,
  Check,
  LogOut,
  Users,
} from "lucide-react";

type Tab = "dashboard" | "ketaqueue" | "watched" | "stats";

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "ketaqueue", label: "Ketaqueue", icon: ListVideo },
  { id: "watched", label: "Ketalogs", icon: BookOpen },
  { id: "stats", label: "Stats", icon: BarChart3 },
];

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
  const headerRef = useRef<HTMLElement>(null);

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
    if (loading || !headerRef.current) return;
    import("animejs").then(({ animate }) => {
      if (!headerRef.current) return;
      animate(headerRef.current, {
        opacity: [0, 1],
        translateY: [-12, 0],
        duration: 520,
        easing: "easeOutExpo",
      });
    });
  }, [loading]);

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

  // Pass profileId to child components when authenticated
  const profileId = user?.id;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pb-24 sm:px-6 lg:px-8">
      {/* Premium header */}
      <header
        ref={headerRef}
        className="relative -mx-4 mb-6 overflow-hidden border-b border-white/6 px-4 pb-4 pt-5 opacity-0 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(52,211,153,0.08), transparent 50%), radial-gradient(ellipse at bottom left, rgba(245,158,11,0.05), transparent 40%), linear-gradient(180deg, rgba(14,17,22,0.95) 0%, rgba(8,9,12,0.9) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl">
          {/* Top row: crew info + actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)]">
                <Users
                  className="h-6 w-6 text-[var(--accent)]"
                  strokeWidth={1.8}
                />
              </div>
              <div className="min-w-0">
                <p className="eyebrow">Ketacrew</p>
                <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                  {room?.name || `${room?.created_by}'s Crew`}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={copyCode}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/[0.04] px-2.5 py-1 font-mono text-xs tracking-[0.2em] text-white/50 transition-all hover:border-white/14 hover:text-white/70"
                  >
                    {code}
                    {copied ? (
                      <Check className="h-3 w-3 text-[var(--accent)]" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                  <span className="info-chip text-xs">{session?.username}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLeave}
              title="Leave crew"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/6 bg-white/[0.03] text-white/55 transition-all hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-300/60"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.6} />
            </button>
          </div>

          {/* Tab bar */}
          <div className="mt-5 flex gap-1 overflow-x-auto rounded-2xl border border-white/6 bg-black/20 p-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-3 text-xs font-medium transition-all sm:px-5 ${
                    isActive
                      ? "bg-white/8 text-white shadow-sm"
                      : "text-white/55 hover:text-white/60"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={isActive ? 2 : 1.6} />
                  <span className="text-[10px] sm:text-xs">{tab.label}</span>
                </button>
              );
            })}
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
