const baseUrl = (process.env.DEPLOY_CHECK_BASE_URL ?? "https://eksperiq.vercel.app").replace(/\/$/, "");

const pages = [
  { path: "/", expected: ["EksperIQ", "Araban i\u00e7in tek asistan."] },
  { path: "/analiz", expected: ["Ara\u00e7 ilan\u0131 analizi", "Analiz olu\u015ftur"] },
  { path: "/sonuc", expected: ["EksperIQ", "\u0130kinci el ara\u00e7 ilan\u0131 risk analizi"] },
  {
    path: "/geri-bildirim",
    expected: ["Geri bildirim", "Anonim test notu \u015fablonu", "Geri bildirimi do\u011fru hatta ay\u0131r"],
  },
  { path: "/moduller", expected: ["EksperIQ vizyonu", "Garaj\u0131m", "Kesinlik s\u0131n\u0131r\u0131"] },
  {
    path: "/kontrol-listesi",
    expected: ["Uzmanl\u0131k Kontrol Listesi", "Sat\u0131n alma \u00f6ncesi son kontroller"],
  },
  { path: "/hakkinda", expected: ["Hakk\u0131nda", "sat\u0131n almaya uygun oldu\u011funu garanti etmez"] },
  { path: "/gizlilik", expected: ["Gizlilik", "Girdi\u011finiz ilan ve ara\u00e7 bilgileri"] },
  {
    path: "/kullanim-kosullari",
    expected: ["Kullan\u0131m ko\u015fullar\u0131", "kesin sat\u0131n alma tavsiyesi olmad\u0131\u011f\u0131n\u0131"],
  },
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
