import { InfoPage } from "@/components/layout/info-page";
import { appConfig } from "@/lib/constants/app";

export default function AboutPage() {
  return (
    <InfoPage title="Hakkında">
      <p>
        {appConfig.name}, ikinci el araç ilanlarını daha bilinçli değerlendirmek isteyen kullanıcılar için hazırlanmış
        ücretsiz bir web uygulamasıdır.
      </p>
      <p>
        Uygulama hiçbir aracın güvenli, hasarsız veya satın almaya uygun olduğunu garanti etmez. Satın alma öncesi
        bağımsız ekspertiz, servis kontrolü, resmî kayıt sorgusu ve hukuki kontrol önerilir.
      </p>
    </InfoPage>
  );
}
