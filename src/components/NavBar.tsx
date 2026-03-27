"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function NavBar() {
  const { user, profile, loading } = useAuth();
  const pathname = usePathname();

  // Don't show nav on landing/auth pages when not logged in
  if (!user || loading) return null;

  // Don't show on login/register pages
  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/5 backdrop-blur"
      style={{ background: "rgba(20,24,28,0.84)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Ketaflix
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className={`btn-ghost px-3 py-1.5 text-xs ${pathname === "/" ? "border-white/12 bg-white/6" : ""}`}
          >
            Feed
          </Link>
          <Link
            href="/discover"
            className={`btn-ghost px-3 py-1.5 text-xs ${pathname.startsWith("/discover") ? "border-white/12 bg-white/6" : ""}`}
          >
            Discover
          </Link>
          <Link
            href="/rooms"
            className={`btn-ghost px-3 py-1.5 text-xs ${pathname.startsWith("/room") ? "border-white/12 bg-white/6" : ""}`}
          >
            Rooms
          </Link>
          <Link
            href={`/profile/${profile?.username}`}
            className={`btn-ghost px-3 py-1.5 text-xs ${pathname.startsWith("/profile") ? "border-white/12 bg-white/6" : ""}`}
          >
            Profile
          </Link>
          <Link
            href="/settings"
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              pathname === "/settings"
                ? "bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]/30"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <span className="text-sm">{profile?.avatar_emoji || "🎬"}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
