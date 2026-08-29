"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { appConfig } from "@/lib/constants/app";

export type AuthResult = { ok: true; requiresEmailConfirmation: boolean } | { ok: false; message: string };

export type AuthState = {
  /** null while the initial session check is in flight. */
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  /** False only when NEXT_PUBLIC_SUPABASE_URL/ANON_KEY aren't configured (e.g. local dev without .env.local). */
  isConfigured: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

/**
 * Matches on Supabase's stable `error.code` first — confirmed against real
 * production auth logs that a reviewer-like session hit both
 * "email_not_confirmed" (signing in before confirming) and
 * "over_email_send_rate_limit" via its per-request-cooldown variant
 * ("For security purposes, you can only request this after N seconds"),
 * which doesn't contain the substring "rate limit" and previously fell
 * through to the generic fallback below. Message-substring matching is kept
 * only as a fallback for older SDK/server responses that omit `code`.
 */
function toTurkishError(error: AuthError): string {
  switch (error.code) {
    case "user_already_exists":
    case "email_exists":
      return "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin.";
    case "invalid_credentials":
      return "E-posta veya şifre hatalı.";
    case "weak_password":
      return "Şifre en az 6 karakter olmalı.";
    case "email_not_confirmed":
      return "E-posta adresinizi henüz onaylamadınız. Gelen kutunuzdaki onay bağlantısına tıklayıp tekrar giriş yapın.";
    case "over_email_send_rate_limit":
      return "Az önce bir doğrulama e-postası istediniz. Birkaç dakika bekleyip tekrar deneyin.";
    case "over_request_rate_limit":
      return "Çok fazla deneme yapıldı. Birazdan tekrar deneyin.";
    case "email_address_invalid":
      return "Geçerli bir e-posta adresi girin.";
    default:
      break;
  }
  const normalized = error.message.toLowerCase();
  if (normalized.includes("already registered") || normalized.includes("already exists")) {
    return "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin.";
  }
  if (normalized.includes("invalid login credentials") || normalized.includes("invalid email or password")) {
    return "E-posta veya şifre hatalı.";
  }
  if (normalized.includes("password") && normalized.includes("6")) {
    return "Şifre en az 6 karakter olmalı.";
  }
  if (normalized.includes("not confirmed")) {
    return "E-posta adresinizi henüz onaylamadınız. Gelen kutunuzdaki onay bağlantısına tıklayıp tekrar giriş yapın.";
  }
  if (normalized.includes("rate limit") || normalized.includes("security purposes")) {
    return "Çok fazla deneme yapıldı. Birazdan tekrar deneyin.";
  }
  if (normalized.includes("email") && normalized.includes("invalid")) {
    return "Geçerli bir e-posta adresi girin.";
  }
  return "Bir şeyler ters gitti. Lütfen tekrar deneyin.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [isLoading, setIsLoading] = useState(() => Boolean(supabase));
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, [supabase]);

  const value = useMemo<AuthState>(
    () => ({
      isLoading,
      user: session?.user ?? null,
      session,
      isConfigured: Boolean(supabase),
      async signUp(email: string, password: string, firstName: string, lastName: string) {
        if (!supabase) return { ok: false, message: "Hesap sistemi şu anda yapılandırılmamış." };
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { first_name: firstName.trim(), last_name: lastName.trim() },
            emailRedirectTo: `${appConfig.productionUrl}/giris?confirmed=1`,
          },
        });
        if (error) return { ok: false, message: toTurkishError(error) };
        // Anti-email-enumeration behavior: signing up with an email that
        // already has a CONFIRMED account returns a fake success (no error,
        // session:null, no email actually sent) instead of revealing the
        // account exists. Confirmed against production: the only reliable
        // signal is an empty identities array — a real new signup always
        // has at least one. Without this check the caller would show
        // "check your e-mail" for an e-mail that will never receive one.
        if (data.user && data.user.identities?.length === 0) {
          return { ok: false, message: "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin." };
        }
        // Supabase requires e-mail confirmation on this project, so signUp
        // succeeds without ever returning a session — the caller must not
        // treat this the same as an active login (it isn't one yet).
        return { ok: true, requiresEmailConfirmation: !data.session };
      },
      async signIn(email: string, password: string) {
        if (!supabase) return { ok: false, message: "Hesap sistemi şu anda yapılandırılmamış." };
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { ok: false, message: toTurkishError(error) };
        return { ok: true, requiresEmailConfirmation: false };
      },
      async signOut() {
        if (!supabase) return;
        await supabase.auth.signOut();
      },
    }),
    [isLoading, session, supabase],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth, AuthProvider içinde kullanılmalıdır.");
  return context;
}
