import Link from "next/link";
import { CreditCard, HelpCircle, Mail, ShieldCheck, Trash2, Wrench } from "lucide-react";
import { InfoPage } from "@/components/layout/info-page";
import { appConfig } from "@/lib/constants/app";

function mailtoWithSubject(subject: string) {
  return `mailto:${appConfig.feedbackEmail}?subject=${encodeURIComponent(subject)}`;
}

const supportTopics = [
  {
    title: "Bir sorun mu yaşadınız?",
    icon: Wrench,
    description: "Uygulamada karşılaştığınız bir hatayı veya beklenmedik davranışı bildirin.",
    mailto: mailtoWithSubject("EksperIQ Destek - Hata bildirimi"),
    cta: "Hata bildir",
  },
  {
    title: "Aboneliğiniz veya ödemenizle mi ilgili?",
    icon: CreditCard,
    description: "Pro/Pro+ satın alma, yenileme veya faturalandırmayla ilgili bir sorunuz varsa yazın.",
    mailto: mailtoWithSubject("EksperIQ Destek - Abonelik/ödeme"),
    cta: "Abonelik desteği iste",
  },
  {
    title: "Gizlilik veya verilerinizle ilgili bir talebiniz mi var?",
    icon: ShieldCheck,
    description: "Verilerinizle ilgili bilgi, düzeltme veya silme talebinizi iletin.",
    mailto: mailtoWithSubject("EksperIQ Destek - Gizlilik talebi"),
    cta: "Gizlilik talebi gönder",
  },
  {
    title: "Genel bir sorunuz mu var?",
    icon: HelpCircle,
    description: "Uygulamanın nasıl çalıştığı veya bir özellik hakkında sorularınızı yanıtlıyoruz.",
    mailto: mailtoWithSubject("EksperIQ Destek - Genel soru"),
    cta: "Soru sor",
  },
] as const;

export default function SupportPage() {
  return (
    <InfoPage title="Destek">
      <p>
        {appConfig.name}, ikinci el araç ilanlarındaki riskleri değerlendirmenize yardımcı olan bir karar destek
        uygulamasıdır. Uygulamayla ilgili bir sorunuz, sorununuz veya talebiniz varsa aşağıdaki e-posta adresinden
        doğrudan bize ulaşabilirsiniz.
      </p>

      <div className="rounded-theme-sm border border-border bg-muted p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Mail aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm text-muted-foreground">Destek e-postası</p>
            <a href={mailtoWithSubject("EksperIQ Destek")} className="font-semibold text-accent underline">
              {appConfig.feedbackEmail}
            </a>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Mesajlarınıza genellikle 2 iş günü içinde yanıt veriyoruz.</p>
      </div>

      <h2>Ne konuda yardımcı olabiliriz?</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {supportTopics.map((topic) => {
          const Icon = topic.icon;
          return (
            <a
              key={topic.title}
              href={topic.mailto}
              className="flex flex-col gap-2 rounded-theme-sm border border-border bg-card p-4 no-underline transition hover:border-accent/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
              </span>
              <span className="font-heading font-bold text-foreground">{topic.title}</span>
              <span className="text-sm text-muted-foreground">{topic.description}</span>
              <span className="mt-1 text-sm font-semibold text-accent">{topic.cta}</span>
            </a>
          );
        })}
      </div>

      <div className="flex items-start gap-3 rounded-theme-sm border border-border bg-muted p-4">
        <Trash2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <p className="text-sm text-foreground/90">
          <strong>Verilerinizi silmek mi istiyorsunuz?</strong> Uygulamanın kullanıcı hesabı yoktur — tüm araç ve analiz
          kayıtlarınız yalnızca bu cihazda tutulur. Analizlerim ekranından tek tek silebilir veya uygulamayı
          cihazınızdan kaldırarak tüm yerel verileri kalıcı olarak temizleyebilirsiniz.
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        <Link href="/gizlilik" className="font-medium text-accent underline">
          Gizlilik Politikası
        </Link>{" "}
        ve{" "}
        <Link href="/kullanim-kosullari" className="font-medium text-accent underline">
          Kullanım Koşulları
        </Link>{" "}
        sayfalarımızı da inceleyebilirsiniz.
      </p>
    </InfoPage>
  );
}
