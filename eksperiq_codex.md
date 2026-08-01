# EksperIQ — Proje Durumu (Codex/Claude için ortak referans)

Bu dosya EksperIQ projesinin güncel durumunu tutar. Claude Code bu dosyayı her
tamamlanmış işten sonra günceller; amaç, ChatGPT Codex veya başka bir asistanla
devam edilirse bağlamın kaybolmamasıdır. Yeni bir oturuma başlarken önce bu
dosyayı okuyun.

Son güncelleme: 2026-08-01 (Claude Code)

## Ürün özeti

EksperIQ, Türkiye pazarı için ikinci el araç alım/satım ve araç sahipliği
sürecinde karar desteği veren mobil öncelikli web/PWA uygulamasıdır (Capacitor
ile iOS native paketleme de var). Uygulama **kesin ekspertiz sonucu vermez**;
risk skoru, kontrol listesi, satıcıya sorulacak sorular, bakım/hasar/evrak
uyarıları üretir. Bu ilke tüm modüllerde korunmalıdır: hiçbir yerde "kesin",
"garanti", "hasarsızdır" gibi kesin hüküm ifadesi kullanılmaz.

- Canlı site: https://eksperiq.vercel.app
- Repo: https://github.com/akifyapayzeka/eksperiq
- Geliştirme dalı: `claude/eksperiq-app-development-mr9eed`

## Teknoloji yığını

Next.js App Router, TypeScript strict, Tailwind CSS, React Hook Form, Zod,
Lucide Icons, Vitest, Playwright, Capacitor iOS, Vercel deploy.
`/api/*.js` klasöründeki dosyalar plain CommonJS Vercel serverless
fonksiyonlarıdır (Next.js route handler değil).

## Aktif modüller (13) — `src/lib/modules/registry.ts`

1. **İlan Analizi** (`/analiz`, `/sonuc`) — kural tabanlı risk skoru, satıcı
   soruları, ekspertiz kontrol listesi. Veriler sessionStorage'da (oturum
   bazlı, kalıcı değil).
2. **Fotoğraftan Hasar Analizi** (`/fotograf-hasar`) — manuel bulgu ekleme +
   opsiyonel AI destekli kontrol (`NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED` flag'i
   ile açılır, `api/ai/photo-damage.js`). AI hiçbir zaman kesin hasar iddiası
   üretmez; kesin dil otomatik yumuşatılır (`hedgeCertainLanguage`).
3. **Tahmini Onarım Maliyeti** (`/onarim-maliyeti`)
4. **Ekspertiz Raporu Analizi** (`/ekspertiz-raporu`)
5. **Bakım Takibi** (`/bakim-takibi`) — km/tarih bazlı genel hatırlatma
   hesaplayıcı (kayıt tutmaz, yalnızca hesaplama).
6. **Bakım ve Ödeme Takvimi** (`/bakim-odeme-takvimi`) — MTV, trafik
   sigortası, kasko, muayene, bakım gibi tarihleri tek ekranda takip eder.
   localStorage'da saklanır. **Gerçek push bildirimi** altyapısı var (bkz.
   aşağıdaki "Push bildirim altyapısı" bölümü).
7. **Test Sürüşü Kontrol Listesi** (`/test-surusu-kontrol`) — adım adım,
   sessionStorage tabanlı checklist.
