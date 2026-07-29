# Geri Bildirimden Kural Geliştirme Süreci

Bu doküman, gerçek kullanıcı testlerinden gelen geri bildirimleri EksperIQ kural motoruna kontrollü şekilde eklemek için kullanılır.

## Amaç

Kullanıcıların ilan analizi sonucunda eksik, yanıltıcı, fazla sert veya fazla zayıf bulduğu noktaları toplayıp test edilebilir kural değişikliklerine dönüştürmek.

## Toplanacak geri bildirim türleri

- Kullanıcının beklediği ama raporda görünmeyen risk
- Gereksiz veya abartılı görünen uyarı
- Satıcıya sorulması gerektiği düşünülen yeni soru
- Ekspertizde özellikle kontrol edilmesi istenen yeni başlık
- İlan açıklamasında doğrulanması gereken yeni ifade
- Türkiye piyasasına özgü marka, model, motor veya paket bazlı kronik sorun notu

## Kural adayını değerlendirme ölçütleri

1. Kullanıcıya karar desteği sağlıyor mu?
2. Kesin hüküm vermeden ifade edilebiliyor mu?
3. Kullanıcının manuel girdiği bilgilerle çalışabiliyor mu?
4. Ücretli API, scraping veya kalıcı veri gerektirmiyor mu?
5. Unit test ile doğrulanabilir mi?
6. Skor ağırlıklarını merkezi constants dışında değiştirmiyor mu?

## Kabul kriteri

Bir geri bildirim kural motoruna eklenmeden önce aşağıdaki bilgiler netleşmelidir:

- Hangi modülü etkiliyor?
- Hangi kullanıcı girdisine bakıyor?
- Hangi bulguyu üretmeli?
- Bulguda severity seviyesi ne olmalı?
- Kullanıcıya öneri cümlesi ne olmalı?
- Skoru etkiliyorsa hangi kategori puanını etkiliyor?
- En az bir pozitif ve bir negatif unit test senaryosu var mı?

## MVP için öncelik sırası

1. İlan açıklamasındaki doğrulanması gereken yeni iddia ifadeleri
2. Eksik bilgi ve belge uyarıları
3. Bakım ve yakın masraf sinyalleri
4. Hasar geçmişi ve güvenlik riski sinyalleri
5. Marka/model/motor bazlı kronik sorunlar

## Dil sınırları

Kural çıktıları şu ifadeleri kullanmamalıdır:

- Kesin alma
- Kesin alınır
- Hasarsızdır
- Dolandırıcılık
- Sorunsuzdur
- Ekspertize gerek yok

Kural çıktıları şu çerçevede yazılmalıdır:

- Doğrulanması gerekir
- Satıcıdan belge istenmeli
- Ekspertizde özellikle kontrol edilmeli
- Mevcut bilgilerle risk artıyor
- Bilgi yetersiz olduğu için karar desteği sınırlı

Canlı uygulama geri bildirim giriş noktası `/geri-bildirim` sayfasıdır. Kullanıcı testi notları önce `docs/user-test-feedback-triage.md` ile sınıflandırılır. Kural adayları `docs/rule-backlog.md` ve `src/lib/feedback/rule-candidates.ts` içinde gerçek issue kayıt formatına bağlanır.

Typed kural adaylarından GitHub issue taslağı üretmek için:

```bash
npm run rule-feedback:package
```

Çıktı `dist/rule-feedback-issues` altında oluşur ve issue açmadan önce kişisel veri kontrolü manuel yapılır.
