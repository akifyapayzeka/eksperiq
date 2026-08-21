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

## Verified For New Build 59 Fixes

- [x] `npm test -- tests/unit/listing-import-endpoint.test.ts tests/unit/listing-photo-evidence.test.ts`
- [x] `npm test -- tests/unit/photo-damage-endpoint.test.ts`
- [x] `npm run typecheck`
- [x] `npm run lint`

## Still Open Before Closing Build 59

- [ ] Wait for user real-device feedback.
- [ ] Add any remaining fixes requested by the user.
- [ ] Upload Build 59 to TestFlight only after explicit close/upload instruction.
