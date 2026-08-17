"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * "Bakım Takibi" ve "Bakım ve Ödeme Takvimi" iki ayrı modül olarak
 * kullanıcı için kafa karıştırıcıydı (ikisi de aynı işi yapıyordu, biri
 * kayıtsız tek seferlik tahmin, diğeri kalıcı çoklu araç takvimi). Tek
 * modülde birleştirildi (bkz. src/lib/modules/registry.ts); bu route eski
 * link/kısayolların kırılmaması için yönlendirme olarak kalır.
 */
export default function MaintenanceTrackingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/bakim-odeme-takvimi");
  }, [router]);

  return null;
}
