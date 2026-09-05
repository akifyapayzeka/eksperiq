# Build 65 Checklist

Durum: **Build 65 henüz üretilmedi.** App Store Connect'teki son ikili hâlâ
Build 61 (25 Ağustos 2026 reddi bu ikiliye ait). Aşağıdaki değişikliklerin
hiçbiri şu an hiçbir ikilinin içinde değil — hepsi yalnızca kodda duruyor.

> **Merge ≠ Build.** Dalı `master`'a merge etmek uygulamaya hiçbir şey koymaz.
> Apple'ın incelediği şey `ios-testflight.yml` workflow'unun macOS runner'da
> ürettiği IPA. O workflow `workflow_dispatch` olduğu için merge edilmemiş bir
> daldan da çalıştırılabilir. Merge'in faydası ayrı: master'ın tek doğru kaynak
> olması ve hiçbir işin dalda unutulmaması.

Versiyon ayarları hazır (`ios/App/App.xcodeproj/project.pbxproj`):

```
CURRENT_PROJECT_VERSION = 65
MARKETING_VERSION       = 1.0
```

## Build 65'e girecek değişiklikler

### Apple reddine (25 Ağustos 2026) doğrudan cevap veren işler

- [x] **2.1(a) — demo hesap / "An error appeared while signing up".** Hesap,
      giriş, kayıt ve e-posta doğrulama sistemi tamamen kaldırıldı; Pro/Pro+
      artık hesapsız StoreKit üzerinden çalışıyor. Hatanın kaynağı ortadan
      kalktı. App Store Connect'te `demoAccountRequired: false` (ölçüldü).
      Commit: `7e9cd1f`
- [x] **Hesap kaldırma sonrası canlıda kalan yanlış metin.** Ana sayfa,
      `/analiz`, `/profil` ve `/gizlilik`'te ortak kullanılan gizlilik metni
      hâlâ "Hesabınız yalnızca Pro/Pro+ abonelik ve giriş içindir" diyordu;
      `curl` ile production'da doğrulandı ve düzeltildi. Commit: `703499a`
- [x] **1.5 — Support URL çalışmıyor.** `/destek` sayfası canlı (HTTP 200) ve
      App Store Connect'teki `supportUrl` alanı buraya bakıyor (ölçüldü).
- [x] **3.1.2(c) — abonelik metadata.** tr açıklamada EULA, gizlilik, kullanım
      koşulları ve otomatik yenileme metni var (2238 karakter, ölçüldü);
      `privacyPolicyUrl` dolu. Altı ürünün hepsinde tr lokalizasyon, fiyat ve
      review ekran görüntüsü mevcut (`COMPLETE`).
- [ ] **2.1(b) — IAP review'a gönderilmemiş.** Altı ürün de
      `READY_TO_SUBMIT`. Yeni abonelik grubu tek başına gönderilemiyor; Build
      65'in sürüm gönderimiyle **birlikte** gidecek.

### Ölçülerek bulunmuş gerçek kullanıcı hataları (her biri önce kırmızı testle)

- [x] **Muayene tarihi mantığı** tek kaynağa alındı
      (`src/lib/analysis/inspection.ts`). Süresi geçmiş muayene artık
      "yaklaşıyor" değil, ayrı ve yüksek önemde bulgu (`inspection-expired`).
      Commit: `3ea238f`
- [x] **Yılı bilinmeyen ilanlarda uydurma kilometre yorumu.** Başlıktan yıl
      çıkarılamadığında `yearIsEstimated` işaretleniyor, kilometre kuralları
      susuyor, özet "0 km / X yaşında" yerine "hesaplanamadı" diyor.
      Commit'ler: `3ea238f`, `255a7e2`
- [x] **İlan başlığı marka eşleşmesi.** "mini onarım" gibi ifadeler marka
      olarak okunuyordu; kelime sınırı + yalnızca başlıktan çıkarım.
      Commit: `5b9464a`
