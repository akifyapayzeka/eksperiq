"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ExternalLink, LogIn, LogOut, Mail, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { deleteAccount } from "@/lib/auth/delete-account";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/** Apple's "Manage Subscriptions" universal link — same one used in paywall-plans.tsx. */
const MANAGE_SUBSCRIPTIONS_URL = "https://apps.apple.com/account/subscriptions";

export function AccountSection() {
  const { isLoading, user, isConfigured, signOut } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!isConfigured) return null;

  async function handleSignOut() {
    setIsSigningOut(true);
    await signOut();
    setIsSigningOut(false);
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deleteAccount();
    setIsDeleting(false);
    if (!result.ok) {
      setDeleteError(
        result.reason === "not-signed-in"
          ? "Oturumunuz bulunamadı. Lütfen tekrar giriş yapıp deneyin."
          : "Hesabınız silinemedi. İnternet bağlantınızı kontrol edip tekrar deneyin; sorun devam ederse geri bildirim gönderin.",
      );
      return;
    }
    router.push("/");
  }

  return (
    <section className="rounded-theme border border-border bg-card p-5 shadow-sm">
      <h2 className="font-heading font-bold text-foreground">Hesap</h2>
      {isLoading ? (
        <p className="mt-2 text-sm text-muted-foreground">Yükleniyor...</p>
      ) : user ? (
        <div className="mt-3 grid gap-3">
          <div className="flex items-center gap-3 text-sm text-foreground">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Mail aria-hidden="true" className="h-[18px] w-[18px]" />
            </span>
            <span className="min-w-0 truncate font-medium">{user.email}</span>
          </div>
          <SecondaryButton onClick={handleSignOut} disabled={isSigningOut}>
            {isSigningOut ? <Spinner /> : <LogOut aria-hidden="true" className="h-4 w-4" />}
            {isSigningOut ? "Çıkış yapılıyor..." : "Çıkış yap"}
          </SecondaryButton>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => {
                setShowDeleteConfirm(true);
                setDeleteError(null);
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-destructive/30 px-4 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Hesabımı sil
            </button>
          ) : (
            <div className="rounded-theme-sm border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div className="text-sm text-foreground">
                  <p className="font-semibold">Hesabınızı kalıcı olarak silmek üzeresiniz.</p>
                  <p className="mt-1 leading-6 text-muted-foreground">
                    E-posta, ad/soyad ve giriş bilgileriniz kalıcı olarak silinir; bu işlem geri alınamaz. Bu cihazdaki
                    araç ve analiz kayıtlarınız da silinip oturumunuz kapatılır.
                  </p>
                  <p className="mt-2 leading-6 text-muted-foreground">
                    Hesabınızı silmek App Store aboneliğinizi otomatik olarak iptal etmez — aktif bir aboneliğiniz varsa
                    ayrıca{" "}
                    <a
                      href={MANAGE_SUBSCRIPTIONS_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-accent underline-offset-4 hover:underline"
                    >
                      Abonelikleri Yönet
                      <ExternalLink aria-hidden="true" className="h-3 w-3" />
                    </a>{" "}
                    üzerinden iptal etmeniz gerekir.
                  </p>
                </div>
              </div>
              {deleteError ? <p className="mt-3 text-sm font-medium text-destructive">{deleteError}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-destructive px-4 text-sm font-semibold text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? <Spinner /> : <Trash2 aria-hidden="true" className="h-4 w-4" />}
                  {isDeleting ? "Siliniyor..." : "Evet, hesabımı kalıcı olarak sil"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 grid gap-3">
          <p className="text-sm text-muted-foreground">
            Pro/Pro+ abonelik satın almak ve cihazlar arasında aynı aboneliği kullanmak için giriş yapın.
          </p>
          <PrimaryButton href="/giris">
            <LogIn aria-hidden="true" className="h-4 w-4" />
            Giriş yap / Hesap oluştur
          </PrimaryButton>
        </div>
      )}
    </section>
  );
}
