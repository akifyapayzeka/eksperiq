"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { deleteAllLocalData } from "@/lib/data-management/delete-all";
import { apiFetch } from "@/lib/api/client";

export type DeleteAccountResult =
  { ok: true } | { ok: false; reason: "not-signed-in" | "network-error" | "server-error" };

/**
 * Permanently deletes the Supabase Auth user (email/password + first/last
 * name in user_metadata — the only account data this app stores server-side)
 * via api/account/delete.js, which verifies the caller's own session token
 * server-side before deleting anything — never trusts a client-supplied user
 * id. On success, also wipes this device's local data and signs out, so the
 * user doesn't land back in a half-deleted state. The on-device wipe and
 * sign-out only run after the server confirms deletion — a failed server
 * call must never look like a successful account deletion.
 */
export async function deleteAccount(): Promise<DeleteAccountResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return { ok: false, reason: "not-signed-in" };

  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) return { ok: false, reason: "not-signed-in" };

  let response: Response;
  try {
    response = await apiFetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    });
  } catch {
    return { ok: false, reason: "network-error" };
  }

  if (!response.ok) {
    return { ok: false, reason: "server-error" };
  }

  await deleteAllLocalData().catch(() => undefined);
  await supabase.auth.signOut().catch(() => undefined);

  return { ok: true };
}
