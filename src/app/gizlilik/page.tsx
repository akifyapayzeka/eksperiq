import Link from "next/link";
import { InfoPage } from "@/components/layout/info-page";
import { appConfig } from "@/lib/constants/app";

export default function PrivacyPage() {
  return (
    <InfoPage title="Gizlilik">
      <p>{appConfig.privacy}</p>
      <p>
        <strong>Hesap oluşturma isteğe bağlıdır.</strong> Uygulamayı hesap açmadan da tamamen kullanabilirsiniz. Hesap
        yalnızca Pro/Pro+ abonelik satın alma ve aynı aboneliği birden fazla cihazda kullanabilmek için sunulur. Hesap
        oluşturursanız e-posta adresiniz ve adınız/soyadınız, kimlik doğrulama sağlayıcımız Supabase Authentication
        üzerinden saklanır; başka hiçbir amaçla (reklam, izleme, profil oluşturma) kullanılmaz. Araç, analiz,
        hatırlatma, gider ve sağlık karnesi kayıtlarınız hesabınıza değil, her zaman bu cihaza kaydedilir — bu kayıtlar
        geliştirici sunucusunda hesabınızla ilişkilendirilmiş halde tutulmaz. Reklam takibi, üçüncü taraf analytics kodu
        veya çerez bannerı gerektirecek bir izleyici yoktur.
      </p>
      <p>
        <strong>Hesabınızı silme.</strong> Profil ekranındaki &ldquo;Hesabımı sil&rdquo; ile hesabınızı (e-posta,
        ad/soyad, giriş bilgileriniz) kalıcı olarak silebilirsiniz; bu işlem geri alınamaz ve bu cihazdaki yerel
        kayıtlarınızı da temizleyip oturumunuzu kapatır. Hesabınızı silmek App Store aboneliğinizi otomatik olarak iptal
        etmez — aktif bir aboneliğiniz varsa Ayarlar &gt; Abonelikler veya uygulama içindeki &ldquo;Abonelikleri
        Yönet&rdquo; bağlantısı üzerinden ayrıca iptal etmeniz gerekir.
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
        <strong>İlan linkiyle otomatik doldurma.</strong> Bu isteğe bağlı özellikte yapıştırdığınız ilan bağlantısı (ör.
        sahibinden.com, arabam.com) doğrudan geliştirici sunucusuna gönderilmez; cihazınızda, uygulama içinde görünmeyen
        bir tarayıcı bileşeniyle sanki siz açmışsınız gibi açılır. Sayfadan yalnızca araç bilgilerini (marka, model,
        yıl, km, fiyat, açıklama gibi metin alanları) içeren kısa bir özet çıkarılır ve bu özet, form alanlarını
        doldurmak üzere yalnızca o an OpenRouter üzerinden geçici olarak işlenir; sunucuda kalıcı olarak saklanmaz.
        Fotoğraflar indirilmez veya işlenmez, yalnızca ilanın orijinal sayfasına aittir. Bu özellik yalnızca siz bir
        bağlantı yapıştırıp &ldquo;İlanı analiz et&rdquo;e bastığınızda çalışır. İşlem sürerken uygulamayı arka plana
        alırsanız (ana ekrana dönme/kilitleme) analiz kısa bir süre daha devam edebilir ve tamamlandığında cihazınıza
        yerel bir bildirim gönderilir — bu bildirim için izin isteği yalnızca bu özelliği ilk kullandığınızda gösterilir
        ve tamamen isteğe bağlıdır, reddederseniz özellik yine de çalışmaya devam eder. İlan metninde satıcıya ait
        telefon, e-posta veya plaka gibi bilgiler geçiyorsa, bu bilgiler OpenRouter&apos;a gönderilmeden hemen önce
        otomatik olarak kaldırılır.
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
        <strong>Konum.</strong> Masraf tahmini ekranındaki &ldquo;Konumuma göre tahmin et&rdquo; ve Yakınımdaki
        Hizmetler ekranı gibi isteğe bağlı özellikler, yalnızca siz açıkça başlattığınızda cihazınızdan anlık konum
        ister. Konumunuz şehrinizi bulmak için OpenStreetMap&apos;e, yakındaki ekspertiz/noter/servis önerileri için
        Google Places&apos;a geçici olarak iletilir; sunucumuzda kalıcı olarak saklanmaz, reklam veya izleme amacıyla
        kullanılmaz.
      </p>
      <p>
        <strong>Yurt dışı veri aktarımı.</strong> OpenRouter (AI işleme), Upstash (sunucu tarafı veritabanı altyapısı),
        OpenStreetMap ve Google Places (konum tabanlı öneriler) yurt dışında barındırılan hizmetlerdir; yukarıda
        açıklanan sınırlı veriler bu sağlayıcıların sunucularında işlenebilir. Uygulama bu sağlayıcılar ve Supabase
        (hesap kimlik doğrulama) dışında hiçbir üçüncü tarafla veri paylaşmaz ve verinizi satmaz.
      </p>
      <p>
        <strong>Verilerinizi yönetme ve silme.</strong> Analizlerim ekranındaki kayıtları tek tek silebilirsiniz. Araç,
        hatırlatma, gider ve sağlık karnesi kayıtları bu cihazda tutulur; uygulamayı kaldırdığınızda veya cihazın
        uygulama verilerini temizlediğinizde yerel kayıtlar da silinir. Varsa yukarıda açıklanan sunucu tarafı bildirim
        kopyaları, uygulama uzun süre senkronize olmadığında otomatik süre sonunda temizlenir.
      </p>
      <p>
        <strong>KVKK kapsamındaki haklarınız.</strong> 6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun 11.
        maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme,
        düzeltilmesini veya silinmesini isteme ve işlemeye itiraz etme haklarına sahipsiniz. Araç ve analiz kayıtlarınız
        cihazınızda kaldığından bu haklarınızı büyük ölçüde doğrudan, aracı olmadan kullanabilirsiniz. Hesap
        bilgileriniz (e-posta, ad/soyad) için Profil ekranındaki &ldquo;Hesabımı sil&rdquo; ile silme hakkınızı doğrudan
        kullanabilirsiniz; düzeltme veya bilgi talebi ile sunucu tarafında tutulan sınırlı bildirim kopyası için ek bir
        talebiniz olursa{" "}
        <Link href="/destek" className="font-medium text-accent underline">
          destek sayfasından
        </Link>{" "}
        bize ulaşabilirsiniz.
      </p>
      <p>
        Analiz geçmişiniz (Analizlerim ekranındaki kayıtlar) tarayıcı oturumu kapansa bile bu cihazda saklanır;
        istediğiniz analizi Analizlerim ekranından tek tek silebilirsiniz.
      </p>
    </InfoPage>
  );
}
