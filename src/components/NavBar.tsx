"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Home, Compass, Users, User, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "Feed", match: (p: string) => p === "/" },
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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/8 backdrop-blur-xl"
      style={{
        background: "rgba(8,9,12,0.85)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2">
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
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                active
                  ? "text-[var(--accent)]"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
