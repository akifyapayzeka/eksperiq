"use client";

import { useState } from "react";
import { MapPin, Phone } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { searchNearbyPlaces } from "@/lib/places/nearby-search";
import { buildMapLinks } from "@/lib/places/map-links";
import type { NearbyPlace, PlaceCategory } from "@/lib/places/types";

const locateMessages: Record<string, string> = {
  "permission-denied": "Konum izni verilmedi. İzin vermeden yakındaki firmalar bulunamaz.",
  unavailable: "Bu cihazda konum servisi kullanılamıyor.",
  "network-error": "Şu anda yakındaki hizmetlere ulaşılamadı. Birazdan tekrar deneyin.",
  "not-configured": "Konuma göre hizmet arama şu anda kullanılamıyor.",
  "rate-limited": "Çok fazla arama yapıldı. Birazdan tekrar deneyin.",
};

export function NearbyPlaceFinder({ category }: { category: PlaceCategory }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [message, setMessage] = useState("");
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function handleSearch() {
    setStatus("loading");
    setMessage("");
    const result = await searchNearbyPlaces(category);
    if (!result.ok) {
      setStatus("error");
      setMessage(locateMessages[result.reason] ?? "Çevrenizdeki hizmetler şu anda getirilemedi.");
      return;
    }
    if (!result.places.length) {
      setStatus("error");
      setMessage("Yakınınızda sonuç bulunamadı. Arama yarıçapı dışında olabilirsiniz.");
      return;
    }
    setPlaces(result.places);
    setStatus("ready");
    setExpandedId(result.places[0].id);
  }

  return (
    <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
      <button
        type="button"
        onClick={handleSearch}
        disabled={status === "loading"}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {status === "loading" ? <Spinner /> : <MapPin aria-hidden="true" className="h-4 w-4" />}
        {status === "loading" ? "Konumunuz alınıyor..." : "Konumuma göre bul"}
      </button>
      {message ? (
        <p
          className={`mt-3 rounded-theme-sm px-3 py-2 text-sm font-medium ${
            status === "error" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
          }`}
          role="status"
        >
          {message}
        </p>
      ) : null}
      {status === "ready" && places.length ? (
        <div className="mt-4 grid gap-2">
          {places.map((place) => {
            const isExpanded = expandedId === place.id;
            const links = buildMapLinks(place);
            return (
              <article key={place.id} className="rounded-theme-sm border border-border bg-muted">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : place.id)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <span>
                    <span className="block font-semibold text-foreground">{place.name}</span>
                    <span className="block text-sm text-muted-foreground">{place.distanceKm} km uzakta</span>
                  </span>
                </button>
                {isExpanded ? (
                  <div className="border-t border-border p-4 pt-3">
                    <p className="text-sm leading-6 text-foreground/80">{place.address}</p>
                    {place.phone ? (
                      <a
                        href={`tel:${place.phone.replace(/\s/g, "")}`}
                        className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
                      >
                        <Phone aria-hidden="true" className="h-4 w-4" />
                        {place.phone}
                      </a>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={links.apple}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 items-center rounded-full border border-border px-3 text-sm font-semibold text-foreground/90"
                      >
                        Apple Haritalar
                      </a>
                      <a
                        href={links.google}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 items-center rounded-full border border-border px-3 text-sm font-semibold text-foreground/90"
                      >
                        Google Haritalar
                      </a>
                      <a
                        href={links.yandex}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 items-center rounded-full border border-border px-3 text-sm font-semibold text-foreground/90"
                      >
                        Yandex Haritalar
                      </a>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Firma adı, adres, telefon ve konum bilgisi Google Haritalar&apos;dan canlı alınır. Fiyat bilgisi hiçbir
            haritada yayınlanmadığı için gösterilmez; telefonla sorabilirsiniz.
          </p>
        </div>
      ) : null}
    </section>
  );
}
