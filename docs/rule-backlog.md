# Kural Backlog

Bu backlog, gerçek kullanıcı geri bildirimi ve uzman değerlendirmesiyle gelen analiz kuralı adaylarını aktif kural motoruna taşımadan önce takip eder.

Aktif kural motoru `src/lib/analysis` altında kalır. Bu dosyadaki maddeler doğrulanmış ürün ihtiyacı veya test senaryosu oluşmadan kullanıcıya risk bulgusu olarak gösterilmez.

## Backlog alanları

| Alan            | Açıklama                                                    |
| --------------- | ----------------------------------------------------------- |
| Aday ID         | Kısa, İngilizce ve benzersiz ID                             |
| Kaynak          | Kullanıcı testi, uzman yorumu veya piyasa gözlemi           |
| Etkilenen modül | İlan analizi, belge, bakım, hasar, satıcı açıklaması        |
| Girdi sinyali   | Kullanıcının manuel girdiği hangi bilgiye bakılacak         |
| Beklenen bulgu  | Başlık, kategori, severity ve öneri cümlesi                 |
| Kanıt           | Issue, kullanıcı testi notu veya uzman değerlendirmesi      |
| Skor etkisi     | Hangi kategori puanı etkilenir veya sadece bilgilendirme mi |
| Unit test       | Pozitif ve negatif test dosyası                             |
| Durum           | Needs feedback, ready for test, accepted, rejected          |

## Mevcut adaylar

| Aday ID                   | Kaynak                   | Etkilenen dosya                               | Kanıt                                                                           | Unit test                            | Durum    |
| ------------------------- | ------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------ | -------- |
| seller-claims-garage-kept | Piyasa gözlemi           | `src/lib/analysis/rules/seller-rules.ts`      | Kullanıcıların "garaj arabası" iddiasını doğrulama sorusu olarak görme ihtiyacı | `tests/unit/rule-candidates.test.ts` | accepted |
| maintenance-chain-unknown | Kullanıcı geri bildirimi | `src/lib/analysis/rules/maintenance-rules.ts` | Yüksek kilometrede triger/zincir belirsizliği masraf riskini artırıyor          | `tests/unit/rule-candidates.test.ts` | accepted |
| document-owner-proxy-sale | Uzman değerlendirmesi    | `src/lib/analysis/rules/document-rules.ts`    | Ruhsat sahibi ve vekalet belirsizliği noter öncesi kontrol gerektiriyor         | `tests/unit/rule-candidates.test.ts` | accepted |

## Aktif kurala taşıma kapısı

Bir aday aktif analiz motoruna alınmadan önce:

1. Kişisel veri veya izinsiz scraping gerektirmediği doğrulanır.
2. Kesin hüküm içermeyen Türkçe çıktı metni yazılır.
3. Skor etkisi varsa ağırlıklar yalnızca merkezi constants üzerinden değerlendirilir.
4. En az bir pozitif ve bir negatif unit test eklenir.
5. Sonuç sayfasında kullanıcıya "garanti" hissi vermediği kontrol edilir.
6. Gerekirse `docs/app-store-submission.md` içindeki iddia dili güncellenir.
