"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getCrew, getOrCreateCrew, joinCrew } from "@/lib/db";
import { setSession } from "@/lib/supabase";
import KetaflixLogo from "@/components/KetaflixLogo";

type Status = "loading" | "joining" | "no-crew" | "error";

export default function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (loading) return;

    if (!user || !profile) {
      router.push(`/login?redirect=/join/${code}`);
      return;
    }

    async function autoJoin() {
      setStatus("joining");
      const crew = await getCrew(code);
      if (!crew) {
        setStatus("no-crew");
        return;
      }
      const username = profile!.display_name || profile!.username;
      try {
        await getOrCreateCrew(code, username);
        await joinCrew(username, code, user!.id);
        setSession({ username, roomCode: code });
        router.push(`/room/${code}`);
      } catch {
        setStatus("error");
      }
    }

    autoJoin();
  }, [loading, user, profile, code, router]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4">
      <KetaflixLogo size={120} iconOnly className="mb-6" />

      {status === "loading" || status === "joining" ? (
        <div className="text-center">
          <p className="text-lg font-semibold">
            {status === "joining" ? "Joining crew..." : "Loading..."}
          </p>
          <p className="mt-2 text-sm text-white/50">Hang tight</p>
        </div>
      ) : status === "no-crew" ? (
        <div className="surface-card max-w-sm p-6 text-center">
          <p className="text-lg font-semibold">Crew not found</p>
          <p className="mt-2 text-sm text-white/50">
            This invite link doesn&apos;t match any Ketacrew. Ask for a fresh
            link and try again.
          </p>
          <button
            onClick={() => router.push("/rooms")}
            className="btn-primary mt-5 w-full"
          >
            Go to Ketacrews
          </button>
        </div>
      ) : (
        <div className="surface-card max-w-sm p-6 text-center">
          <p className="text-lg font-semibold">Something went wrong</p>
          <p className="mt-2 text-sm text-white/50">
            Couldn&apos;t join the crew. Ask for a new invite link and try
            again.
          </p>
          <button
            onClick={() => router.push("/rooms")}
            className="btn-primary mt-5 w-full"
          >
            Go to Ketacrews
          </button>
        </div>
      )}
    </main>
  );
}
