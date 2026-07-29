import { InfoPage } from "@/components/layout/info-page";
import { appConfig } from "@/lib/constants/app";

export default function PrivacyPage() {
  return (
    <InfoPage title="Gizlilik">
      <p>{appConfig.privacy}</p>
      <p>
        İlk sürümde üyelik, reklam takibi, analytics kodu, çerez bannerı gerektirecek üçüncü taraf servis veya fotoğraf
        yükleme özelliği bulunmaz.
      </p>
      <p>Tarayıcı oturumu kapatıldığında veya kullanıcı veriyi temizlediğinde analiz sonucu kaybolabilir.</p>
    </InfoPage>
  );
}
