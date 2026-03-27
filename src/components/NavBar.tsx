"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Compass, Users, User, Settings } from "lucide-react";
import type { LucideProps } from "lucide-react";

/** Tiny horse head icon matching the Ketaflix brand logo */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function HorseIcon({ className, strokeWidth, ...props }: LucideProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path d="M52 60 C58 45 56 25 50 12 L46 4 L40 14 L34 6 L30 18 C20 15 15 22 12 30 C8 35 8 43 14 47 C24 51 34 46 38 36 C42 48 40 55 36 60 Z" />
    </svg>
  );
}

const NAV_ITEMS = [
  {
    href: "/",
    icon: HorseIcon,
    label: "Feed",
    match: (p: string) => p === "/",
  },
  {
    href: "/discover",
    icon: Compass,
    label: "Discover",
    match: (p: string) => p.startsWith("/discover"),
  },
  {
    href: "/rooms",
    icon: Users,
    label: "Ketacrew",
    match: (p: string) => p.startsWith("/room"),
  },
  {
    href: "__profile__",
    icon: User,
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
