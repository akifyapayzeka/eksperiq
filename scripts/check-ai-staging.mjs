const baseUrl = (process.env.AI_STAGING_BASE_URL ?? "https://eksperiq.vercel.app").replace(/\/$/, "");
const runLiveAi = process.env.AI_STAGING_LIVE === "1";

function assertOk(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJson(response) {
  try {
    return await response.clone().json();
  } catch {
    return null;
  }
}

async function describeUnexpectedResponse(response) {
  const text = await response.text();
  const vercelError = response.headers.get("x-vercel-error");
  const parts = [`status ${response.status}`];
  if (vercelError) parts.push(`x-vercel-error=${vercelError}`);
  if (text.trim()) parts.push(text.trim().slice(0, 180));
  return parts.join(" | ");
}

async function checkResultPage() {
  const response = await fetch(`${baseUrl}/sonuc`, {
    headers: { Accept: "text/html" },
  });
  const html = await response.text();
  assertOk(response.ok, `/sonuc status beklenmedik: ${response.status}`);
  assertOk(html.includes("EksperIQ"), "/sonuc EksperIQ icerigi donmedi.");
}

async function checkEndpointWithoutLiveAi() {
  const response = await fetch(`${baseUrl}/api/ai/analysis-note`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ invalid: true }),
  });
  const body = await readJson(response);
  assertOk(
    [400, 429, 503].includes(response.status),
    `AI endpoint beklenmeyen yanit dondu: ${await describeUnexpectedResponse(response)}`,
  );
  assertOk(body && typeof body.error === "string", "AI endpoint okunabilir hata mesaji donmedi.");
}

async function checkEndpointWithLiveAi() {
  const response = await fetch(`${baseUrl}/api/ai/analysis-note`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      vehicleLabel: "2020 Toyota Corolla 1.6",
      totalScore: 68,
      riskLabel: "Dikkatli incelenmeli",
      decision: "Ekspertiz ve belge kontrolü şart",
      findings: [
        {
          severity: "medium",
          title: "Tramer detayı eksik",
          explanation: "Tramer tutarı belirtilmiş ancak tarih ve parça detayı paylaşılmamış.",
        },
      ],
    }),
  });
  const body = await readJson(response);
  assertOk(response.ok, `Canli AI smoke yaniti beklenmedik: ${await describeUnexpectedResponse(response)}`);
  assertOk(body && typeof body.note === "string" && body.note.length > 20, "Canli AI notu okunabilir donmedi.");
  assertOk(!/kesin al|kesinlikle al|hasarsızdır|garanti eder/i.test(body.note), "AI notu kesin ifade iceriyor.");
}

try {
  await checkResultPage();
  if (runLiveAi) {
    await checkEndpointWithLiveAi();
  } else {
    await checkEndpointWithoutLiveAi();
  }
  console.log(`AI staging kontrolu gecti: ${baseUrl}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "AI staging kontrolu basarisiz.");
  process.exit(1);
}
