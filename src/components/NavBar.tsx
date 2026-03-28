"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Clapperboard,
  Telescope,
  Sofa,
  UserRound,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/",
    icon: Clapperboard,
    label: "Feed",
    match: (p: string) => p === "/",
  },
  {
    href: "/discover",
    icon: Telescope,
    label: "Discover",
    match: (p: string) => p.startsWith("/discover"),
  },
  {
    href: "/rooms",
    icon: Sofa,
    label: "Ketacrew",
    match: (p: string) => p.startsWith("/room"),
  },
  {
    href: "__profile__",
    icon: UserRound,
    label: "Profile",
    match: (p: string) => p.startsWith("/profile"),
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Settings",
    match: (p: string) => p === "/settings",
  },
];

export default function NavBar() {
  const { user, profile, loading } = useAuth();
  const pathname = usePathname();

  if (!user || loading) return null;
  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "#050608",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-6 pb-1">
        {NAV_ITEMS.map((item) => {
          const href =
            item.href === "__profile__"
              ? `/profile/${profile?.username}`
              : item.href;
          const active = item.match(pathname);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium tracking-wide transition-colors ${
                active
                  ? "text-[var(--accent)]"
                  : "text-white/60 hover:text-white/60"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
