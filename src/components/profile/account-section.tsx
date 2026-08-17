"use client";

import { LogIn, LogOut, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";

export function AccountSection() {
  const { isLoading, user, isConfigured, signOut } = useAuth();

  if (!isConfigured) return null;

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
          <SecondaryButton onClick={() => signOut()}>
            <LogOut aria-hidden="true" className="h-4 w-4" />
            Çıkış yap
          </SecondaryButton>
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
