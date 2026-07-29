# TestFlight QA Raporu

Bu rapor gerçek cihaz testi sırasında doldurulur. Her bulgu için ekran görüntüsü, cihaz modeli ve tekrar adımları eklenmelidir.

## Build Bilgisi

- Test tarihi:
- Test eden:
- App sürümü:
- Build numarası:
- Commit:
- Cihaz modeli:
- iOS sürümü:
- TestFlight external/internal:

## Özet

- Genel durum: `Geçti / Şartlı geçti / Kaldı`
- Bloklayıcı hata sayısı:
- Yüksek öncelikli hata sayısı:
- Orta öncelikli hata sayısı:
- Düşük öncelikli hata sayısı:
- App Store gönderimine uygun mu: `Evet / Hayır`

## Kontrol Sonuçları

| Alan                             | Durum     | Not |
| -------------------------------- | --------- | --- |
| İlk açılış                       | Beklemede |     |
| Ana sayfa layout                 | Beklemede |     |
| Alt navigasyon safe area         | Beklemede |     |
| Analiz formu                     | Beklemede |     |
| Zod hata mesajları               | Beklemede |     |
| Sonuç raporu                     | Beklemede |     |
| Satıcı soruları                  | Beklemede |     |
| Ekspertiz checklist              | Beklemede |     |
| Rapor paylaşımı                  | Beklemede |     |
| Offline davranışı                | Beklemede |     |
| Dış link davranışı               | Beklemede |     |
| Gizlilik/yasal metinler          | Beklemede |     |
| AI feature flag kapalı davranışı | Beklemede |     |
| AI staging açık davranışı        | Beklemede |     |

## Yerel App Store Screenshot QA

- Tarih: 30 Temmuz 2026
- Commit: `0661e83`
- Komutlar: `npm run appstore:prepare`, `npm run appstore:check`
- Dosyalar: `dist/app-store-package/app-store-screenshots/01-home-1320x2868.png` - `05-offline-1320x2868.png`
- Sonuç: Ölçü kontrolü geçti; ana sayfa, analiz formu, sonuç raporu, analizlerim ve offline ekranlarında belirgin taşma veya kırık layout görülmedi.
- Not: Bu kontrol gerçek iPhone/TestFlight testi yerine geçmez; yalnızca App Store görsel paketi için yerel ön kontroldür.

## Bulgu Kaydı

### Bulgu 1

- Öncelik: `P0 / P1 / P2 / P3`
- Durum: `Açık / Düzeltildi / Kabul edildi`
- Ekran:
- Tekrar adımları:
- Beklenen:
- Gerçekleşen:
- Not:

## App Store Kararı

- Gönderime engel var mı:
- Gerekli düzeltmeler:
- Sonraki test tarihi:
