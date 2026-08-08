import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig, getSupabaseServiceRoleKey } from "./config";

export function getSupabaseServiceClient(): SupabaseClient | null {
  const config = getSupabasePublicConfig();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!config || !serviceRoleKey) {
    return null;
  }

  return createClient(config.url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
