"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type AuthState = {
  /** null while the initial session check is in flight. */
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  /** False only when NEXT_PUBLIC_SUPABASE_URL/ANON_KEY aren't configured (e.g. local dev without .env.local). */
  isConfigured: boolean;
  /** Sends a 6-digit e-posta code. Resolves ok:false with a Turkish message on failure. */
  requestEmailCode: (email: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  /** Verifies the 6-digit code and completes sign-in/sign-up. */
  verifyEmailCode: (email: string, code: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

function toTurkishError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("token has expired") || normalized.includes("invalid")) {
    return "Kod geçersiz veya süresi dolmuş. Yeni kod isteyin.";
  }
  if (normalized.includes("rate limit")) {
    return "Çok fazla deneme yapıldı. Birazdan tekrar deneyin.";
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
      async requestEmailCode(email: string) {
        if (!supabase) return { ok: false, message: "Hesap sistemi şu anda yapılandırılmamış." };
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true },
        });
        if (error) return { ok: false, message: toTurkishError(error.message) };
        return { ok: true };
      },
      async verifyEmailCode(email: string, code: string) {
        if (!supabase) return { ok: false, message: "Hesap sistemi şu anda yapılandırılmamış." };
        const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
        if (error) return { ok: false, message: toTurkishError(error.message) };
        return { ok: true };
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
