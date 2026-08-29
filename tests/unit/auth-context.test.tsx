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
 * Loads auth-context fresh (after vi.doMock is set up) and runs signUp/signIn
 * through a real AuthProvider + useAuth pair — the goal is verifying what
 * AuthProvider hands back to a caller, not UI rendering.
 */
async function captureAuthResult(action: "signUp" | "signIn"): Promise<AuthResult> {
  const { AuthProvider, useAuth } = await import("@/lib/auth/auth-context");
  let captured: AuthResult | null = null;

  function Probe() {
    const auth = useAuth();
    return (
      <button
        type="button"
        onClick={async () => {
          captured =
            action === "signUp"
              ? await auth.signUp("test@example.com", "password123", "Test", "User")
              : await auth.signIn("test@example.com", "password123");
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

  if (!captured) throw new Error("auth call never resolved");
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

    expect(await captureAuthResult("signUp")).toEqual({ ok: true, requiresEmailConfirmation: true });
  });

  it("reports requiresEmailConfirmation=false when Supabase returns an active session immediately", async () => {
    mockSupabaseClient();
    signUp.mockResolvedValue({ data: { user: { id: "u1" }, session: { access_token: "t" } }, error: null });

    expect(await captureAuthResult("signUp")).toEqual({ ok: true, requiresEmailConfirmation: false });
  });

  it("maps the over_email_send_rate_limit code (full quota) to a clear Turkish message", async () => {
    mockSupabaseClient();
    signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "email rate limit exceeded", code: "over_email_send_rate_limit" },
    });

    expect(await captureAuthResult("signUp")).toEqual({
      ok: false,
      message: "Az önce bir doğrulama e-postası istediniz. Birkaç dakika bekleyip tekrar deneyin.",
    });
  });

  /**
   * Confirmed against real production auth logs: Supabase's per-request
   * resend cooldown returns this exact message under the SAME error code as
   * the full-quota case above, but the message text does NOT contain the
   * substring "rate limit" — a fragile message-substring matcher would miss
   * it and fall through to the generic fallback. This is what an actual
   * reviewer-timed log entry showed happening in production.
   */
  it("maps the over_email_send_rate_limit code (per-request cooldown) even though its message lacks the word 'rate limit'", async () => {
    mockSupabaseClient();
    signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: {
        message: "For security purposes, you can only request this after 23 seconds.",
        code: "over_email_send_rate_limit",
      },
    });

    expect(await captureAuthResult("signUp")).toEqual({
      ok: false,
      message: "Az önce bir doğrulama e-postası istediniz. Birkaç dakika bekleyip tekrar deneyin.",
    });
  });

  /**
   * Confirmed against production: signing up with an email that already has
   * a CONFIRMED account returns error:null, session:null, and an empty
   * identities array (Supabase's anti-enumeration behavior — it never sends
   * an email or errors). Without checking identities, the caller would show
   * "check your e-mail" for an email that will never receive one.
   */
  it("treats an empty identities array (confirmed-duplicate) as an error, not a pending confirmation", async () => {
    mockSupabaseClient();
    signUp.mockResolvedValue({
      data: {
        user: { id: "existing-user", identities: [] },
        session: null,
      },
      error: null,
    });

    expect(await captureAuthResult("signUp")).toEqual({
      ok: false,
      message: "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin.",
    });
  });

  it("falls back to message-substring matching when the SDK doesn't populate error.code", async () => {
    mockSupabaseClient();
    signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "email rate limit exceeded" },
    });

    expect(await captureAuthResult("signUp")).toEqual({
      ok: false,
      message: "Çok fazla deneme yapıldı. Birazdan tekrar deneyin.",
    });
  });
});

describe("AuthProvider.signIn — email_not_confirmed", () => {
  afterEach(() => {
    cleanup();
    vi.doUnmock("@/lib/supabase/client");
    vi.resetModules();
  });

  /**
   * Confirmed against real production auth logs: a reviewer-timed sign-in
   * attempt right after signup (before clicking the confirmation link) hit
   * exactly this error. Previously unmapped — fell through to the generic
   * "Bir şeyler ters gitti" message, indistinguishable from a real failure.
   */
  it("maps email_not_confirmed to a clear, actionable Turkish message", async () => {
    mockSupabaseClient();
    signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: { message: "Email not confirmed", code: "email_not_confirmed" },
    });

    expect(await captureAuthResult("signIn")).toEqual({
      ok: false,
      message:
        "E-posta adresinizi henüz onaylamadınız. Gelen kutunuzdaki onay bağlantısına tıklayıp tekrar giriş yapın.",
    });
  });
});
