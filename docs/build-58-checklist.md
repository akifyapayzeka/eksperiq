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

## Verified

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm test -- tests/unit/report-summary.test.ts tests/unit/analysis.test.ts`
- [x] `npm test -- tests/unit/analysis.test.ts tests/unit/listing-extraction.test.ts tests/unit/report-summary.test.ts`

## Still Open Before Closing Build 58

- [ ] User real-device TestFlight feedback after Build 58 is uploaded.
- [ ] Upload Build 58 to TestFlight only after explicit close/upload instruction.
