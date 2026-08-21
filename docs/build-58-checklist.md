# Build 58 Checklist

Status: open. Do not upload to TestFlight until the user explicitly says to close Build 58.

## Included Changes

- [x] Bumped iOS build number from 57 to 58 in both project settings.
  - Commit: `a5775b0`
- [x] Removed the `Kisa ozeti kopyala` button from the report short summary card.
  - Commit: `a5775b0`
- [x] Simplified the listing photo viewer header.
  - Removed title, photo count, percent, plus, and minus controls.
  - Left only the close button.
  - Commit: `a5775b0`
- [x] Added pinch zoom to listing photos.
  - Two-finger zoom works inside the in-app viewer.
  - Double click resets zoom.
  - Commit: `a5775b0`
- [x] Added gallery navigation inside the listing photo viewer.
  - Left/right buttons switch photos.
  - Horizontal swipe switches photos when zoom is reset.
  - Keyboard left/right arrows switch photos.
  - Zoom resets after changing photo.
  - Commit: `7af4611`
- [x] Fixed the damage-report contradiction for clean seller claims.
  - If the seller description says `hasar kaydi yoktur`, `hasar kayitsiz`, `tramer yok`, `agir hasar yok`, or `hatasiz boyasiz`, the report no longer says `Hasar bilgileri bos birakilmis`.
  - The report now says the seller claims no damage record and asks the user to verify it with TRAMER, paint measurement, and expertise.
  - Commit: `89f35ac`
- [x] Reworked Garajim vehicle layout.
  - `Aracim` card is now the first section.
  - Maintenance/tax calendar sits directly under the `Aracim` card.
  - Old `Arac ozeti` section was removed.
  - The old rename-only vehicle control was removed from Garajim.
  - `Duzenle` now opens the vehicle edit sheet from inside the `Aracim` card.
- [x] Expanded vehicle profile details.
  - Added editable `Motor` and `Paket` fields to the vehicle edit sheet.
  - Vehicle cards now show brand, model, engine, trim, year, fuel, transmission, plate, and mileage when available.
- [x] Reworked home page vehicle section.
  - The home page now lists all saved vehicles under `Aracim`.
  - The `Aracim` heading shows a light inline summary of the first vehicle's brand/model/engine/trim/year.
- [x] Removed photo-analysis-free wording from subscription surfaces.
  - Removed the `Fotograf analizi tum planlarda ucretsiz` benefit row from the plan cards.
  - Removed the same wording from Pro/Pro+ promo and onboarding paywall descriptions.
  - Kept subscription limits focused on listing-link analysis: Free 3, Pro 20, Pro+ unlimited.
- [x] Hardened photo analysis against strict JSON schema failures.
  - If the free vision model rejects strict `response_format` mode with HTTP 400, the endpoint retries once without strict schema mode.
  - If the named free vision model still returns unreadable content, the endpoint falls back to OpenRouter's free router as a last resort.
  - The user-facing error now says the model result could not be read and suggests retry/manual finding instead of the old generic reliability wording.
- [x] Kept photo analysis on free AI models while tightening vehicle-photo validation.
  - Configured vision models and fallback models are accepted only when they are explicitly free OpenRouter models.
  - If the AI response contradicts itself and says the image is a screenshot, document, toy, person, unrelated object, or not a vehicle, the endpoint forces `isVehiclePhoto=false` and clears findings.
  - Vehicle exterior/interior, vehicle parts, dashboard, and warning-light photos still stay eligible for analysis.
- [x] Added photo-quality guidance for hard-to-see scratches.
  - The AI response now includes `photoQuality` with quality status, visible issues, and retake tips.
  - The photo analysis screen shows a capture guide after selecting photos.
  - The result screen shows whether the photo is good, usable, or weak, plus how to retake the same area for scratches, paint mismatch, glare, blur, and close-up problems.
- [x] Added the user-research purchase flow to the product.
  - New `Satın Alma Rehberi` module/page connects listing analysis, official checks, nearby expertise/notary/service search, repair-cost estimation, test drive checks, and final checklist.
  - Home page now surfaces purchase guide and nearby expertise/notary/service shortcuts.
  - Report now links next steps directly from the buyer decision: guide, official checks, nearby expertise, and repair-cost estimation.
  - Report `Alım Planı` now includes city/service/notary direction cards and a repair-cost CTA for negotiation.
  - `/onarim-maliyeti` is now a real repair-cost estimation page instead of redirecting back to photo analysis.
  - Nearby services accepts `?kategori=ekspertiz|servis|noter`, so report/guide links open the right service type.

## Verified

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm test -- tests/unit/report-summary.test.ts tests/unit/analysis.test.ts`
- [x] `npm test -- tests/unit/analysis.test.ts tests/unit/listing-extraction.test.ts tests/unit/report-summary.test.ts`
- [x] `npm test -- tests/unit/vehicles-model.test.ts tests/unit/vehicle-switcher.test.tsx tests/unit/mobile-bottom-nav.test.tsx tests/unit/reminders-model.test.ts tests/unit/reminders-storage.test.ts`
- [x] `npm test -- tests/unit/photo-damage-endpoint.test.ts`
- [x] `npm test -- tests/unit/modules-registry.test.ts tests/unit/report-summary.test.ts tests/unit/api-client.test.ts`
- [x] `npm run build`

## Still Open Before Closing Build 58

- [ ] User real-device TestFlight feedback after Build 58 is uploaded.
- [ ] Upload Build 58 to TestFlight only after explicit close/upload instruction.
