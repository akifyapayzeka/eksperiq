# iOS Ana Ekran Widget'ı (WidgetKit) — Backlog

Bu tur kapsamına WidgetKit **dahil edilmedi** — spesifikasyonun 19. maddesi gereği yalnızca bu backlog dokümanı
hazırlandı. Depoda hiçbir widget hedefi (`.appex`/WidgetKit extension target'ı), widget Swift kodu veya App Group
yapılandırması yok.

## Neden bu turda yapılmadı

WidgetKit, ana uygulama target'ından **ayrı bir Xcode extension target'ı** gerektirir (Widget Extension), Swift/
SwiftUI ile yazılır ve yalnızca Xcode'da derlenip gerçek bir cihazda/simülatörde test edilebilir — bu ortamda hiçbiri
mümkün değil. Görev tanımı da açıkça "WidgetKit'i yapma — sadece backlog dokümanı" diyor.

## Widget için önerilen kapsam (gelecekte)

En değerli, en düşük riskli ilk widget: **Bakım ve Ödeme Takvimi özeti** — en yakın tarihli 1-3 hatırlatmayı
(başlık + kalan gün) küçük/orta boy bir widget'ta gösterme.

### Neden bu widget önce

- Zaten cihazda saklanan veriye (`src/lib/storage/reminders-storage.ts`) dayanır; sunucuya yeni bir bağımlılık
  eklemez.
- Kullanıcı hesabı olmadığından widget'ın kendi başına kimlik doğrulaması yapmasına gerek yoktur.
- "Analiz" gibi tek seferlik/oturum verisine değil, kalıcı/tekrarlayan veriye dayanır — widget'lar periyodik olarak
  arka planda yenilendiği için bu tür kalıcı veri daha uygun bir eşleşmedir.

### Teknik gereksinimler (Xcode'da yapılacak, henüz yapılmadı)

1. **App Group** oluşturmak (`group.com.eksperiq.app`) — hem ana uygulama hem widget extension'ın aynı paylaşılan
   depoya (`UserDefaults(suiteName:)` veya paylaşılan bir dosya) erişebilmesi için zorunlu. WKWebView'in
   localStorage'ı widget extension'dan **erişilebilir değildir** — bu yüzden ana uygulama, hatırlatma verisini her
   güncellemede App Group'un paylaşılan `UserDefaults`'una da (küçük, özet bir JSON olarak) yazmalıdır. Bu, Capacitor
   custom plugin'i gerektiren native bir köprüdür.
2. Yeni bir **Widget Extension** target'ı eklemek, `TimelineProvider` ile en yakın hatırlatmaları okuyup
   `TimelineEntry` üretmek.
3. Widget'ın kendi `PrivacyInfo.xcprivacy`'sini gerekiyorsa eklemek (App Group/UserDefaults kullanımı "required
   reason API" kategorisine girebilir — bkz. `docs/ios-privacy-manifest.md`).
4. Widget'a dokunulduğunda uygulamayı `/bakim-odeme-takvimi` ekranına açacak bir deep link (URL scheme veya
   Universal Link) tanımlamak.
5. Gerçek cihazda: widget'ın zamanında yenilendiğini, karanlık/aydınlık temada okunabilir olduğunu, farklı widget
   boylarında (small/medium) düzgün kırpıldığını doğrulamak.

### Yapılmaması gerekenler

- Widget'ın AI özelliklerine (fotoğraf analizi, AI karar notu) bağımlı olması — bunlar ağ isteği gerektirir ve
  widget'ların arka plan yenileme bütçesi (Apple tarafından sınırlı) için uygun değildir.
- Widget içinde herhangi bir "Pro" göstergesi — StoreKit entegrasyonu tamamlanmadan (`docs/ios-storekit-integration.md`)
  hiçbir widget varyantı Pro'ya özel içerik göstermemelidir.

## Durum

Backlog — kod yazılmadı, App Group oluşturulmadı, hiçbir widget target'ı eklenmedi.
