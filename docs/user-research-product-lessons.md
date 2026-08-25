# User Research Product Lessons

Last refreshed for Build 58.

This file maps current used-car buyer research and review themes to concrete EksperIQ surfaces. It is not legal, financial, or mechanical advice; it is a product checklist to keep the app aligned with what buyers repeatedly need before purchasing a used car.

## Research Themes

- Buyers search for a step-by-step path, not only a risk score.
- Buyers worry about hidden accident history, missing/incorrect expertise reports, paint/replaced-part claims, and incomplete TRAMER records.
- Buyers need help understanding why timing belt, maintenance, transmission, tire, battery, inspection, and warning-light checks matter.
- Buyers need city-based next steps: where to take the car for expertise, service, and notary.
- Buyers need likely repair/maintenance cost ranges before negotiation.
- Buyers need a final checklist because the buying process spans listing review, seller questions, official lookup, test drive, expertise, payment, notary, and delivery.

## Product Mapping

| Lesson                                     | Build 58 Surface                                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Step-by-step purchase guidance             | `/satin-alma-rehberi`, home shortcuts, report buyer-decision next-step cards                             |
| Official record verification               | `/resmi-sorgu-rehberi`, report official-check link, final checklist                                      |
| Independent expertise and notary direction | `/yakinimdaki-hizmetler?kategori=ekspertiz`, `servis`, `noter`; report city/service/notary cards         |
| Repair and maintenance cost awareness      | `/onarim-maliyeti`, report negotiation CTA, repair-cost estimator                                        |
| Why each term matters                      | `BUYER_DECISION_GUIDE`, `BUYER_EDUCATION_NOTES`, report `Araç alırken bunlar neden önemli?`, PDF payload |
| Seller-question understanding              | Expandable report seller question cards with `Neden sorulur?` and `Cevap ne anlatır?`                    |
| Hidden damage and false clean claims       | damage rules, seller clean-damage claim handling, TRAMER/boya/expertise verification copy                |
| Photo uncertainty                          | free photo AI guardrails, non-vehicle rejection, photo-quality/retake guidance                           |

## Source Types Used

- Turkish second-hand car buying guides: TRAMER, expertise, mileage, maintenance, notary/borç checks.
- Consumer-review complaint patterns: wrong expertise, undisclosed damage, paint/replaced mismatch, missing report details.
- Used-car inspection guides: independent mechanic/expertise, written report, repair-cost estimate, negotiation preparation.
- App listing patterns: step-by-step buying guide, repair-cost estimates, negotiation script, no mechanical knowledge required.

## Completion Notes For Build 58

- The app now gives the user an entry path before analysis, during report reading, and after report reading.
- The report and PDF both carry buyer education, not only raw risk findings.
- Service/notary/expertise and repair-cost flows are linked from the buying context instead of being isolated utility screens.
- TestFlight upload remains separate and requires explicit user approval.
