"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Mail, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Field } from "@/components/ui/field";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { DisclaimerCard } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth/auth-context";

type Step = "email" | "code";

export default function GirisPage() {
  const router = useRouter();
  const { requestEmailCode, verifyEmailCode, isConfigured } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRequestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await requestEmailCode(email.trim());
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setStep("code");
  }

  async function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await verifyEmailCode(email.trim(), code.trim());
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
        {step === "email" ? (
          <form onSubmit={handleRequestCode} className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              E-posta adresinize 6 haneli bir doğrulama kodu göndereceğiz. Şifre gerekmez.
            </p>
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
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <PrimaryButton type="submit" disabled={isSubmitting || !email.trim()}>
              <Mail aria-hidden="true" className="h-4 w-4" />
              {isSubmitting ? "Gönderiliyor..." : "Kod gönder"}
            </PrimaryButton>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{email}</strong> adresine gönderilen 6 haneli kodu girin.
            </p>
            <Field
              id="giris-code"
              label="Doğrulama kodu"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="000000"
            />
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <PrimaryButton type="submit" disabled={isSubmitting || code.trim().length < 6}>
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
              {isSubmitting ? "Doğrulanıyor..." : "Giriş yap"}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => setStep("email")}>
              Farklı e-posta kullan
            </SecondaryButton>
          </form>
        )}
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
