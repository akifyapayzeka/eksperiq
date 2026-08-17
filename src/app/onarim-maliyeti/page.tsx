"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Ayrı bir modül olmaktan çıktı — Tahmini Onarım Maliyeti her zaman
 * Fotoğraftan Hasar Analizi bulgularına bağımlıydı, artık o sayfanın bir
 * bölümü (src/components/repair-cost/repair-cost-estimator.tsx). Bu route
 * eski link/kısayolların kırılmaması için yönlendirme olarak kalır.
 */
export default function RepairCostRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/fotograf-hasar");
  }, [router]);

  return null;
}
