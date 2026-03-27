"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { updateProfile } from "@/lib/db";
import { signOut } from "@/lib/auth";
import { clearSession } from "@/lib/supabase";
import { LogOut } from "lucide-react";

const EMOJI_OPTIONS = [
  "🎬",
  "🍿",
  "🎥",
  "🎞️",
  "📽️",
  "🎭",
  "🌙",
  "⭐",
  "🔥",
  "💎",
  "👻",
  "🤖",
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile, loading, refresh } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [emoji, setEmoji] = useState("🎬");
  const [discoverable, setDiscoverable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setEmoji(profile.avatar_emoji || "🎬");
      setDiscoverable(profile.is_discoverable);
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    let mounted = true;
    import("animejs").then(({ animate }) => {
      if (!mounted || !cardRef.current) return;
      animate(cardRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: "easeOutExpo",
      });
    });
    return () => {
      mounted = false;
    };
  }, [loading]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveError("");
    try {
      await updateProfile(user.id, {
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        avatar_emoji: emoji,
        is_discoverable: discoverable,
      });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError("Failed to save. Check your connection and try again.");
    }
    setSaving(false);
  }

  async function handleSignOut() {
    clearSession();
    await signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="text-sm text-white/40">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-lg px-4 pb-24 pt-6 sm:px-6">
      <section
        ref={cardRef}
        className="relative overflow-hidden rounded-[28px] border border-white/8 p-6 opacity-0 sm:p-8"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(0,192,48,0.08), transparent 50%), linear-gradient(135deg, rgba(14,17,22,0.96), rgba(20,24,28,0.92))",
        }}
      >
        <div className="mb-8">
          <p className="eyebrow mb-2">Settings</p>
          <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
          {profile && (
            <p className="mt-1 text-sm text-white/50">@{profile.username}</p>
          )}
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {/* Avatar Emoji */}
          <div>
            <label className="meta mb-3 block">Avatar</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl transition-all ${
                    emoji === e
                      ? "scale-110 border-2 border-[var(--accent)] bg-[var(--accent-soft)] shadow-[0_0_12px_rgba(0,192,48,0.2)]"
                      : "border border-white/6 bg-white/[0.04] hover:border-white/12 hover:bg-white/8"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="meta mb-2 block">Display Name</label>
            <input
              className="keta-input"
              placeholder="Your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={30}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="meta mb-2 block">Bio</label>
            <textarea
              className="keta-input min-h-[100px] resize-none leading-relaxed"
              placeholder="A little about you and your taste in films..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
            />
            <p className="mt-1.5 text-right text-xs text-white/30">
              {bio.length}/160
            </p>
          </div>

          {/* Discoverable */}
          <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.03] p-4">
            <div>
              <p className="text-sm font-medium">Discoverable</p>
              <p className="mt-0.5 text-xs text-white/45">
                Show up in search results
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDiscoverable(!discoverable)}
              className={`h-7 w-12 rounded-full transition-colors ${
                discoverable ? "bg-[var(--accent)]" : "bg-white/15"
              }`}
            >
              <div
                className={`ml-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  discoverable ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {saveError && <p className="text-sm text-red-300">{saveError}</p>}

          <button
            type="submit"
            className="btn-primary mt-1 w-full"
            disabled={saving}
          >
            {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div className="mt-8 border-t border-white/6 pt-6">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3 text-sm text-white/35 transition-all hover:border-red-500/15 hover:text-red-300/60"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.6} />
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}
