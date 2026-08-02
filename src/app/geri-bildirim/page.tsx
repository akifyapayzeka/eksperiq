import { CheckCircle2, ExternalLink, ListChecks, ShieldAlert, Wrench } from "lucide-react";
import { FeedbackTemplateCopy } from "@/components/feedback/feedback-template-copy";
import { InfoPage } from "@/components/layout/info-page";
import { appConfig } from "@/lib/constants/app";

const feedbackSteps = [
  "Eksik gördüğünüz risk uyarısını veya fazla sert bulduğunuz sonucu not edin.",
  "İlan bilgisini kişisel veri paylaşmadan özetleyin.",
  "Beklediğiniz satıcı sorusunu veya ekspertiz kontrol başlığını yazın.",
  "Geri bildirimi e-posta ile gönderin.",
];

const userTestMailto = `mailto:${appConfig.feedbackEmail}?subject=${encodeURIComponent(
  "EksperIQ - Kullanıcı testi notu",
)}&body=${encodeURIComponent(
  "Cihaz/tarayıcı: \n\n1) İlk ekranda uygulamanın ne yaptığı net miydi?\n\n2) Formda gereksiz veya zor gelen alan var mıydı?\n\n3) Risk skoru güven verdi mi, fazla kesin mi hissettirdi?\n\n4) Satıcı soruları ve ekspertiz listesi işine yaradı mı?\n\nNotlarınız:\n",
)}`;

const ruleFeedbackMailto = `mailto:${appConfig.feedbackEmail}?subject=${encodeURIComponent(
  "EksperIQ - Kural/özellik geri bildirimi",
)}&body=${encodeURIComponent(
  "Eksik gördüğünüz risk, satıcı sorusu, ekspertiz kontrolü veya yeni ilan ifadesi:\n\nNeden önemli:\n",
)}`;

const userTestQuestions = [
  "İlk ekranda uygulamanın ne yaptığı net miydi?",
  "Formda gereksiz veya zor gelen alan var mıydı?",
  "Risk skoru güven verdi mi, fazla kesin mi hissettirdi?",
  "Satıcı soruları ve ekspertiz listesi işine yarar mıydı?",
];

const feedbackRoutes = [
  {
    title: "UI / kullanılabilirlik",
    icon: Wrench,
    signal: "Klavye, seçenekli alan, buton, yatay taşma veya okunabilirlik sorunu.",
    triage: "Sorun tipi: kullanıcı deneyimi",
    nextStep: "Mobil E2E veya ekran görüntüsüyle doğrula.",
  },
  {
    title: "Kural adayı",
    icon: ListChecks,
    signal: "Eksik risk, satıcı sorusu, ekspertiz kontrolü veya yeni ilan ifadesi.",
    triage: "Sorun tipi: kural adayı",
    nextStep: "Backlog tablo satırı ve typed kayıt kontrolü oluştur.",
  },
  {
    title: "Güven ve App Store dili",
    icon: ShieldAlert,
    signal: "Fazla kesin skor, garanti algısı, veri/gizlilik veya ödeme beklentisi.",
    triage: "Sorun tipi: güven ve dil riski / App Store riski",
    nextStep: "Yasal uyarı, metadata ve gizlilik metinlerini birlikte kontrol et.",
  },
] as const;

export default function FeedbackPage() {
  return (
    <InfoPage title="Geri bildirim">
      <p>
        EksperIQ kural setleri gerçek kullanıcı geri bildirimiyle genişletilir. Geri bildirimler uygulama içinde
        kaydedilmez; paylaşmak istediğiniz notları kişisel veri eklemeden e-posta ile iletebilirsiniz.
      </p>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h2 className="text-lg font-semibold text-slate-950">Nasıl paylaşılır?</h2>
        <ol className="mt-3 grid gap-2 text-slate-700">
          {feedbackSteps.map((step, index) => (
            <li key={step}>
              {index + 1}. {step}
            </li>
          ))}
        </ol>
      </div>
      <p>
        Geri bildirimlerde plaka, telefon numarası, açık adres, satıcı adı veya kimlik bilgisi paylaşmayın. İlanı
        anlatmak için marka, model, yıl, kilometre ve anonimleştirilmiş açıklama yeterlidir. Kullanıcı testi notları
        önce triage edilir; kural önerileri test yazılmadan aktif analiz motoruna taşınmaz.
      </p>
      <FeedbackTemplateCopy />
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-slate-950">Geri bildirimi doğru hatta ayır</h2>
        <p className="mt-2 text-slate-700">
          Her not aynı işe dönüşmez. Test sırasında gelen yorumu aşağıdaki üç hattan birine koyarsak, hem öncelik hem de
          doğrulama komutu netleşir.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {feedbackRoutes.map((route) => {
            const Icon = route.icon;

            return (
              <article key={route.title} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-800">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-950">{route.title}</h3>
                    <p className="mt-2 text-sm text-slate-700">{route.signal}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900">{route.triage}</p>
                <p className="mt-1 text-sm text-slate-600">{route.nextStep}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-4 rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
          <p className="font-semibold">Otomatik triage komutları</p>
          <code className="mt-2 block whitespace-pre-wrap text-xs leading-5 text-slate-100">
            npm run user-tests:triage -- path/to/user-note.txt{"\n"}
            npm run user-tests:triage-check{"\n"}
            npm run user-tests:package-check
          </code>
        </div>
      </div>
      <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
        <h2 className="text-lg font-semibold text-slate-950">5 dakikalık kullanıcı testi</h2>
        <p className="mt-2 text-slate-700">
          İlk kullanıcıdan telefonda ana sayfadan başlayıp rapor oluşturmasını isteyin. Test sonunda şu dört soruyu not
          almak yeterli.
        </p>
        <ul className="mt-3 grid gap-2 text-slate-700">
          {userTestQuestions.map((question) => (
            <li key={question} className="flex gap-2">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
              {question}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-slate-600">
          Detaylı senaryo: <code>docs/first-user-test-script.md</code>. Triage akışı:{" "}
          <code>docs/user-test-feedback-triage.md</code>
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={userTestMailto}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 font-semibold text-white hover:bg-slate-800"
        >
          Kullanıcı testi notu gönder
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </a>
        <a
          href={ruleFeedbackMailto}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 font-semibold text-slate-950 hover:bg-slate-50"
        >
          Kural geri bildirimi gönder
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </a>
      </div>
    </InfoPage>
  );
}