- [x] **Depolama dolduğunda sessiz veri kaybı.** `saveAnalysis` artık sonuç
      döndürüyor; yazma başarısızsa fotoğraflar düşürülüp tekrar deneniyor,
      olmuyorsa kullanıcıya söyleniyor ve kota harcanmıyor. Commit: `5b9464a`
- [x] **Ücretsiz kota** 1000'den 3'e çekildi (1000 fiilen sınırsızdı).
      Commit: `3ea238f`
- [x] **Ölü ikinci bayrak kopyası** kaldırıldı. Commit: `cee439d`
- [x] **Karşılaştırma modülü ulaşılamazdı.** `addToComparison` hiçbir yerden
      çağrılmıyordu; modül `status: "active"` listeleniyor ve `/karsilastirma`
      kullanıcıya var olmayan bir "sonuç sayfasındaki buton"u tarif ediyordu.
      Giriş noktası `/analizlerim`'e kondu (sonuç ekranına buton eklenmedi —
      o ekran bilinçli olarak tek aksiyonla sade tutuluyor). Commit: `766c4b5`
- [x] **"Verilerim" ekranı yoktu.** `deleteAllLocalData`, `exportDataAsJson`,
      `importDataFromJson` ve `getStorageUsageSummary` yazılmış ve birim
      testleri varken onları çağıran bileşen silinmişti — kullanıcının verisini
      toptan silmesinin veya yedeklemesinin hiçbir yolu yoktu. Profil ekranına
      "Verilerim" bölümü eklendi: kullanılan alan, JSON dışa aktarma, yedeği
      geri yükleme ve iki adımlı onayla ("SİL" yazma) toptan silme. Silmede
      sunucudaki bildirim kaydı doğrulanamazsa bu kullanıcıya dürüstçe
      söyleniyor. `/gizlilik` metni de buna göre güncellendi.
- [x] **Bildirim senkronu sessizce başarısız oluyordu.** `syncRemindersToPush`
      `response.ok`'a hiç bakmıyordu (`fetch` 500'de reddetmez) ve ağ hatasını
      yutuyordu; dönüş tipi `void` olduğu için çağıran öğrenemiyordu. Bildirimi
      gönderen sunucu cron'u yalnızca kendisine ULAŞAN kayıtları bildiğinden,
      kullanıcı MTV/sigorta/muayene hatırlatması ekliyor, "Kayıt eklendi."
      görüyor ve bildirim hiç gelmiyordu. Artık `{ synced: boolean }` dönüyor
      ve başarısızlıkta ekranda uyarı çıkıyor. Commit: `a269056`
