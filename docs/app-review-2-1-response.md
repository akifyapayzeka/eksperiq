# App Review Guideline 2.1 Response Draft

Use this for App Store Connect > App Review Information > Notes, and attach or link the screen recording requested by Apple.

## Screen Recording Checklist

Record on a physical iPhone running the latest available iOS version. Start recording before launching EksperIQ.

Recommended flow:

1. Launch EksperIQ.
2. Continue without creating an account if the sign-in screen appears.
3. Open the Analysis tab.
4. Choose "Araç satın alacağım".
5. Paste a public vehicle listing URL, start listing analysis, and show the generated report: risk score, buyer decision, seller questions, inspection/checklist notes, chronic issue section, listing photos, and nearby service guidance.
6. Return to Analysis and choose "Kendi aracımı analiz edeceğim".
7. Select or capture a vehicle photo and run the free photo analysis flow.
8. Open Garage and show maintenance/payment calendar.
9. Open Profile/Plans and show Free, Pro, and Pro+ listing-analysis limits. If the reviewer needs to test purchase, use Apple's sandbox/TestFlight environment; no separate developer demo credentials are required.
10. If camera/photo/notification prompts appear, show that they are user-initiated and tied to photo analysis or maintenance reminders only.

## Copy/Paste Reply

Hello App Review Team,

Thank you for reviewing EksperIQ. Below is the additional information requested under Guideline 2.1.

1. Screen recording

We have attached/provided a screen recording captured on a physical iPhone running the latest available iOS version. The recording starts with launching the app and demonstrates the typical user flow through the core features:

- Opening EksperIQ
- Continuing without account creation
- Creating a used-car purchase analysis from a public listing URL or manual vehicle information
- Viewing the generated decision-support report, including risk score, buyer decision, seller questions, inspection checklist, chronic issue notes, listing photos, and nearby service guidance
- Running the free vehicle photo analysis flow
- Opening Garage to view maintenance and payment calendar features
- Opening the subscription/plans screen to show Free, Pro, and Pro+ listing-analysis limits
- Showing user-initiated camera/photo/notification permission flows where applicable

Screen recording link/attachment: [ADD SCREEN RECORDING LINK OR ATTACHMENT]

2. Tested devices and operating systems

The app was tested before submission on:

- [ADD DEVICE MODEL], iOS [ADD IOS VERSION], physical device, TestFlight build 59

3. App functions, target audience, problem solved, and value

EksperIQ is a Turkish used-car decision-support app for people who are considering buying a second-hand vehicle. The app helps users understand a vehicle listing before purchase by turning listing information, user-entered vehicle details, and optional vehicle photos into a structured pre-purchase report.

The app is designed especially for users who are not car experts. It explains what should be checked before buying, what questions should be asked to the seller, which issues should be verified during an independent inspection, and which known chronic issue signals may be relevant to the vehicle's brand/model/year/engine information.

EksperIQ does not replace a professional vehicle inspection, authorized service check, official record check, legal review, or the user's final purchase decision. It is a decision-support and educational pre-purchase tool only.

4. Setup and access instructions

No account is required to review the app's main features.

Recommended review flow:

- Launch the app.
- Continue without signing in if prompted.
- Open the Analysis tab.
- Choose "Araç satın alacağım" to analyze a vehicle listing or manually enter vehicle information.
- Generate a report and review the risk score, buyer decision, seller questions, inspection checklist, chronic issue notes, listing photos, and nearby service suggestions.
- Choose "Kendi aracımı analiz edeceğim" to test the free vehicle photo analysis flow.
- Open Garage to view maintenance/payment calendar features.
- Open Profile/Plans to view Free, Pro, and Pro+ listing-analysis limits.

If a public listing URL is not available during review, the manual vehicle form can be used to generate the same type of report.

No demo login credentials are required.

5. External services, tools, and platforms

EksperIQ uses the following external services:

- OpenRouter: temporary AI processing for listing normalization, report support text, and optional photo pre-checks. User action is required before this processing. AI output is framed as decision support, not a definitive inspection result.
- Vercel Serverless Functions: backend API endpoints for AI normalization, rate limiting, and nearby service lookup.
- Upstash Redis: anonymous rate-limit counters using non-identifying hashed installation/request data.
- Google Places API: nearby expertise/service/notary search results when users request local service guidance.
- Apple StoreKit 2: Pro/Pro+ subscription purchase and restore flows.
- Apple local notifications / Capacitor Local Notifications: optional on-device reminders for maintenance/payment calendar items, only after user action.
- Capacitor Camera/Photos: user-initiated vehicle photo capture or photo selection for free photo analysis.

6. Regional differences

The app functions consistently across all regions where it is available. Its language and vehicle-market content are focused on Turkey and Turkish used-car buying workflows.

7. Regulated industry / protected third-party material

EksperIQ is not a financial, legal, insurance, government, or professional vehicle inspection service. It does not certify vehicles, guarantee vehicle condition, or provide official inspection results.

The app may process publicly visible vehicle listing information submitted by the user only to help the user organize and understand the listing for personal pre-purchase decision support. EksperIQ is not affiliated with listing platforms and does not claim ownership of third-party listing content.

The app clearly states that all vehicle condition, damage, mileage, price, maintenance, and seller claims must be verified with an independent professional inspection, service check, and official records before purchase.