8. **Resmi Sorgu Rehberi** (`/resmi-sorgu-rehberi`) — TRAMER, muayene, MTV
   borcu, rehin/haciz, ruhsat, sigorta bilgisini nereden doğrulayacağını
   anlatır. Hiçbir sorguyu kendisi yapmaz/scrape etmez. Yalnızca
   `turkiye.gov.tr` (e-Devlet) gibi tek, güvenilir/bilinen kök alan adına
   referans verir; başka hiçbir spesifik URL uydurulmaz (bkz. "URL
   politikası").
9. **Gider Defteri** (`/gider-defteri`) — yakıt/bakım/sigorta/vergi/diğer
   giderleri kaydeder, aylık grafik (dataviz skill kurallarına göre: tek
   seri, ince çubuk, tablo görünümü fallback) + yaklaşık km başı maliyet
   gösterir. localStorage.
10. **Araç Sağlık Karnesi** (`/arac-saglik-karnesi`) — zaman çizelgesi +
    "Yaklaşan tarihler" widget'ı (Bakım ve Ödeme Takvimi'nden) + isteğe bağlı
    0-100 skor alanı ile **sağlık skoru trend grafiği** (SVG line chart).
    localStorage (önceden yalnızca component state'teydi ve reload'da
    siliniyordu — bu bir bug'dı, düzeltildi).
11. **Araç Değer Takibi** (`/arac-deger-takibi`)
12. **Akıllı Satış Hazırlığı** (`/satis-hazirligi`)
13. **Karşılaştırmalı İlan Analizi** (`/karsilastirma`) — `/sonuc` sayfasından
    "Karşılaştırmaya ekle" ile en fazla 3 analiz sonucu yan yana
    (risk skoru, fiyat, km, bulgu sayısı) karşılaştırılır. localStorage.

Hiçbir modül "planned"/"yakında" durumunda değil — hepsi aktif ve gerçek
sayfalara bağlı.

## Veri saklama ilkeleri

- **sessionStorage**: İlan Analizi sonucu, kontrol listesi işaretleri, test
  sürüşü checklist'i, resmi sorgu checklist'i — sekme kapanınca/oturum
  bitince silinir. Kasıtlı: "hesap yok, kalıcı kayıt yok" MVP ilkesi.
- **localStorage**: Bakım ve Ödeme Takvimi, Gider Defteri, Araç Sağlık
  Karnesi kayıtları, Karşılaştırma listesi — cihazda kalıcı, hesaba veya
  sunucuya bağlı değil. Bunlar aylar süren takip gerektirdiği için bilinçli
  olarak sessionStorage yerine localStorage kullanır.
- **Sunucu (Upstash Redis, opsiyonel)**: Yalnızca AI günlük kullanım
  sayaçları ve (bildirim açılırsa) push abonelikleri + ilgili hatırlatma
  kopyası. Upstash ayarlı değilse in-memory fallback kullanılır (yalnızca
  local/dev için yeterli; production'da push bildirimlerinin gerçekten
  çalışması için Upstash ZORUNLU, çünkü serverless instance'lar arası
  memory paylaşılmaz).

## Push bildirim altyapısı (Bakım ve Ödeme Takvimi)

Gerçek Web Push ile çalışır (uygulama kapalıyken de bildirim gelir):

- `public/sw.js` — service worker (push + notificationclick handler).
- `src/lib/push/client.ts`, `src/lib/push/vapid.ts` — client-side subscribe/
  unsubscribe/sync.
- `api/push/subscribe.js`, `api/push/unsubscribe.js` — abonelik kaydı.
- `api/_lib/push-store.js` — Upstash/memory fallback storage.
- `api/cron/check-reminders.js` — günlük çalışan Vercel Cron job
  (`vercel.json`), her hatırlatma için 30 gün ve 15 gün kala bildirim
  gönderir, eşik başına tekrar göndermez (dedup).
- `scripts/generate-vapid-keys.mjs` (`npm run push:generate-vapid-keys`).

**Production'da devreye almak için gerekli env değişkenleri** (henüz
ayarlanmadı, kod hazır):

- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
  (yukarıdaki script ile üretilir)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (zorunlu, yoksa cron
  hiçbir aboneliği hatırlamaz)
