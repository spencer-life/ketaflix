"use client";

import Link from "next/link";
import type { Profile } from "@/types";
import FollowButton from "./FollowButton";
import UserAvatar from "./UserAvatar";

interface ProfileCardProps {
  profile: Profile;
  isFollowing?: boolean;
  showFollowButton?: boolean;
  followerCount?: number;
  followingCount?: number;
}

export default function ProfileCard({
  profile,
  isFollowing: initialFollowing = false,
  showFollowButton = true,
  followerCount,
  followingCount,
}: ProfileCardProps) {
  return (
    <div className="surface-card flex items-center gap-4 p-4">
      <Link href={`/profile/${profile.username}`}>
        <UserAvatar value={profile.avatar_emoji} size="lg" />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/profile/${profile.username}`}
          className="block truncate font-medium transition-colors hover:text-[var(--accent)]"
        >
          {profile.display_name || profile.username}
        </Link>
        <p className="text-sm text-white/50">@{profile.username}</p>
        {(followerCount !== undefined || followingCount !== undefined) && (
          <p className="mt-1 text-xs text-white/35">
            {followerCount !== undefined && (
              <span>
                <strong className="text-white/60">{followerCount}</strong>{" "}
                followers
              </span>
            )}
            {followerCount !== undefined && followingCount !== undefined && (
              <span className="mx-1.5">·</span>
            )}
            {followingCount !== undefined && (
              <span>
                <strong className="text-white/60">{followingCount}</strong>{" "}
                following
              </span>
            )}
          </p>
        )}
      </div>

      {showFollowButton && (
        <FollowButton
          targetId={profile.id}
          initialFollowing={initialFollowing}
        />
      )}
    </div>
  );
}
