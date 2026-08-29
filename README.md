# EksperIQ

EksperIQ, ikinci el araç ilanı giren kullanıcıya kural tabanlı risk değerlendirmesi, satıcıya sorulacak sorular ve ekspertiz kontrol listesi sunan ücretsiz bir responsive web uygulamasıdır. İlan analizinin yanı sıra fotoğraftan olası hasar kontrolü, ekspertiz raporu sadeleştirme, bakım/sağlık/değer takibi, satış hazırlığı ve MTV/sigorta/muayene gibi tarihleri push bildirimiyle takip eden bağımsız modüller de aktiftir (`/moduller`).

## Özellikler

- Manuel araç, hasar, bakım ve satıcı açıklaması girişi
- Mobil kullanım için form bölümü hızlı atlama bağlantıları
- Klavye açmadan seçilebilen şehir, araç detay ve hasar parça alanları
- Zorunlu ve detay alanları için canlı form ilerleme göstergesi
- Ücretli API kullanmadan kural tabanlı analiz motoru
- 100 üzerinden risk skoru ve kategori bazlı skorlar
- Öncelikli ilk aksiyonlar bölümü
- Dinamik satıcı soruları
- Ekspertizde kontrol edilecek noktalar
- Son kontrol listesi
- Yazdırma/PDF çıktısına uygun sonuç raporu
- Raporu yazdırma, rapor özetini, satıcı sorularını ve satıcıya gönderilecek kısa mesajı panoya kopyalama
- Oturumdaki analiz sonucunu tek tıkla silme
- Fotoğraftan olası hasar kontrolü (opsiyonel AI destekli, feature flag ile kapalı/açık); kaydedilen analizler fotoğraflarıyla birlikte Analizlerim'de listelenir
- Ekspertiz raporu metnini sadeleştirme
- Bakım ve Ödeme Takvimi: MTV, trafik sigortası, kasko, muayene ve bakım tarihlerini tek ekranda takip etme; isteğe bağlı olarak son tarihten 30 ve 15 gün kala push bildirimi
- Analiz sonucu sunucuya kaydedilmeyen sessionStorage tabanlı ilk sürüm; Bakım ve Ödeme Takvimi kayıtları ise aylar boyunca takip edilebilmesi için cihazda localStorage ile saklanır (bildirim açılırsa sunucuda yalnızca push aboneliği ve ilgili tarih kopyası tutulur)

## Ürün ekran akışı

1. Kullanıcı ana sayfadaki `Ücretsiz analiz et` çağrısıyla analiz formuna geçer.
2. Analiz formunda araç, hasar, bakım, evrak ve satıcı açıklaması alanlarını manuel doldurur; uygun alanlarda hazır seçenekleri kullanır.
3. Form ilerleme göstergesi zorunlu alanların ve ek detayların ne kadar tamamlandığını gösterir.
4. Bölüm hızlı atlama bağlantıları uzun formda araç, hasar, bakım, kontroller ve açıklama bölümlerine hızlı geçiş sağlar.
5. `Analiz oluştur` sonrası veriler sunucuya gönderilmeden tarayıcı oturumunda kural tabanlı analiz sonucu üretilir.
6. Sonuç ekranında risk skoru, kategori skorları, bilgi doluluğu, güçlü taraflar, öncelikli aksiyonlar, riskli noktalar, masraf sinyalleri ve satıcı soruları gösterilir.
7. Kullanıcı son kontrol listesini işaretleyebilir; işaretler yalnızca mevcut tarayıcı oturumunda korunur.
8. Rapor yazdırılabilir; rapor özeti, satıcı soruları veya satıcıya gönderilecek kısa mesaj panoya kopyalanabilir.
9. `Oturum verisini sil` aksiyonu analiz sonucunu ve checklist durumunu temizler.
10. `/moduller` sayfası aktif ve planlanan modülleri merkezi modül kataloğundan gösterir.

## Uzun vadeli vizyon

EksperIQ yalnızca ikinci el ilan analiz eden bir araç değil. Uzun vadeli hedef, Türkiye için araç satın almadan satışa ve sahiplik sürecine kadar kullanılabilen kapsamlı bir araç asistanı olmaktır.

Aşağıdaki modüllerin tamamı aktif ve birbirinden bağımsız `src/lib/modules/registry.ts` içinde tanımlıdır (`/moduller` sayfasından erişilebilir):

- İlan Analizi
- Fotoğraftan Hasar Analizi
- Tahmini Onarım Maliyeti
- Ekspertiz Raporu Analizi
- Bakım Takibi
- Bakım ve Ödeme Takvimi (MTV, sigorta, muayene, bakım — push bildirimli, çoklu araç)
- Test Sürüşü Kontrol Listesi
- Resmi Sorgu Rehberi
- Gider Defteri (çoklu araç)
- Karşılaştırmalı İlan Analizi
- Araç Sağlık Karnesi (çoklu araç)
- Araç Değer Takibi
- Akıllı Satış Hazırlığı

## Modüler mimari ilkeleri

