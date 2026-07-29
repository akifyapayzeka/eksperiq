const baseUrl = (process.env.DEPLOY_CHECK_BASE_URL ?? "https://eksperiq.vercel.app").replace(/\/$/, "");

const pages = [
  { path: "/", expected: ["EksperIQ", "Ücretsiz analiz et"] },
  { path: "/analiz", expected: ["Araç ilanı analizi", "Analiz oluştur"] },
  { path: "/sonuc", expected: ["EksperIQ", "İkinci el araç ilanı risk analizi"] },
  { path: "/geri-bildirim", expected: ["Geri bildirim", "Kullanıcı testi notu gönder"] },
  { path: "/gizlilik", expected: ["Gizlilik", "Girdiğiniz ilan ve araç bilgileri"] },
  { path: "/manifest.webmanifest", expected: ["EksperIQ"] },
];

const forbidden = ["Auto" + "IQ", "A" + "FG", "sk-" + "or-v1", "OPENROUTER" + "_API_KEY"];

function fail(message) {
  console.error(`Deploy kontrolu basarisiz: ${message}`);
  process.exitCode = 1;
}

async function checkPage(page) {
  const response = await fetch(`${baseUrl}${page.path}`, {
    headers: { Accept: page.path.endsWith(".webmanifest") ? "application/manifest+json" : "text/html" },
  });
  const text = await response.text();

  if (!response.ok) {
    fail(`${page.path} status ${response.status}`);
    return;
  }

  for (const expected of page.expected) {
    if (!text.includes(expected)) {
      fail(`${page.path} beklenen metni icermiyor: ${expected}`);
    }
  }

  for (const pattern of forbidden) {
    if (text.includes(pattern)) {
      fail(`${page.path} yasakli metin iceriyor: ${pattern}`);
    }
  }
}

await Promise.all(pages.map(checkPage));

if (!process.exitCode) {
  console.log(`Canli deploy kontrolu gecti: ${baseUrl}`);
}
