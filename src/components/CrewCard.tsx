"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getCrewMemberCount } from "@/lib/db";
import { setSession } from "@/lib/supabase";
import type { Room } from "@/types";
import { UsersRound, ChevronRight } from "lucide-react";

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
        <UsersRound
          className="h-5 w-5 text-[var(--accent)]"
          strokeWidth={1.8}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {crew.name || `${crew.created_by}'s Crew`}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-white/55">
          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-white/50">
            {crew.code}
          </span>
          {memberCount !== null && (
            <>
              <span className="text-white/15">·</span>
              <span>
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
            </>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-white/35 transition-transform group-hover:translate-x-0.5 group-hover:text-white/55" />
    </button>
  );
}
