import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export function formatRuntime(minutes: number | null): string {
  if (!minutes) return "Unknown";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatYear(dateStr: string | null | undefined): string {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).getFullYear().toString();
}

export function getAverageRating(
  ratings: { username: string; score: number }[]
): number | null {
  if (!ratings.length) return null;
  return ratings.reduce((a, b) => a + b.score, 0) / ratings.length;
}
