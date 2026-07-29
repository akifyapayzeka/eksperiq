# Hostinger Yayın Notları

EksperIQ statik export ürettiği için Hostinger üzerinde en düşük maliyetli yol, `out` klasörünü `public_html` içine yüklemektir. Bu akış sunucu tarafı Node.js çalıştırmaz; uygulama mevcut MVP kapsamıyla tamamen tarayıcıda çalışır.

## Statik paket üretimi

```bash
npm run hostinger:package
```

Bu komut:

1. `npm run build` çalıştırır.
2. `out` klasörünü üretir.
3. Hostinger/Apache route yenilemeleri için `out/.htaccess` dosyasını ekler.
4. `dist/eksperiq-hostinger-static.zip` paketini oluşturur.

## Hostinger File Manager ile yayın

1. Hostinger hPanel içinde ilgili siteyi açın.
2. File Manager üzerinden `public_html` klasörüne girin.
3. Eski dosyaları yedekleyin veya temizleyin.
4. `dist/eksperiq-hostinger-static.zip` dosyasını yükleyin.
5. Zip dosyasını `public_html` içinde çıkarın.
6. `index.html`, `_next`, `analiz.html`, `sonuc.html`, `.htaccess` dosyalarının `public_html` kökünde olduğundan emin olun.
7. Aşağıdaki URL'leri kontrol edin:
   - `/`
   - `/analiz`
   - `/sonuc`
   - `/moduller`
   - `/gizlilik`

## Yenileme ve 404 davranışı

Next.js statik export sayfaları `analiz.html`, `sonuc.html` gibi dosyalar üretir. Hostinger shared hosting üzerinde kullanıcı `/analiz` sayfasını yenilediğinde doğrudan HTML dosyasına yönlenmesi için paket içine `.htaccess` eklenir.

Bu uygulama istemci tarafında çalıştığı için sonuç verisi URL'ye yazılmaz. `/sonuc` sayfası yenilenirse kullanıcıya analizi yeniden başlatma seçeneği gösterilir.

## GitHub bağlantılı Hostinger Web Apps seçeneği

Hostinger'ın Next.js/Web Apps ürünü GitHub entegrasyonu ve Node.js runtime sağlayabilir; ancak bu seçenek plan ve hesap durumuna göre ücretli olabilir. Bu projede maliyet oluşturmamak için varsayılan dağıtım yolu statik zip paketidir.

Node.js/Web Apps kullanılacaksa:

- Build command: `npm run build`
- Output/static publish klasörü: `out`
- Environment variable gerekmez.
- Ücretli plan veya domain değişikliği gerekirse işlem kullanıcı onayı olmadan yapılmamalıdır.

## Yayın sonrası kontrol

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run hostinger:package
```

Yayınlanan canlı URL üzerinde ana sayfa, analiz formu, sonuç boş-state, gizlilik ve modüller sayfaları 200 dönmelidir.

Genel yayın checklist'i için `docs/release-operations-checklist.md` dosyasını da kullanın.
