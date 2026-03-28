"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getCrewMemberCount } from "@/lib/db";
import { setSession } from "@/lib/supabase";
import type { Room } from "@/types";
import { Sofa, ChevronRight, UserPlus } from "lucide-react";

export default function CrewCard({ crew }: { crew: Room }) {
  const router = useRouter();
  const { profile } = useAuth();
  const [memberCount, setMemberCount] = useState<number | null>(null);

  useEffect(() => {
    getCrewMemberCount(crew.code).then(setMemberCount);
  }, [crew.code]);

  function handleEnter() {
    if (!profile) return;
    const username = profile.display_name || profile.username;
    setSession({ username, roomCode: crew.code });
    router.push(`/room/${crew.code}`);
  }

  return (
    <button
      onClick={handleEnter}
      className="group surface-card flex w-full items-center gap-4 p-4 text-left transition-all hover:border-white/12 hover:bg-white/[0.04]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] transition-transform group-hover:scale-105">
        <Sofa className="h-5 w-5 text-[var(--accent)]" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {crew.name || `${crew.created_by}'s Crew`}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-white/55">
          {memberCount !== null && (
            <span>
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </span>
          )}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const url = `${window.location.origin}/join/${crew.code}`;
          if (navigator.share) {
            navigator.share({
              title: `Join ${crew.name || "Ketacrew"}`,
              url,
            });
          } else {
            navigator.clipboard.writeText(url);
          }
        }}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--accent)]/15 bg-[var(--accent-soft)] px-2.5 text-xs font-medium text-[var(--accent)] transition-all hover:border-[var(--accent)]/25"
        title="Invite to crew"
      >
        <UserPlus className="h-3.5 w-3.5" />
        Invite
      </button>
      <ChevronRight className="h-4 w-4 shrink-0 text-white/35 transition-transform group-hover:translate-x-0.5 group-hover:text-white/55" />
    </button>
  );
}
