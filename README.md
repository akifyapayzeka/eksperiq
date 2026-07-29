# eksperIQ

eksperIQ, ikinci el araç ilanı giren kullanıcıya kural tabanlı risk değerlendirmesi, satıcıya sorulacak sorular ve ekspertiz kontrol listesi sunan ücretsiz bir responsive web uygulamasıdır.

## Özellikler

- Manuel araç, hasar, bakım ve satıcı açıklaması girişi
- Mobil kullanım için form bölümü hızlı atlama bağlantıları
- Zorunlu ve detay alanları için canlı form ilerleme göstergesi
- Ücretli API kullanmadan kural tabanlı analiz motoru
- 100 üzerinden risk skoru ve kategori bazlı skorlar
- Öncelikli ilk aksiyonlar bölümü
- Dinamik satıcı soruları
- Ekspertizde kontrol edilecek noktalar
- Son kontrol listesi
- Yazdırma/PDF çıktısına uygun sonuç raporu
- Raporu yazdırma, rapor özetini ve satıcı sorularını panoya kopyalama
- Oturumdaki analiz sonucunu tek tıkla silme
- Veriyi sunucuya kaydetmeyen sessionStorage tabanlı ilk sürüm

## Ürün ekran akışı

1. Kullanıcı ana sayfadaki `Ücretsiz analiz et` çağrısıyla analiz formuna geçer.
2. Analiz formunda araç, hasar, bakım, evrak ve satıcı açıklaması alanlarını manuel doldurur.
3. Form ilerleme göstergesi zorunlu alanların ve ek detayların ne kadar tamamlandığını gösterir.
4. Bölüm hızlı atlama bağlantıları uzun formda araç, hasar, bakım, kontroller ve açıklama bölümlerine hızlı geçiş sağlar.
5. `Analiz oluştur` sonrası veriler sunucuya gönderilmeden tarayıcı oturumunda kural tabanlı analiz sonucu üretilir.
6. Sonuç ekranında risk skoru, kategori skorları, bilgi doluluğu, güçlü taraflar, öncelikli aksiyonlar, riskli noktalar, masraf sinyalleri ve satıcı soruları gösterilir.
7. Kullanıcı son kontrol listesini işaretleyebilir; işaretler yalnızca mevcut tarayıcı oturumunda korunur.
8. Rapor yazdırılabilir, rapor özeti veya satıcı soruları panoya kopyalanabilir.
9. `Oturum verisini sil` aksiyonu analiz sonucunu ve checklist durumunu temizler.
10. `/moduller` sayfası aktif ve planlanan modülleri merkezi modül kataloğundan gösterir.

## Uzun vadeli vizyon

EksperIQ yalnızca ikinci el ilan analiz eden bir araç olmayacak. Uzun vadeli hedef, Türkiye için araç satın almadan satışa kadar kullanılabilen yapay zekâ destekli kapsamlı bir araç asistanı geliştirmektir.

İlk sürüm yalnızca `İlan Analizi` modülünü aktif tutar. Gelecek modüller `src/lib/modules/registry.ts` içinde planlı ve birbirinden bağımsız ürün modülleri olarak tanımlanır:

- İlan Analizi
- Fotoğraftan Hasar Analizi
- Tahmini Onarım Maliyeti
- Ekspertiz Raporu Analizi
- Bakım Takibi
- Araç Sağlık Karnesi
- Araç Değer Takibi
- Akıllı Satış Hazırlığı

## Modüler mimari ilkeleri

- Her modül kendi analiz girdisi, çıktı tipi, servis katmanı ve kullanıcı arayüzüyle bağımsız geliştirilmelidir.
- Hiçbir modül diğer modülün iç implementasyonuna doğrudan bağımlı olmamalıdır.
- Ortak ihtiyaçlar `src/lib/services`, `src/lib/storage`, `src/lib/constants` veya ayrı ortak yardımcı katmanlarda tutulmalıdır.
- Yükleme, yapay zekâ, kullanıcı hesabı veya kalıcı veri gerektiren modüller açık kullanıcı onayı ve veri silme politikası olmadan etkinleştirilmemelidir.
- Hiçbir modül kesin ekspertiz, kesin hasar, kesin fiyat veya satın alma/satış garantisi vermemelidir.
- Ücretli servis, harici API anahtarı veya maliyet doğuracak entegrasyonlar açık karar olmadan eklenmemelidir.

## Fotoğraftan Hasar Analizi hazırlık modeli

`src/lib/photo-damage` klasörü, planlanan fotoğraf modülü için yalnızca ortak veri sözleşmesini içerir. Bu katman dosya yükleme, görsel işleme, yapay zekâ çağrısı veya ücretli servis entegrasyonu yapmaz.

Gelecekte bu modül etkinleştiğinde her bulgu araç bölgesi, hasar sinyali, 0-100 olasılık, düşük/orta/yüksek güven seviyesi, açıklama ve öneri alanlarıyla dönmelidir. Modül hiçbir zaman kesin hasar iddiası veya onarım garantisi üretmemelidir.

## Kural geri bildirimi

