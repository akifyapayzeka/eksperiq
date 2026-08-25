import Link from "next/link";
import {
  ArrowUpRight,
  Calculator,
  CarFront,
  ClipboardCheck,
  FileSearch,
  MapPinned,
  MessageSquareText,
  Route,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { HeroCard } from "@/components/cards/hero-card";
import { BUYER_DECISION_GUIDE, BUYER_EDUCATION_NOTES } from "@/lib/analysis/buyer-education";

const purchaseFlow = [
  {
    title: "İlanı ve satıcıyı ön ele",
    description: "Marka, model, yıl, km, fiyat, şehir, açıklama, fotoğraf ve satıcı iddialarını tek yerde netleştir.",
    href: "/analiz",
    action: "İlan analizi yap",
    icon: CarFront,
  },
  {
    title: "Belge ve kayıt doğrula",
    description: "TRAMER, kilometre geçmişi, ruhsat/şasi eşleşmesi, rehin-haciz ve vergi/ceza konularını kontrol et.",
    href: "/resmi-sorgu-rehberi",
    action: "Resmi sorgu rehberini aç",
    icon: FileSearch,
  },
  {
    title: "Ekspertiz ve servis planla",
    description: "Aracı kendi seçtiğin ekspertize götür; gerekirse bakım/servis için ikinci görüş al.",
    href: "/yakinimdaki-hizmetler?kategori=ekspertiz",
    action: "Yakınımdaki ekspertizi bul",
    icon: MapPinned,
  },
  {
    title: "Masrafı pazarlığa kat",
    description: "Lastik, akü, triger, şanzıman, boya, far, cam ve fren gibi kalemleri tahmini aralıkla düşün.",
    href: "/onarim-maliyeti",
    action: "Masraf tahminini aç",
    icon: Calculator,
  },
  {
    title: "Test sürüşü yap",
    description: "Soğuk çalışma, vites geçişi, fren, direksiyon, süspansiyon, uyarı lambası ve sesleri kontrol et.",
    href: "/test-surusu-kontrol",
    action: "Test sürüşü listesini aç",
    icon: Route,
  },
  {
    title: "Noter öncesi son kontrol",
    description: "Kapora, ödeme, satış yetkisi, borç/rehin ve teslim sonrası sigorta-bakım adımlarını tamamla.",
    href: "/kontrol-listesi",
    action: "Son kontrol listesini aç",
    icon: ClipboardCheck,
  },
];

const stepTones = [
  "border-accent/25 bg-accent/5 text-accent",
  "border-success/25 bg-success/5 text-success",
  "border-chart-4/25 bg-chart-4/5 text-chart-4",
  "border-warning/30 bg-warning/10 text-warning",
  "border-primary/25 bg-secondary text-primary",
  "border-destructive/25 bg-destructive/5 text-destructive",
];

const serviceDirections = [
  {
    title: "Ekspertiz",
    description: "Kaporta, boya, şasi, podye, airbag, motor, şanzıman ve elektronik kontrol için.",
    href: "/yakinimdaki-hizmetler?kategori=ekspertiz",
  },
  {
    title: "Servis / usta",
    description: "Triger, zincir, DPF/EGR, turbo, şanzıman yağı, uyarı lambası ve bakım geçmişi için.",
    href: "/yakinimdaki-hizmetler?kategori=servis",
  },
  {
    title: "Noter",
    description: "Ruhsat sahibi, vekalet, satış, borç/rehin ve ödeme öncesi son resmi adım için.",
    href: "/yakinimdaki-hizmetler?kategori=noter",
  },
];

export default function PurchaseGuidePage() {
  return (
    <AppShell>
      <div className="max-w-5xl pt-6">
        <HeroCard
          icon={ShieldCheck}
          eyebrow="Satın Alma Rehberi"
          title="Araç almadan önce neye, nerede, hangi sırayla bakmalısınız?"
          description="EksperIQ ilanı analiz eder; bu rehber de satıcıyla görüşme, resmi sorgu, ekspertiz, servis, masraf, test sürüşü ve noter adımlarını tek akışa bağlar."
          tone="success"
        />

        <section className="mt-5 grid gap-3 rounded-theme border border-accent/20 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageSquareText aria-hidden="true" className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold text-foreground">İlk kural: söz değil, kanıt</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {BUYER_DECISION_GUIDE.map((item) => (
              <article key={item.title} className="rounded-theme-sm border border-accent/15 bg-accent/5 p-4">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.meaning}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-foreground/90">{item.action}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Route aria-hidden="true" className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold text-foreground">Satın alma akışı</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {purchaseFlow.map((step, index) => {
              const Icon = step.icon;
              const tone = stepTones[index % stepTones.length];
              return (
                <article key={step.title} className={`rounded-theme-sm border p-4 ${tone}`}>
                  <div className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card text-sm font-bold text-current shadow-sm">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon aria-hidden="true" className="h-4 w-4 text-current" />
                        <h3 className="font-semibold text-foreground">{step.title}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                      <Link
                        href={step.href}
                        className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground/90 hover:border-accent hover:text-accent"
                      >
                        {step.action}
                        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Wrench aria-hidden="true" className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold text-foreground">Nereye gitmeliyim?</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {serviceDirections.map((item, index) => (
              <Link
                key={item.title}
                href={item.href}
                className={`rounded-theme-sm border bg-muted p-4 hover:border-accent ${
                  index === 0 ? "border-accent/25" : index === 1 ? "border-success/25" : "border-warning/30"
                }`}
              >
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  Konuma göre bul <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-theme border border-border bg-card p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground">Terimler neden önemli?</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {BUYER_EDUCATION_NOTES.map((note) => (
              <article key={note.title} className="rounded-theme-sm border border-border bg-muted p-4">
                <h3 className="font-semibold text-foreground">{note.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Neden: {note.why}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-foreground/90">Kontrol: {note.check}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
