if (process.env.AI_LIVE_CONFIRM !== "EVET") {
  console.error("Canli AI denemesi calismadi.");
  console.error("Tek deneme icin: AI_LIVE_CONFIRM=EVET AI_STAGING_LIVE=1 npm run ai:live-check");
  console.error("Bu komut OpenRouter gunluk limitinden dusabilir.");
  process.exit(1);
}

process.env.AI_STAGING_LIVE = "1";
await import("./check-ai-staging.mjs");