Gerçek kullanıcı geri bildirimleri önce `docs/feedback-rule-expansion.md` sürecine ve GitHub issue şablonuna alınır. Kod tarafındaki `src/lib/feedback/rule-candidates.ts` dosyası, henüz aktif analiz motoruna bağlanmamış kural adaylarını izlemek için kullanılır.

Bir aday yalnızca kullanıcı geri bildirimi netleştiğinde, pozitif/negatif test senaryoları yazıldığında ve ilgili `src/lib/analysis/rules` dosyasına kontrollü şekilde taşındığında aktif kurala dönüşmelidir.

## Kullanılan teknolojiler

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui uyumlu bileşen yapısı
- React Hook Form
- Zod
- Lucide Icons
- ESLint
- Prettier
- Vitest
- Playwright

## Yerel kurulum

```bash
npm install
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışır.

## Test komutları

```bash
npm run lint
npm run typecheck
npm run test
npm run e2e
npm run ai:env-check
```

## Build komutu

```bash
npm run build
```

## Vercel deploy adımları

1. Yeni ve bağımsız bir GitHub deposu oluşturun. Önerilen ad: `eksperiq`.
2. Bu projeyi depoya push edin.
3. Vercel üzerinde yeni proje oluşturup bu depoyu seçin.
4. Framework olarak Next.js algılanır. Kural tabanlı MVP için environment variable gerekmez.
5. Opsiyonel AI notu açılacaksa `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_DAILY_REQUEST_LIMIT` ve `NEXT_PUBLIC_AI_ANALYSIS_NOTE_ENABLED` değişkenlerini girin.
6. Merkezi günlük limit için opsiyonel `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` kullanılabilir.
7. Deploy komutları varsayılan Next.js ayarlarıyla çalışır.
8. Preview sonrası `npm run ai:staging-check` ile canlı endpoint davranışını doğrulayın.

## Netlify deploy adımları

1. Yeni ve bağımsız GitHub deposunu Netlify'a bağlayın.
2. Build command: `npm run build`
3. Publish directory: `out`
4. Proje statik export ürettiği için ek Next.js runtime zorunlu değildir.
5. Ek environment variable gerekmez.

## Hostinger deploy adımları

Hostinger shared hosting için statik paket oluşturun:

```bash
npm run hostinger:package
```

Oluşan `dist/eksperiq-hostinger-static.zip` dosyasını Hostinger File Manager içinde `public_html` klasörüne yükleyip çıkarın. Paket içinde route yenilemeleri için `.htaccess` dosyası bulunur.

Detaylı Hostinger yayın akışı için `docs/hostinger-deploy.md` dosyasını inceleyin.

## App Store hazırlığı

EksperIQ bir web uygulamasıdır; App Store yayını için ayrıca Apple Developer Program üyeliği, macOS, Xcode ve native iOS paketleme gerekir. Projede PWA manifest, iOS ana ekran metadata ve ikon dosyaları hazırdır.

Native wrapper hazırlığı için Capacitor konfigürasyonu eklenmiştir. Web çıktısını native projeye hazırlamak için:

```bash
npm run native:build
```

App Store metin, screenshot ve ikon kaynak paketini hazırlamak için:

```bash
npm run appstore:package
```

macOS/Xcode ortamında iOS proje üretimi için:

```bash
npm run ios:add
npm run ios:sync
npm run ios:open
```

Detaylı yayın hazırlığı, gizlilik beyanı ve native wrapper ilkeleri için `docs/app-store-readiness.md` dosyasını inceleyin.

## Yayın operasyon checklist'i

Vercel, Hostinger ve App Store/TestFlight hazırlığı için tek kontrol listesi `docs/release-operations-checklist.md` dosyasındadır.

## Proje sınırlamaları

- Profesyonel ekspertizin yerine geçmez.
- Resmî kayıt sorgusu yapmaz.
- İlan sitelerini scrape etmez.
- Fotoğraf yükleme veya görüntü analizi içermez.
- Kullanıcı hesabı ve kalıcı veritabanı yoktur.
- Skor genel karar desteğidir; aracın güvenli, hasarsız veya satın almaya uygun olduğunu garanti etmez.
- Piyasa fiyatı karşılaştırması yapmaz; fiyat tarafında yalnızca kullanıcının girdiği tramer/fiyat oranı gibi genel sinyaller değerlendirilir.
- Yazdırma/PDF çıktısı tarayıcının sayfa kırma davranışına bağlıdır.

## Gelecek geliştirmeler

- Supabase ile isteğe bağlı kullanıcı hesabı ve kayıtlı analizler
- Fotoğraftan olası hasar analizi
- Tahmini onarım maliyeti aralıkları
- Ekspertiz raporu PDF/fotoğraf analizi
- Bakım takibi ve araç sağlık karnesi
- Araç değer takibi ve akıllı satış hazırlığı
- Daha gelişmiş PDF dışa aktarma
- Resmî kayıt kontrolü için kullanıcı yönlendirme rehberleri
- Daha kapsamlı erişilebilirlik ve tarayıcı uyumluluk testleri