- Her modül kendi analiz girdisi, çıktı tipi, servis katmanı ve kullanıcı arayüzüyle bağımsız geliştirilmelidir.
- Hiçbir modül diğer modülün iç implementasyonuna doğrudan bağımlı olmamalıdır.
- Ortak ihtiyaçlar `src/lib/services`, `src/lib/storage`, `src/lib/constants` veya ayrı ortak yardımcı katmanlarda tutulmalıdır.
- Yükleme, yapay zekâ, kullanıcı hesabı veya kalıcı veri gerektiren modüller açık kullanıcı onayı ve veri silme politikası olmadan etkinleştirilmemelidir.
- Hiçbir modül kesin ekspertiz, kesin hasar, kesin fiyat veya satın alma/satış garantisi vermemelidir.
- Ücretli servis, harici API anahtarı veya maliyet doğuracak entegrasyonlar açık karar olmadan eklenmemelidir.

## Fotoğraftan Hasar Analizi modeli

Fotoğraftan Hasar Analizi modülü aktiftir (`/fotograf-hasar`). `src/lib/photo-damage` klasörü, manuel bulgu ekranı ve AI kontrolü arasında paylaşılan ortak veri sözleşmesini (araç bölgesi, hasar sinyali, 0-100 olasılık, düşük/orta/yüksek güven seviyesi) tanımlar; bu katmanın kendisi dosya yükleme, görsel işleme veya yapay zekâ çağrısı yapmaz — bunlar `api/ai/photo-damage.js` ve `src/app/fotograf-hasar/page.tsx` içindedir.

AI destekli fotoğraf kontrolü `NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED` feature flag'i ile açılıp kapatılabilir ve `OPENROUTER_VISION_MODEL`/`OPENROUTER_API_KEY` gerektirir. Araç dışı görsellerde, ekran görüntülerinde veya bulanık/çok yakın çekimlerde bulgu üretmemesi, hiçbir zaman kesin hasar iddiası veya onarım garantisi vermemesi için hem prompt hem sunucu tarafı normalize edilmiştir (`tests/unit/photo-damage-endpoint.test.ts`).

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
npm run privacy:check
npm run rule-backlog:check
npm run rule-feedback:package
npm run rule-feedback:check
npm run user-tests:commands-check
npm run launch:check
npm run e2e
npm run ai:env-check
```

Yayın öncesi yerel preflight için:

```bash
npm run release:check
```

Manuel test akışı için: `docs/how-to-test.md`

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
6. Merkezi günlük AI limiti için opsiyonel `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` kullanılabilir. Bakım ve Ödeme Takvimi bildirimlerinin production'da çalışması için bu ikisi ZORUNLUDUR (serverless ortamda kalıcı depolama olmadan cron hiçbir aboneliği hatırlamaz).
7. Bakım ve Ödeme Takvimi bildirimleri için `npm run push:generate-vapid-keys` ile üretilen `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` değişkenlerini ve isteğe bağlı `CRON_SECRET`'i girin; `vercel.json` içindeki cron tanımı otomatik etkinleşir.
8. Deploy komutları varsayılan Next.js ayarlarıyla çalışır.
9. Preview sonrası `npm run ai:staging-check` ile canlı endpoint davranışını doğrulayın.

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
npm run appstore:prepare
```

macOS/Xcode ortamında iOS proje üretimi için:

```bash
npm run ios:add
npm run ios:sync
npm run ios:open
```

Detaylı yayın hazırlığı, gizlilik beyanı ve native wrapper ilkeleri için `docs/app-store-readiness.md` dosyasını inceleyin.

## Yayın operasyon checklist'i

Vercel, Hostinger ve App Store/TestFlight hazırlığı için ana operasyon listesi `docs/release-operations-checklist.md`, tüm adımların merkezi takip dosyası ise `docs/launch-master-checklist.md` içindedir.

## Proje sınırlamaları

- Profesyonel ekspertizin yerine geçmez.
- Resmî kayıt sorgusu yapmaz.
- İlan sitelerini scrape etmez.
- Kullanıcı hesabı yoktur. Analiz verisi kalıcı bir hesaba kaydedilmez; Bakım ve Ödeme Takvimi bildirimleri açılırsa yalnızca push aboneliği ve ilgili tarih/tutar kopyası sunucuda tutulur (bkz. `docs/app-store-privacy-answers.md`).
- Skor genel karar desteğidir; aracın güvenli, hasarsız veya satın almaya uygun olduğunu garanti etmez.
- Piyasa fiyatı karşılaştırması yapmaz; fiyat tarafında yalnızca kullanıcının girdiği tramer/fiyat oranı gibi genel sinyaller değerlendirilir.
- Yazdırma/PDF çıktısı tarayıcının sayfa kırma davranışına bağlıdır.
- Push bildirimleri Web Push standardıyla çalışır; Capacitor ile paketlenen native iOS uygulamasında aynı davranış için ayrıca APNs kurulumu (Apple Developer hesabı) gerekir, henüz yapılmamıştır.

## Gelecek geliştirmeler

- Native iOS uygulamasında APNs ile push bildirimi (`@capacitor/push-notifications`)
- Daha gelişmiş PDF dışa aktarma
- Daha kapsamlı erişilebilirlik ve tarayıcı uyumluluk testleri
- Gerçek Apple/Google uygulama içi satın alma (IAP) ile Pro abonelik (Apple Developer Program + Xcode gerektirir, henüz yapılmamıştır)
