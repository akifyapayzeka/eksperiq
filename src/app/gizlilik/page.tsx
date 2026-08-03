import { InfoPage } from "@/components/layout/info-page";
import { appConfig } from "@/lib/constants/app";

export default function PrivacyPage() {
  return (
    <InfoPage title="Gizlilik">
      <p>{appConfig.privacy}</p>
      <p>Üyelik, reklam takibi, analytics kodu veya çerez bannerı gerektirecek üçüncü taraf servis bulunmaz.</p>
      <p>
        Fotoğraftan Hasar Analizi özelliğini kullanırsanız, seçtiğiniz fotoğraf yalnızca o an OpenRouter üzerinden
        geçici olarak işlenir; geliştirici sunucusunda kalıcı hesap kaydı olarak saklanmaz. Kamera veya galeri erişimi
        yalnızca siz bu ekranda bir fotoğraf çekmeyi veya seçmeyi başlattığınız anda, o tek fotoğraf için istenir.
      </p>
      <p>
        Sonuç ekranındaki isteğe bağlı &ldquo;AI karar destek notu&rdquo; özelliğini açarsanız; aracınızın
        yıl/marka/model bilgisi, risk skoru ve öne çıkan bulgu başlıkları (fotoğraf gönderilmez) yalnızca o an
        OpenRouter üzerinden geçici olarak işlenip size özel bir metin üretilir, sunucuda kalıcı olarak saklanmaz.
      </p>
      <p>
        Bakım ve Ödeme Takvimi kayıtlarınız (MTV, sigorta, muayene, bakım gibi başlık/tarih/tutar bilgileri) cihazınızda
        saklanır. Bildirimleri açarsanız, son tarihe 30 ve 15 gün kala bildirim gönderebilmek için bu kayıtların bir
        kopyası ve push aboneliği bilgisi (kimliğinizle ilişkilendirilmeden) sunucuda tutulur; bildirimleri kapatır veya
        kaydı silerseniz bu kopya da silinir. Bu veri üçüncü taraflarla paylaşılmaz veya reklam/analitik amacıyla
        kullanılmaz.
      </p>
      <p>
        Mobil mağaza sürümünde de aynı gizlilik sınırları korunur; kamera, fotoğraf veya bildirim izni yalnızca ilgili
        özelliği kullanmayı seçtiğinizde istenir.
      </p>
      <p>
        Analiz geçmişiniz (Analizlerim ekranındaki kayıtlar) tarayıcı oturumu kapansa bile bu cihazda saklanır;
        istediğiniz analizi Analizlerim ekranından tek tek silebilir veya tarayıcı verilerinizi temizleyerek tamamını
        kaldırabilirsiniz.
      </p>
    </InfoPage>
  );
}
