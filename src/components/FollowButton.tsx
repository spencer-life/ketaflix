"use client";

import { useState } from "react";
import { followUser, unfollowUser } from "@/lib/db";
import { useAuth } from "@/lib/auth-context";

interface FollowButtonProps {
  targetId: string;
  initialFollowing: boolean;
  onToggle?: (following: boolean) => void;
}

export default function FollowButton({
  targetId,
  initialFollowing,
  onToggle,
}: FollowButtonProps) {
  const { user } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  // Don't show follow button for own profile or if not logged in
  if (!user || user.id === targetId) return null;

  async function handleToggle() {
    if (!user) return;
    const prev = following;
    setLoading(true);
    setFollowing(!prev);
    onToggle?.(!prev);
    try {
      if (prev) {
        await unfollowUser(user.id, targetId);
      } else {
        await followUser(user.id, targetId);
      }
    } catch {
      setFollowing(prev);
      onToggle?.(prev);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={
        following
          ? "btn-ghost px-4 py-2 text-sm"
          : "btn-primary px-4 py-2 text-sm"
      }
    >
      {loading ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}