- [x] **"Satıcı mesajını kopyala" yanlış bildirim veriyordu** ("Rapor özeti
      panoya kopyalandı."). Commit: `30feafc`
- [x] **Teşhis aracının kendisi kördü.** `js-client-timeout-grace` adımı
      gönderiliyor ama endpoint'in allowlist'inde olmadığı için 400 ile
      sessizce düşüyordu; logları okuyan kişi "grace yolu hiç çalışmamış"
      sanırdı. İki listeyi birbirine bağlayan test eklendi. Commit: `e3b6912`
- [x] **Ölü `report-summary.ts` modülü silindi.** Satıcı mesajının ikinci,
      hiç kullanılmayan şablonuydu; birim testi de "test edilmiş" görüntüsü
      veriyordu. Kullanıcının gördüğü canlı metin `result-client.tsx`'te ve
      E2E ile doğrulanıyor.
- [x] **Aynı analiz iki kez karşılaştırmaya eklenebiliyordu** — üç kontenjandan
      ikisini aynı araca harcıyor, ekran aracı kendisiyle kıyaslıyordu.
      `generatedAt` üzerinden mükerrer koruması. Commit: `766c4b5`

### Gelir tarafı

- [x] **PDF raporu gerçekten ücretli fayda oldu.** Pro faydası olarak vaat
      ediliyor ama ücretsiz pakete de veriliyordu. Commit: `96150f7`
- [x] **Paywall varsayılanı yıllık**, tasarruf oranı (%17) ve "2 ay bedava"
      pazarlama rakamı değil, planın kendi fiyatlarından hesaplanıyor.
      Commit: `50be419`
- [x] **Haftalık plan eklendi** (`com.eksperiq.app.pro.weekly`,
      `com.eksperiq.app.proplus.weekly`). Haftalığın birim başına pahalı
      olduğu kullanıcıya açıkça söyleniyor. Commit: `df25161`

### Kalite kapıları

- [x] **Abonelik level uyuşmazlığı artık uyarı değil kapı.** Politika tek
      kaynakta (`scripts/lib/subscription-levels.mjs`); uyuşmazlıkta betik
      `exit 1` veriyor. Commit'ler: `22347b1`, `b3a88c0`
- [x] **E2E paketi uygulamanın gerçek haline bağlandı.** 15 test bu depoda hiç
      geçmemişti (kök commit'te, uygulamanın hiç sahip olmadığı bir UI'ı tarif
      ederek geldiler) ve CI 25 Ağustos'tan beri hiçbir koşuyu tamamlamadığı
      için kimse görmedi. Hiçbir iddia silinerek/gevşetilerek değil, gerçek
      davranışa bağlanarak düzeltildi. Commit: `766c4b5`

## 15'inde yapılacaklar — sırayla

1. **GitHub Actions faturasını aç.** Kilit açılmadan hiçbir CI koşusu runner
   alamıyor (koşular 3 saniyede, log üretmeden `failure` oluyor).
2. ~~**Haftalık ürünlerin Subscription Level'ını düzelt.**~~ **YAPILDI**
   (5 Eylül 2026). Ölçüm: `npm run storekit:products-check` artık
   `EXIT=0` ve "check passed" diyor — altı ürünün hepsi doğru kademede
   (`pro.*` = 2, `proplus.*` = 1).
3. **CI'ı yeşile al.** PR #49'da `ci.yml` koşsun; format/typecheck/lint/unit/
   build/privacy/claims/appstore-metadata + Playwright E2E (chromium/webkit).
4. **Merge** (senin açık onayınla) — master tek doğru kaynak olsun.
5. **`ios-testflight.yml` workflow'unu `submit: true` ile çalıştır.** Build 65
   IPA'sı burada üretilip TestFlight'a yüklenir. `workflow_dispatch` olduğu
   için istenen dal seçilebilir.
6. **App Store Connect'te sürüm 1.0'a Build 65'i bağla** ve sürümü **altı
   abonelikle birlikte** review'a gönder (yeni grup tek başına gönderilemiyor).
7. **Ekran kaydını ekle** (Apple'ın 2.1 talebi için).

## Build 65'e girmeyen, hâlâ açık işler

- [ ] **Fiziksel cihazda StoreKit sandbox satın alma/restore testi.** Bu
      yapılmadan `NEXT_PUBLIC_STOREKIT_PURCHASES_ENABLED` açılamıyor; şu an
      kapalı olduğu için "Satın alımları geri yükle" butonu gizli — bu bir
      3.1.1 riski.
- [ ] **Ücretsiz deneme (introductory offer)** altı ürünün hiçbirinde tanımlı
      değil. Zorunlu değil, dönüşümü artırır.
- [ ] **`api/debug/listing-import-trace.js` hâlâ production'da.** Kodun kendi
      yorumu "ilan içe aktarma takılması kök nedeni bulunduğunda silinebilir"
      diyor. Takılma çözüldüyse endpoint ve onu çağıran JS/Swift `trace`
      satırları Build 65'ten önce kaldırılmalı. Ayrıca tek fail-open nokta bu:
      rate limiter çökerse isteği geçiriyor (bilinçli tercih, yalnızca
      `console.log` yapıyor — riski log gürültüsü, veri sızıntısı değil).
- [ ] **Haftalık fiyatlar** App Store Connect'te 79,99 / 199,99 TL girilmiş;
      kodda hedef 75 / 200 idi. Paywall gerçek App Store fiyatını gösterdiği
      için kullanıcıya yanlış rakam gitmiyor — dokunmaya gerek yok, bilgi.
