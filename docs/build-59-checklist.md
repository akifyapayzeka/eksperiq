# Build 59 Checklist

Status: open. Do not upload to TestFlight until the user explicitly says to close/upload Build 59.

## Included Changes

- [x] Bumped iOS build number from 58 to 59 in both project settings.
- [x] Added the Build 58 shipped changes as the baseline for Build 59.
  - Photo viewer cleanup, pinch zoom, gallery arrows/swipe navigation.
  - Garage/home vehicle layout improvements.
  - Purchase guide, nearby services, repair cost, and report education improvements.
  - Photo analysis free-model guardrails, warning-light support, and retake guidance.
  - Semantic color polish.
- [x] Fixed listing paint/changed part extraction for newer Sahibinden formats.
  - `SOL ÖN ÇAMURLUK DEĞİŞEN` now maps to `replacedParts`.
  - `İKİ KAPI İKİ ÇAMURLUK YÜZEYSEL BOYA VARDIR` now maps to `paintedParts`.
  - The same fallback also works when the text arrives through listing photo/OCR evidence instead of normal page text.
  - Commit: `b2f7b02`
- [x] Fixed photo analysis using the wrong OpenRouter model.
  - The photo endpoint no longer treats the shared listing/text model `openai/gpt-oss-20b:free` as a vision model.
  - If no explicit free vision model is configured, photo analysis falls back to the known free vision default.
  - This targets cases where obvious vehicle damage photos returned `Fotoğraf analizi şu anda tamamlanamadı`.
  - Commit: `4f2af6b`
- [x] Regenerated the App Store screenshot set from current Build 59 screens.
  - Removed the old subscription/paywall first screenshot.
  - Removed the old offline/connection-style fifth screenshot.
  - New final set: home, analysis start, risk score, garage, buyer decision.
  - Final App Store outputs are generated at `1320x2868`.
- [x] Cropped iOS status bar from App Store screenshots.
  - The screenshot generator now hides the source photo's time, signal, LTE and battery area inside the phone mockup.
- [x] Fixed the listing import foreground/background completion race.
  - Returning to EksperIQ after the five-minute JS deadline now gives the native WKWebView import a short grace window instead of immediately showing a false failure.
  - iOS local notifications are only shown while the app is still outside the foreground, so stale failure notifications should not appear on top of a just-finished in-app result.
- [x] Strengthened listing import fallback extraction for missing report fields.
  - If the AI model misses explicit Sahibinden table rows, the endpoint now deterministically fills package, fuel, transmission, mileage, price, body type, engine size, owner source, trade status, city, and paint/changed details from the page text.
  - Added common Turkish-market package options such as Edition, Icon, Feel, Shine, and Titanium so imported package values do not render as blank selects.

## Verified For New Build 59 Fixes

- [x] `npm test -- tests/unit/listing-import-endpoint.test.ts tests/unit/listing-photo-evidence.test.ts`
- [x] `npm test -- tests/unit/photo-damage-endpoint.test.ts`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run appstore:package`
- [x] `npm run appstore:screenshots`
- [x] `npm run appstore:check`
- [x] `npm test -- tests/unit/import-listing.test.ts`
- [x] `npm test -- tests/unit/listing-import-endpoint.test.ts`

## Still Open Before Closing Build 59

- [ ] Wait for user real-device feedback.
- [ ] Add any remaining fixes requested by the user.
- [ ] Upload Build 59 to TestFlight only after explicit close/upload instruction.
