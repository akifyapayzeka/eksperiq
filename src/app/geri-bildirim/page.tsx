import { CheckCircle2, ExternalLink } from "lucide-react";
import { InfoPage } from "@/components/layout/info-page";
import { appConfig } from "@/lib/constants/app";

const feedbackSteps = [
  "Eksik gördüğünüz risk uyarısını veya fazla sert bulduğunuz sonucu not edin.",
  "İlan bilgisini kişisel veri paylaşmadan özetleyin.",
  "Beklediğiniz satıcı sorusunu veya ekspertiz kontrol başlığını yazın.",
  "Geri bildirimi GitHub issue şablonuyla gönderin.",
];

const userTestQuestions = [
  "İlk ekranda uygulamanın ne yaptığı net miydi?",
  "Formda gereksiz veya zor gelen alan var mıydı?",
  "Risk skoru güven verdi mi, fazla kesin mi hissettirdi?",
  "Satıcı soruları ve ekspertiz listesi işine yarar mıydı?",
];

export default function FeedbackPage() {
  return (
    <InfoPage title="Geri bildirim">
      <p>
        EksperIQ kural setleri gerçek kullanıcı geri bildirimiyle genişletilir. Geri bildirimler uygulama içinde
        kaydedilmez; paylaşmak istediğiniz notları kişisel veri eklemeden GitHub issue şablonu üzerinden
        iletebilirsiniz.
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
        anlatmak için marka, model, yıl, kilometre ve anonimleştirilmiş açıklama yeterlidir.
      </p>
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
          Detaylı senaryo: <code>docs/first-user-test-script.md</code>
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={appConfig.newRuleFeedbackUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 font-semibold text-white hover:bg-slate-800"
        >
          Kural geri bildirimi gönder
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </a>
        <a
          href={appConfig.feedbackIssueUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 font-semibold text-slate-950 hover:bg-slate-50"
        >
          İlk kullanıcı testi issue&apos;su
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
        </a>
      </div>
    </InfoPage>
  );
}
