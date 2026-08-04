import Link from "next/link";
import { InfoPage } from "@/components/layout/info-page";
import { appConfig } from "@/lib/constants/app";

export default function PrivacyPage() {
  return (
    <InfoPage title="Gizlilik">
      <p>{appConfig.privacy}</p>
      <p>
        <strong>Kullanıcı hesabı yok.</strong> Uygulamada üyelik, giriş veya profil bilgisi bulunmaz; reklam takibi,
        üçüncü taraf analytics kodu veya çerez bannerı gerektirecek bir izleyici de yoktur.
      </p>
      <p>
        <strong>Fotoğraftan Hasar Analizi.</strong> Bu özelliği kullanırsanız seçtiğiniz fotoğraf önce cihazınızda
        küçültülür, yeniden sıkıştırılır ve konum/cihaz gibi EXIF meta verileri silinir; ardından yalnızca o an
        OpenRouter üzerinden geçici olarak işlenir ve size özel bulgular üretilir. İstekler OpenRouter&apos;a &ldquo;bu
        veriyi model eğitimi için saklama/toplama&rdquo; talimatıyla (veri saklama karşıtı parametre) gönderilir;
        geliştirici sunucusunda kalıcı hesap kaydı olarak saklanmaz. Kamera veya galeri erişimi yalnızca siz bu ekranda
        bir fotoğraf çekmeyi veya seçmeyi başlattığınız anda, o tek fotoğraf için istenir.
      </p>
      <p>
        <strong>AI karar destek notu.</strong> Sonuç ekranındaki isteğe bağlı bu özelliği açarsanız; aracınızın
        yıl/marka/model bilgisi, risk skoru ve öne çıkan bulgu başlıkları (fotoğraf gönderilmez) yalnızca o an
        OpenRouter üzerinden geçici olarak işlenip size özel bir metin üretilir, sunucuda kalıcı olarak saklanmaz. AI
        çıktısı kural tabanlı raporun, profesyonel araç ekspertizinin veya resmî kayıt sorgusunun yerine geçmez.
      </p>
      <p>
        <strong>Bakım ve Ödeme Takvimi bildirimleri — Web/PWA.</strong> Kayıtlarınız (MTV, sigorta, muayene, bakım gibi
        başlık/tarih/tutar bilgileri) her zaman önce cihazınızda saklanır. Tarayıcıda bildirimleri açarsanız, son tarihe
        30 ve 15 gün kala bildirim gönderebilmek için bu kayıtların bir kopyası ve push aboneliğiniz (kimliğinizle
        ilişkilendirilmeden) sunucu tarafı veritabanı altyapımızda (Upstash) tutulur. Bu kopya bildirimler açık kaldığı
        ve uygulama arada senkronize olduğu sürece güncel tutulur; cihazınızda 90 gün boyunca hiç açılıp senkronize
        olmazsa (ör. uygulama kaldırılırsa) kendiliğinden otomatik silinir; bildirimi kapatır ya da kaydı silerseniz de
        hemen silinir. Bu veri reklam veya pazarlama amacıyla hiçbir üçüncü tarafla paylaşılmaz — yalnızca bildirimi
        cihazınıza teslim edebilmek için tarayıcınızın/işletim sisteminizin kendi push servisi (ör. Google, Mozilla,
        Apple) aracı olarak kullanılır.
      </p>
      <p>
        <strong>Bakım ve Ödeme Takvimi bildirimleri — mağaza (iOS) sürümü.</strong> Mobil mağaza sürümünde bildirimler
        cihaz üzerinde planlanır ve gösterilir; bu bildirimler için herhangi bir kayıt sunucuya gönderilmez.
      </p>
      <p>
        <strong>Kötüye kullanımı önleme.</strong> AI özelliklerinin makul sınırlar içinde kullanılmasını sağlamak için
        cihazınıza ait rastgele, anonim bir kurulum kimliği ve/veya IP adresi geri döndürülemez şekilde (tek yönlü
        özet/hash) dönüştürülerek kısa süreli istek sayaçlarında kullanılır. Ham kurulum kimliği veya IP adresi hiçbir
        zaman saklanmaz; bu sayaçlar kullanıcı kimliğiyle ilişkilendirilemez ve kısa süre sonra kendiliğinden silinir.
      </p>
      <p>
        <strong>Yurt dışı veri aktarımı.</strong> OpenRouter (AI işleme) ve Upstash (sunucu tarafı veritabanı altyapısı)
        yurt dışında barındırılan hizmetlerdir; yukarıda açıklanan sınırlı veriler bu sağlayıcıların sunucularında
        işlenebilir. Uygulama bu sağlayıcılar dışında hiçbir üçüncü tarafla veri paylaşmaz ve verinizi satmaz.
      </p>
      <p>
        <strong>Verilerinizi yönetme ve silme.</strong> Profil &gt; Verilerim bölümünden tüm cihaz verilerinizi
        (araçlar, hatırlatmalar, giderler, sağlık kayıtları, fotoğraf analizleri, analiz geçmişi) tek bir JSON dosyası
        olarak dışa aktarabilir, başka bir cihaza aktarabilir veya tek dokunuşla tamamen silebilirsiniz. Tümünü silme
        işlemi cihazdaki tüm kayıtları, fotoğraf önizlemelerini, önbelleği ve varsa yukarıda açıklanan sunucu tarafı
        bildirim kopyanızı da kapsar.
      </p>
      <p>
        <strong>KVKK kapsamındaki haklarınız.</strong> 6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun 11.
        maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme,
        düzeltilmesini veya silinmesini isteme ve işlemeye itiraz etme haklarına sahipsiniz. Uygulamada hesap
        olmadığından bu haklar büyük ölçüde yukarıdaki &ldquo;Verilerim&rdquo; bölümünden kendi kendinize
        kullanılabilir; sunucu tarafında tutulan sınırlı bildirim kopyası için de aynı bölümdeki silme işlemi
        yeterlidir. Ek bir talebiniz olursa{" "}
        <Link href="/geri-bildirim" className="font-medium text-teal-800 underline dark:text-teal-300">
          geri bildirim sayfasından
        </Link>{" "}
        bize ulaşabilirsiniz.
      </p>
      <p>
        Analiz geçmişiniz (Analizlerim ekranındaki kayıtlar) tarayıcı oturumu kapansa bile bu cihazda saklanır;
        istediğiniz analizi Analizlerim ekranından tek tek silebilir veya Profil &gt; Verilerim bölümünden tamamını
        kaldırabilirsiniz.
      </p>
    </InfoPage>
  );
}
