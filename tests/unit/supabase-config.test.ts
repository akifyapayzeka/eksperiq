import { afterEach, describe, expect, it } from "vitest";

import { getSupabasePublicConfig, getSupabaseServiceRoleKey, isSupabaseConfigured } from "@/lib/supabase/config";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("Supabase config", () => {
  it("is disabled when public env is missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(getSupabasePublicConfig()).toBeNull();
    expect(isSupabaseConfigured()).toBe(false);
  });

  it("returns public config when both client env values exist", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    expect(getSupabasePublicConfig()).toEqual({
      url: "https://example.supabase.co",
      anonKey: "anon-key",
    });
    expect(isSupabaseConfigured()).toBe(true);
  });

  it("keeps service role access separate from public config", () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(getSupabaseServiceRoleKey()).toBeNull();

    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
    expect(getSupabaseServiceRoleKey()).toBe("service-role");
  });
});
