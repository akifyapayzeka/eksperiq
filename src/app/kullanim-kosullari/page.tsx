import { InfoPage } from "@/components/layout/info-page";
import { appConfig } from "@/lib/constants/app";

export default function TermsPage() {
  return (
    <InfoPage title="Kullanım koşulları">
      <p>{appConfig.disclaimer}</p>
      <p>
        Kullanıcı, uygulama çıktılarının kesin satın alma tavsiyesi olmadığını kabul eder. Nihai karar, belge kontrolü
        ve ekspertiz sonucu kullanıcı sorumluluğundadır.
      </p>
      <p>
        Uygulama ilan sitelerine otomatik erişmez; kullanıcı yalnızca kendi sahip olduğu veya görüntülediği ilan
        bilgisini manuel olarak girer.
      </p>
    </InfoPage>
  );
}