- `CRON_SECRET` (opsiyonel ama production'da önerilir)

**Native iOS (Capacitor) sınırlaması**: Bu Web Push altyapısı web/PWA
sürümünde çalışır. Capacitor ile paketlenen native iOS uygulamasında aynı
bildirim davranışı için ayrıca `@capacitor/push-notifications` eklentisi ve
Apple Push Notification servisi (APNs) sertifika/anahtar kurulumu gerekir —
bu bir **Apple Developer hesabı** gerektirir ve bu ortamda yapılamaz, henüz
yapılmadı.

## URL politikası (önemli, tekrar tekrar dikkat edilmeli)

Resmi Sorgu Rehberi gibi ekranlarda **asla tahmini/uydurma URL yazılmaz**.
Yalnızca `turkiye.gov.tr` gibi kesin bilinen, stabil kök alan adları
kullanılır; TÜVTÜRK, SBM gibi diğer kurumlar yalnızca isimle anılır, spesifik
sayfa linki verilmez (linkler zamanla değişebilir ve doğrulanamaz).

## iOS App Store hazırlığı — durum

- Capacitor iOS projesi var (`ios/` klasörü).
- `Info.plist`'e `NSCameraUsageDescription` / `NSPhotoLibraryUsageDescription`
  eklendi (önceden eksikti — kullanıcı "Fotoğraf çek" derse uygulama
  çökerdi, bu düzeltildi).
- Bildirim izni (Web Push) yalnızca kullanıcı Bakım ve Ödeme Takvimi'nde
  "Bildirimleri aç" derse istenir; App Store/gizlilik dokümanları buna göre
  güncellendi (`docs/app-store-*.md`, `docs/ios-*.md`,
  `docs/testflight-qa-checklist.md`).
- **Yapılamayan/eksik kalan**: Gerçek iPhone + Xcode testi, Apple Developer
  hesabı gerektiren adımlar (native push APNs kurulumu, TestFlight yükleme).
  Bunlar bu bulut/Linux ortamında fiziksel olarak yapılamaz.

## Bu oturumda düzeltilen gerçek bug'lar

1. Fotoğraf AI kesin hasar ifadesi kullanabiliyordu → sunucu tarafında
   otomatik yumuşatma eklendi.
2. `Info.plist`'te kamera/fotoğraf izin metni eksikti → eklendi.
3. Triger/şanzıman bakım alanında kullanıcı "Bilinmiyor" dediğinde sistem
   bunu "düşük risk" gibi gösteriyordu (`maintenanceHistoryUnresolved`
   eklenerek düzeltildi).
4. README.md, zaten canlı olan 6-7 özelliği "gelecekte yapılacak" diye
   yanlış tanıtıyordu → güncellendi.
5. Araç Sağlık Karnesi'ndeki "Kayıt ekle" kayıtları yalnızca component
   state'te tutuluyordu, sayfa yenilenince siliniyordu → localStorage'a
   taşındı.

## Test ve doğrulama komutları

İş bitmeden önce hepsi geçmeli:

```bash
npm run lint
npm run typecheck
npm run test
npx playwright test tests/e2e/main-flow.spec.ts tests/e2e/module-tools.spec.ts tests/e2e/button-actions.spec.ts --reporter=line
npm run release:check
npm run deploy:check
```

Not: Bu sandbox ortamında Playwright'ın pinlediği Chromium build'i
`/opt/pw-browsers` altında farklı bir sürüm numarasıyla geliyor; testleri
çalıştırmak için geçici bir `playwright.local.config.ts` (executablePath
override) kullanılıp iş bitince silindi — repoya commit edilmedi.

## Devam eden görevler (bu oturumda henüz bitmemiş)

- **Model bazlı sık sorulan noktalar**: Marka/model bazlı "dikkat edilecek
  noktalar" özelliği — kesin arıza iddiası olmadan, soru önerisi formatında
  planlanıyor. Henüz yazılmadı.
- **iOS ana ekran widget'ı**: WidgetKit/Swift + Xcode gerektirir, bu ortamda
  gerçek şekilde build/test edilemez; yalnızca not/scaffold bırakılacak.

## Genel ilkeler (her yeni özellikte hatırlanmalı)

- Kesin hüküm/garanti ifadesi yok.
- Ücretli servis, gizli anahtar commit etme, ilan sitesi scraping yok.
- Uygulama sade kalmalı, kullanıcıyı yormamalı — yeni modül eklerken bunu
  göz önünde bulundur (kullanıcı bu konuda açıkça uyardı: "Eksperiq
  uygulaması sade ve anlaşılır olacak kullanıcıyı yormayacak").
- Her yeni özellik: unit test + (mümkünse) e2e test + yukarıdaki tam
  doğrulama komutları + commit + push ile tamamlanmalı.
