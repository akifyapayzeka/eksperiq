const baseUrl = (process.env.AI_PHOTO_PROD_BASE_URL ?? "https://eksperiq.vercel.app").replace(/\/$/, "");

function fail(message) {
  console.error(`Photo AI production check failed: ${message}`);
  process.exit(1);
}

async function readJson(response) {
  try {
    return await response.clone().json();
  } catch {
    return null;
  }
}

const response = await fetch(`${baseUrl}/api/ai/photo-damage`, {
  method: "POST",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ invalid: true }),
});

const body = await readJson(response);
const error = typeof body?.error === "string" ? body.error : "";

if (response.status === 400 && error.includes("geçerli araç fotoğrafı")) {
  console.log(`Photo AI production flag is enabled: ${baseUrl}`);
  process.exit(0);
}

if (response.status === 429 && error.includes("kapalı")) {
  fail("Vercel production env has NEXT_PUBLIC_AI_PHOTO_DAMAGE_ENABLED disabled or missing.");
}

fail(`unexpected response status ${response.status}: ${error || "no readable error"}`);
