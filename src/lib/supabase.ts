import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";

// Browser client — used in client components
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Default export for backward compatibility with existing db.ts calls
export const supabase = createClient();

// ─── Legacy Session Helpers (room-based, localStorage) ─────────────────────
// Kept for room functionality — rooms still use room_code sessions
export const SESSION_KEY = "ketamovies_session";

export interface KetaSession {
  username: string;
  roomCode: string;
}

export function getSession(): KetaSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(session: KetaSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}
