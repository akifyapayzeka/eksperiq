import { InfoPage } from "@/components/layout/info-page";

export default function HowItWorksPage() {
  return (
    <InfoPage title="Nasıl çalışır?">
      <p>
        EksperIQ, kullanıcının manuel girdiği araç bilgileri, hasar bilgileri, bakım kayıtları ve ilan açıklaması
        üzerinden kural tabanlı bir değerlendirme üretir.
      </p>
      <p>
        İlan bağlantısı otomatik okunmaz, ilan siteleri scrape edilmez ve ücretli yapay zeka API’si kullanılmaz.
        Bağlantı yalnızca kullanıcının referansı olarak saklanır.
      </p>
      <p>
        Risk skoru kesin ekspertiz sonucu değildir. Amaç, satın alma öncesi hangi belgelerin isteneceğini ve ekspertizde
        hangi noktaların kontrol edileceğini görünür kılmaktır.
      </p>
    </InfoPage>
  );
}
