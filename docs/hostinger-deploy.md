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

## Paket içeriği kontrolü

Zip yüklenmeden önce yerelde şu içerikler doğrulanmalıdır:

- `.htaccess`
- `index.html`
- `analiz.html`
- `sonuc.html`
- `geri-bildirim.html`
- `moduller.html`
- `offline.html`
- `_next/static`

PowerShell ile hızlı kontrol:

```powershell
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path 'dist\eksperiq-hostinger-static.zip'))
$zip.Entries.FullName | Select-String '(^\.htaccess$|index\.html|analiz\.html|sonuc\.html|geri-bildirim\.html|offline\.html|_next\\static)'
$zip.Dispose()
```

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
   - `/geri-bildirim`
   - `/moduller`
   - `/gizlilik`
   - `/offline`

## Canlı kontrol komutları

Domain bağlandıktan sonra aşağıdaki komutlarda `https://example.com` yerine gerçek Hostinger adresini yazın:

```powershell
$baseUrl = 'https://example.com'
$paths = @('/', '/analiz', '/sonuc', '/geri-bildirim', '/moduller', '/gizlilik', '/offline')
foreach ($path in $paths) {
  $response = Invoke-WebRequest -Uri "$baseUrl$path" -UseBasicParsing -TimeoutSec 20
  "$path -> $($response.StatusCode)"
}
```

Beklenen sonuç her path için `200` olmalıdır. `/sonuc` sayfasında oturum verisi yoksa yeniden analiz başlatma ekranı görünmesi normaldir.

## Rollback planı

Yükleme öncesinde mevcut `public_html` içeriğini tarihli bir zip veya klasör olarak saklayın.

Önerilen adımlar:

1. Yeni paketi yüklemeden önce mevcut `public_html` içeriğini `backup-YYYY-MM-DD-HHMM.zip` olarak indirin.
2. Yeni paketi ayrı bir klasörde açıp dosya listesini kontrol edin.
3. Sorun görülürse yeni yüklenen dosyaları kaldırın.
4. Yedek zip'i tekrar `public_html` köküne çıkarın.
5. Ana sayfa, `/analiz`, `/sonuc` ve `/gizlilik` yollarını tekrar kontrol edin.

Rollback sırasında kullanıcı verisi sunucuda tutulmadığı için veritabanı geri dönüşü gerekmez.

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
