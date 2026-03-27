import { createClient } from "./supabase";
import type { Profile } from "@/types";

const EMAIL_DOMAIN = "ketaflix.app";

/** Convert username to synthetic email for Supabase Auth */
function toEmail(username: string): string {
  return `${username.toLowerCase().trim()}@${EMAIL_DOMAIN}`;
}

/** Sign up a new user with username + password */
export async function signUp(
  username: string,
  password: string,
  displayName?: string,
) {
  const supabase = createClient();
  const trimmed = username.trim();

  // Check if username is taken
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", trimmed)
    .single();

  if (existing) {
    return { error: { message: "Username already taken" } };
  }

  const { data, error } = await supabase.auth.signUp({
    email: toEmail(trimmed),
    password,
    options: {
      data: {
        username: trimmed,
        display_name: displayName || trimmed,
      },
    },
  });

  if (error) {
    // Make error messages user-friendly
    if (error.message.includes("already registered")) {
      return { error: { message: "Username already taken" } };
    }
    return { error: { message: error.message } };
  }

  return { data, error: null };
}

/** Sign in with username + password */
export async function signIn(username: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: toEmail(username.trim()),
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: { message: "Wrong username or password" } };
    }
    return { error: { message: error.message } };
  }

  return { data, error: null };
}

/** Sign in with Google OAuth */
export async function signInWithGoogle() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) return { error: { message: error.message } };
  return { data, error: null };
}

/** Sign out the current user */
export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

/** Get the current authenticated user's profile */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

/** Get the current auth user (lighter than full profile) */
export async function getAuthUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
