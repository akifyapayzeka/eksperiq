"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { CarFront, Check, Lock, Mail, RotateCcw, Sparkles, UserPlus } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { EKSPERIQ_PLAN_PRICING, formatTry, type EksperIqPlanPricing } from "@/lib/pro/pricing";
import { purchasePlan, restorePurchases } from "@/lib/pro/entitlement";
import { acceptAiConsent } from "@/lib/consent/ai-consent";
import { Field } from "@/components/ui/field";
import { PrimaryButton } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const PLANS_SEEN_KEY_PREFIX = "eksperiq:onboarding-plans-seen:";
const PLANS_SEEN_ANONYMOUS_KEY = "eksperiq:onboarding-plans-seen:anonymous";
const AUTH_SKIPPED_KEY = "eksperiq:onboarding-auth-skipped";

type GateStep = "checking" | "signin" | "plans" | "done";
type AuthMode = "signup" | "signin";

function Screen({ children }: { children: ReactNode }) {
  return (
    <div className="safe-area-shell flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-8">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

export function RequireAuthGate({ children }: { children: ReactNode }) {
  const { isLoading, user, isConfigured, signUp, signIn } = useAuth();
  const [authSkipped, setAuthSkipped] = useState(false);
  const [plansDismissed, setPlansDismissed] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Derived directly at render time (no effect needed): reading localStorage
  // here is a plain read, not a state sync, so it's safe to do inline.
  const plansSeenKey = user ? `${PLANS_SEEN_KEY_PREFIX}${user.id}` : PLANS_SEEN_ANONYMOUS_KEY;
  const hasSeenPlans = typeof window !== "undefined" && window.localStorage.getItem(plansSeenKey) === "true";
  const hasSkippedAuth =
    authSkipped || (typeof window !== "undefined" && window.localStorage.getItem(AUTH_SKIPPED_KEY) === "true");

  let step: GateStep;
  if (!isConfigured) step = "done";
  else if (isLoading) step = "checking";
  else if (!user && !hasSkippedAuth) step = "signin";
  else step = hasSeenPlans || plansDismissed ? "done" : "plans";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!termsAccepted) {
      setError("Devam etmek için KVKK ve gizlilik onayını işaretleyin.");
      return;
    }
    setIsSubmitting(true);
    const result = mode === "signup" ? await signUp(email.trim(), password) : await signIn(email.trim(), password);
    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    acceptAiConsent();
    // `user` updates via the auth context once Supabase confirms the
    // session; `step` above re-derives to "plans" on the next render.
  }

  function continueWithoutAccount() {
    if (!termsAccepted) {
      setError("Devam etmek için KVKK ve gizlilik onayını işaretleyin.");
      return;
    }
    acceptAiConsent();
    window.localStorage.setItem(AUTH_SKIPPED_KEY, "true");
    setAuthSkipped(true);
  }

  function finishOnboarding() {
    window.localStorage.setItem(plansSeenKey, "true");
    setPlansDismissed(true);
  }

  async function handlePlanCta(plan: EksperIqPlanPricing) {
    if (purchasingPlanId) return;
    const productId = billing === "monthly" ? plan.monthlyProductId : plan.yearlyProductId;
    setPurchasingPlanId(plan.id);
    setPurchaseMessage(null);
    try {
      const result = await purchasePlan(productId);
      if (result.cancelled) {
        // User backed out of Apple's own sheet — not an error, say nothing.
        return;
      }
      if (result.state === "pro" || result.state === "gracePeriod") {
        finishOnboarding();
        return;
      }
      if (result.state === "unknown") {
        // Apple returned .pending (e.g. "Ask to Buy") — genuinely in progress.
        setPurchaseMessage("Satın alma onay bekliyor. Onaylandığında otomatik olarak aktif olacak.");
        return;
      }
      setPurchaseMessage("Satın alma tamamlanamadı. Lütfen tekrar deneyin.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setPurchaseMessage(
        message.includes("bulunamadı") || message.toLowerCase().includes("not found")
          ? "Bu paket App Store'da henüz aktif değil. Kısa süre içinde açılacak."
          : "Satın alma şu anda tamamlanamadı. Lütfen birazdan tekrar deneyin.",
      );
    } finally {
      setPurchasingPlanId(null);
    }
  }

  async function handleRestore() {
    if (isRestoring) return;
    setIsRestoring(true);
    setPurchaseMessage(null);
    try {
      await restorePurchases();
      setPurchaseMessage("Önceki satın almalar kontrol edildi. Aktif bir aboneliğiniz varsa otomatik tanınacaktır.");
    } catch {
      setPurchaseMessage("Satın almalar şu anda geri yüklenemedi. Lütfen birazdan tekrar deneyin.");
    } finally {
      setIsRestoring(false);
    }
  }

  if (step === "checking") {
    return (
      <Screen>
        <p className="text-center text-sm text-muted-foreground">Yükleniyor...</p>
      </Screen>
    );
  }

  if (step === "signin") {
    return (
      <Screen>
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <CarFront aria-hidden="true" className="h-10 w-10 text-accent" />
          <h1 className="font-heading text-2xl font-bold text-foreground">EksperIQ&apos;a hoş geldiniz</h1>
          <p className="text-sm text-muted-foreground">
            Hesabınız Pro/Pro+ aboneliğinizi cihazlar arasında taşır. İsterseniz hesap açmadan da devam edebilirsiniz.
          </p>
        </div>
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
            <Field
              id="gate-password"
              label="Şifre"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="En az 6 karakter"
            />
            <label className="flex items-start gap-3 rounded-theme-sm border border-border bg-muted p-3 text-sm text-foreground/90">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => {
                  setTermsAccepted(event.target.checked);
                  setError(null);
                }}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
              />
              <span>
                <Link href="/gizlilik" className="underline">
                  Gizlilik Politikası
                </Link>
                , <Link href="/kullanim-kosullari" className="underline">
                  Kullanım Koşulları
                </Link>{" "}
                ve KVKK kapsamında üçüncü taraf bir AI sağlayıcısına geçici veri gönderimini kabul ediyorum.
              </span>
            </label>
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <PrimaryButton type="submit" disabled={isSubmitting || !email.trim() || password.length < 6}>
              {isSubmitting ? (
                <Spinner />
              ) : mode === "signup" ? (
                <UserPlus aria-hidden="true" className="h-4 w-4" />
              ) : (
                <Mail aria-hidden="true" className="h-4 w-4" />
              )}
              {isSubmitting ? "Bekleyin..." : mode === "signup" ? "Üye ol" : "Giriş yap"}
            </PrimaryButton>
          </form>
          <button
            type="button"
            onClick={continueWithoutAccount}
            className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
          >
            <Lock aria-hidden="true" className="h-3.5 w-3.5" />
            Üye olmadan devam et
          </button>
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
            Pro veya Pro+&apos;a geçin, ilk 3 gün ücretsiz deneyin — istediğiniz an iptal edebilirsiniz.
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
                Ayda {plan.includedAiPhotoAnalyses} fotoğraf/rapor analizi dahil
              </p>
              <button
                type="button"
                onClick={() => handlePlanCta(plan)}
                disabled={purchasingPlanId !== null}
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {purchasingPlanId === plan.id ? <Spinner /> : null}
                {purchasingPlanId === plan.id ? "İşleniyor..." : "3 gün ücretsiz dene"}
              </button>
            </div>
          ))}
        </div>

        {purchaseMessage ? <p className="mt-3 text-center text-sm text-foreground">{purchaseMessage}</p> : null}

        <button
          type="button"
          onClick={handleRestore}
          disabled={isRestoring}
          className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRestoring ? <Spinner /> : <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />}
          Satın almaları geri yükle
        </button>

        <button
          type="button"
          onClick={finishOnboarding}
          className="mt-2 w-full text-center text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
        >
          Şimdilik ücretsiz devam et
        </button>
      </Screen>
    );
  }

  return <>{children}</>;
}
