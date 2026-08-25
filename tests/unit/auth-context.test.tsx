import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthResult } from "@/lib/auth/auth-context";

const signUp = vi.fn();
const signInWithPassword = vi.fn();
const getSession = vi.fn();
const onAuthStateChange = vi.fn();

function mockSupabaseClient() {
  getSession.mockResolvedValue({ data: { session: null } });
  onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  vi.doMock("@/lib/supabase/client", () => ({
    getSupabaseBrowserClient: () => ({
      auth: { signUp, signInWithPassword, getSession, onAuthStateChange },
    }),
  }));
}

/**
 * Loads auth-context fresh (after vi.doMock is set up) and runs signUp
 * through a real AuthProvider + useAuth pair — the goal is verifying what
 * AuthProvider hands back to a caller, not UI rendering.
 */
async function captureSignUpResult(): Promise<AuthResult> {
  const { AuthProvider, useAuth } = await import("@/lib/auth/auth-context");
  let captured: AuthResult | null = null;

  function Probe() {
    const auth = useAuth();
    return (
      <button
        type="button"
        onClick={async () => {
          captured = await auth.signUp("test@example.com", "password123", "Test", "User");
        }}
      >
        trigger
      </button>
    );
  }

  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );

  await act(async () => {
    screen.getByText("trigger").click();
  });

  if (!captured) throw new Error("signUp never resolved");
  return captured;
}

describe("AuthProvider.signUp — email confirmation reporting", () => {
  afterEach(() => {
    cleanup();
    vi.doUnmock("@/lib/supabase/client");
    vi.resetModules();
  });

  it("reports requiresEmailConfirmation=true when Supabase returns no session (pending confirmation)", async () => {
    mockSupabaseClient();
    signUp.mockResolvedValue({ data: { user: { id: "u1" }, session: null }, error: null });

    expect(await captureSignUpResult()).toEqual({ ok: true, requiresEmailConfirmation: true });
  });

  it("reports requiresEmailConfirmation=false when Supabase returns an active session immediately", async () => {
    mockSupabaseClient();
    signUp.mockResolvedValue({ data: { user: { id: "u1" }, session: { access_token: "t" } }, error: null });

    expect(await captureSignUpResult()).toEqual({ ok: true, requiresEmailConfirmation: false });
  });

  it("maps Supabase's rate-limit error to a clear Turkish message instead of a generic fallback", async () => {
    mockSupabaseClient();
    signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "email rate limit exceeded" },
    });

    expect(await captureSignUpResult()).toEqual({
      ok: false,
      message: "Çok fazla deneme yapıldı. Birazdan tekrar deneyin.",
    });
  });
});
