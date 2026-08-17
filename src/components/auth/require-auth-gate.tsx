"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { CarFront, Check, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { EKSPERIQ_PLAN_PRICING, formatTry, type EksperIqPaidPlanId } from "@/lib/pro/pricing";
import { purchasePlan } from "@/lib/pro/entitlement";
import { Field } from "@/components/ui/field";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";

const PLANS_SEEN_KEY_PREFIX = "eksperiq:onboarding-plans-seen:";

type GateStep = "checking" | "signin-email" | "signin-code" | "plans" | "done";

function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="safe-area-shell flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-8">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

export function RequireAuthGate({ children }: { children: ReactNode }) {
  const { isLoading, user, isConfigured, requestEmailCode, verifyEmailCode } = useAuth();
  const [codeRequested, setCodeRequested] = useState(false);
  const [plansDismissed, setPlansDismissed] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);

  // Derived directly at render time (no effect needed): reading localStorage
  // here is a plain read, not a state sync, so it's safe to do inline.
  const hasSeenPlans =
    Boolean(user) &&
    typeof window !== "undefined" &&
    window.localStorage.getItem(`${PLANS_SEEN_KEY_PREFIX}${user?.id}`) === "true";

  let step: GateStep;
  if (!isConfigured) step = "done";
  else if (isLoading) step = "checking";
  else if (!user) step = codeRequested ? "signin-code" : "signin-email";
  else step = hasSeenPlans || plansDismissed ? "done" : "plans";

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
    setCodeRequested(true);
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
    // `user` updates via the auth context once Supabase confirms the
    // session; `step` above re-derives to "plans" on the next render.
  }

  function finishOnboarding() {
    if (user) window.localStorage.setItem(`${PLANS_SEEN_KEY_PREFIX}${user.id}`, "true");
    setPlansDismissed(true);
  }

  async function handlePlanCta(planId: EksperIqPaidPlanId) {
    setPurchaseMessage(null);
    try {
      await purchasePlan(EKSPERIQ_PLAN_PRICING[planId].productId);
    } catch {
      setPurchaseMessage("Satın alma yakında aktif olacak. Şimdilik ücretsiz devam edebilirsiniz.");
    }
  }

  if (step === "checking") {
    return (
      <Screen>
        <p className="text-center text-sm text-muted-foreground">Yükleniyor...</p>
      </Screen>
    );
  }

  if (step === "signin-email" || step === "signin-code") {
    return (
      <Screen>
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <CarFront aria-hidden="true" className="h-10 w-10 text-accent" />
          <h1 className="font-heading text-2xl font-bold text-foreground">EksperIQ&apos;a hoş geldiniz</h1>
          <p className="text-sm text-muted-foreground">
            Devam etmek için hesabınıza giriş yapın. Şifre gerekmez, e-postanıza kod göndeririz.
          </p>
        </div>
        <div className="rounded-theme border border-border bg-card p-5 shadow-sm">
          {step === "signin-email" ? (
            <form onSubmit={handleRequestCode} className="grid gap-4">
              <Field
                id="gate-email"
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
                id="gate-code"
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
              <SecondaryButton type="button" onClick={() => setCodeRequested(false)}>
                Farklı e-posta kullan
              </SecondaryButton>
            </form>
          )}
        </div>
      </Screen>
    );
  }

  if (step === "plans") {
    const plans = Object.values(EKSPERIQ_PLAN_PRICING);
    return (
      <Screen>
        <div className="mb-5 flex flex-col items-center gap-2 text-center">
          <Sparkles aria-hidden="true" className="h-9 w-9 text-accent" />
          <h1 className="font-heading text-2xl font-bold text-foreground">3 gün ücretsiz Pro deneyin</h1>
          <p className="text-sm text-muted-foreground">
            Pro veya Pro+&apos;a geçin, ilk 3 gün en güçlü AI modelleriyle ücretsiz deneyin — istediğiniz an iptal
            edebilirsiniz.
          </p>
        </div>

        <div className="mb-4 flex justify-center gap-1 rounded-full border border-border bg-muted p-1">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Aylık
          </button>
          <button
            type="button"
            onClick={() => setBilling("yearly")}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${billing === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Yıllık (indirimli)
          </button>
        </div>

        <div className="grid gap-3">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-theme border border-border bg-card p-4 shadow-sm">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-heading font-bold text-foreground">{plan.name}</h2>
                <p className="text-lg font-bold text-foreground">
                  {formatTry(billing === "monthly" ? plan.monthlyPriceTry : plan.yearlyPriceTry)}
                  <span className="text-xs font-medium text-muted-foreground">
                    {billing === "monthly" ? "/ay" : "/yıl"}
                  </span>
                </p>
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm text-foreground/90">
                <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-success" />
                Ayda {plan.includedAiPhotoAnalyses} AI fotoğraf/rapor analizi dahil
              </p>
              <button
                type="button"
                onClick={() => handlePlanCta(plan.id)}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-primary-foreground"
              >
                3 gün ücretsiz dene
              </button>
            </div>
          ))}
        </div>

        {purchaseMessage ? <p className="mt-3 text-center text-sm text-foreground">{purchaseMessage}</p> : null}

        <button
          type="button"
          onClick={finishOnboarding}
          className="mt-5 w-full text-center text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
        >
          Şimdilik ücretsiz devam et
        </button>
      </Screen>
    );
  }

  return <>{children}</>;
}
