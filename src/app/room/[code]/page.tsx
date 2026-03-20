"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getSession, clearSession } from "@/lib/supabase";
import { getRoom } from "@/lib/db";
import WatchlistTab from "@/components/WatchlistTab";
import WatchedTab from "@/components/WatchedTab";
import StatsTab from "@/components/StatsTab";
import type { Room } from "@/types";

type Tab = "watchlist" | "watched" | "stats";

export default function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [session, setSessionState] = useState<{ username: string; roomCode: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("watchlist");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s || s.roomCode !== code) { router.push("/"); return; }
    setSessionState(s);
    getRoom(code).then((r) => {
      if (!r) { router.push("/"); return; }
      setRoom(r);
      setLoading(false);
    });
  }, [code, router]);

  function handleLeave() { clearSession(); router.push("/"); }
  function copyCode() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Loading...</div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "watchlist", label: "Watchlist", emoji: "🎬" },
    { id: "watched", label: "Watched", emoji: "✅" },
    { id: "stats", label: "Stats", emoji: "📊" },
  ];

  return (
    <div className="min-h-dvh flex flex-col max-w-2xl mx-auto">
      <header className="sticky top-0 z-50 px-4 pt-4 pb-3"
        style={{ background: "linear-gradient(to bottom, rgba(10,10,15,0.95) 80%, transparent)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold gradient-text">Ketaflix</h1>
            <button onClick={copyCode} className="text-xs font-mono flex items-center gap-1 transition-colors"
              style={{ color: copied ? "#a78bfa" : "rgba(255,255,255,0.35)" }}>
              <span className="tracking-widest">{code}</span>
              <span>{copied ? "✓ copied" : "· tap to copy"}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm px-3 py-1.5 rounded-lg"
              style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.3)" }}>
              👤 {session?.username}
            </div>
            <button onClick={handleLeave} className="btn-ghost text-xs px-2 py-1.5">Leave</button>
          </div>
        </div>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="tab-btn flex-1"
              style={{ background: activeTab === tab.id ? "rgba(139,92,246,0.2)" : "transparent", color: activeTab === tab.id ? "#a78bfa" : "rgba(255,255,255,0.45)" }}>
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 pb-8">
        {activeTab === "watchlist" && session && <WatchlistTab roomCode={code} username={session.username} />}
        {activeTab === "watched" && session && <WatchedTab roomCode={code} username={session.username} />}
        {activeTab === "stats" && <StatsTab roomCode={code} />}
      </main>
    </div>
  );
}
