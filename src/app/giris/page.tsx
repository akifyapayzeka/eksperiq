"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Field } from "@/components/ui/field";
import { PrimaryButton } from "@/components/ui/button";
import { DisclaimerCard } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth/auth-context";

type AuthMode = "signup" | "signin";

export default function GirisPage() {
  const router = useRouter();
  const { signUp, signIn, isConfigured } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result =
      mode === "signup" ? await signUp(email.trim(), password) : await signIn(email.trim(), password);
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push("/profil");
  }

  if (!isConfigured) {
    return (
      <AppShell>
        <PageHeader eyebrow="Giriş" title="Hesap" />
        <DisclaimerCard>
          Hesap sistemi bu ortamda henüz yapılandırılmamış. Lütfen daha sonra tekrar deneyin.
        </DisclaimerCard>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader eyebrow="Giriş yap veya hesap oluştur" title="Hesabınız" />

      <div className="rounded-theme border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex justify-center gap-1 rounded-full border border-border bg-muted p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Üye ol
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${mode === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Giriş yap
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field
            id="giris-email"
            label="E-posta"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ornek@eposta.com"
          />
          <Field
            id="giris-password"
            label="Şifre"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="En az 6 karakter"
          />
          {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
          <PrimaryButton type="submit" disabled={isSubmitting || !email.trim() || password.length < 6}>
            {mode === "signup" ? (
              <UserPlus aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Mail aria-hidden="true" className="h-4 w-4" />
            )}
            {isSubmitting ? "Bekleyin..." : mode === "signup" ? "Üye ol" : "Giriş yap"}
          </PrimaryButton>
        </form>
      </div>

      <div className="mt-4">
        <DisclaimerCard>
          Hesabınız yalnızca Pro/Pro+ abonelik ve girişinizi yönetmek için kullanılır. Araç ve analiz kayıtlarınız bu
          cihazda saklanmaya devam eder.
        </DisclaimerCard>
      </div>
    </AppShell>
  );
}
