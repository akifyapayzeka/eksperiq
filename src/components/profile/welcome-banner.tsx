"use client";

import { useAuth } from "@/lib/auth/auth-context";

export function ProfileWelcomeBanner() {
  const { user } = useAuth();
  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const firstName = typeof metadata.first_name === "string" ? metadata.first_name : "";
  const lastName = typeof metadata.last_name === "string" ? metadata.last_name : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  if (!fullName) return null;

  return <h1 className="mb-4 font-heading text-3xl font-bold text-foreground">Hoşgeldin, {fullName}!</h1>;
}
