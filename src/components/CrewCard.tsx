"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getCrewMemberCount } from "@/lib/db";
import { setSession } from "@/lib/supabase";
import type { Room } from "@/types";

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
      className="surface-soft flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-white/8"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-lg">
        🎬
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {crew.name || `${crew.created_by}'s Crew`}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-white/45">
          <span className="font-mono tracking-wider">{crew.code}</span>
          {memberCount !== null && (
            <>
              <span className="text-white/20">·</span>
              <span>
                {memberCount} {memberCount === 1 ? "member" : "members"}
              </span>
            </>
          )}
        </p>
      </div>
      <span className="shrink-0 text-xs text-white/30">Enter →</span>
    </button>
  );
}
