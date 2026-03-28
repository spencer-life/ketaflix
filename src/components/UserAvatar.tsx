import {
  Cat,
  Ghost,
  Flame,
  Moon,
  Crown,
  Diamond,
  Heart,
  Zap,
  Skull,
  Flower2,
  Sparkles,
  Eye,
  type LucideIcon,
} from "lucide-react";

interface AvatarDef {
  id: string;
  icon: LucideIcon;
  color: string;
}

export const AVATAR_OPTIONS: AvatarDef[] = [
  { id: "cat", icon: Cat, color: "#c084fc" },
  { id: "ghost", icon: Ghost, color: "#2dd4bf" },
  { id: "flame", icon: Flame, color: "#fb923c" },
  { id: "moon", icon: Moon, color: "#818cf8" },
  { id: "crown", icon: Crown, color: "#fbbf24" },
  { id: "diamond", icon: Diamond, color: "#22d3ee" },
  { id: "heart", icon: Heart, color: "#fb7185" },
  { id: "zap", icon: Zap, color: "#facc15" },
  { id: "skull", icon: Skull, color: "#94a3b8" },
  { id: "flower", icon: Flower2, color: "#f472b6" },
  { id: "sparkles", icon: Sparkles, color: "#34d399" },
  { id: "eye", icon: Eye, color: "#a78bfa" },
];

const AVATAR_MAP = Object.fromEntries(
  AVATAR_OPTIONS.map((a) => [a.id, a]),
) as Record<string, AvatarDef>;

const SIZE_CLASSES = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-20 w-20",
};

const ICON_SIZES = { sm: 12, md: 18, lg: 22, xl: 36 };
const TEXT_SIZES = {
  sm: "text-xs",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-4xl",
};

interface UserAvatarProps {
  value: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function UserAvatar({
  value,
  size = "md",
  className = "",
}: UserAvatarProps) {
  const mapped = value ? AVATAR_MAP[value] : null;

  if (mapped) {
    const Icon = mapped.icon;
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full ${SIZE_CLASSES[size]} ${className}`}
        style={{ background: `${mapped.color}18` }}
      >
        <Icon size={ICON_SIZES[size]} color={mapped.color} strokeWidth={1.8} />
      </div>
    );
  }

  // Fallback: render as emoji (backward compat with old emoji avatars)
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-white/5 ${SIZE_CLASSES[size]} ${TEXT_SIZES[size]} ${className}`}
    >
      {value || "🎬"}
    </div>
  );
}
