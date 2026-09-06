export const appConfig = {
  name: "EksperIQ",
  shortName: "EksperIQ",
  /** Keep in sync with package.json's "version" — shown on the Hakkında page. */
  version: "0.1.0",
  tagline: "Araç ilanını gir, riskleri gör, satıcıya ne soracağını öğren.",
  productionUrl: "https://eksperiq.vercel.app",
  feedbackEmail: "ruzgar.mesavo@gmail.com",
  storageKey: "eksperiq:last-analysis",
  remindersStorageKey: "eksperiq:reminders",
  testDriveChecklistStorageKey: "eksperiq:test-drive-checklist",
  expensesStorageKey: "eksperiq:expenses",
  comparisonStorageKey: "eksperiq:comparison",
  officialLookupChecklistStorageKey: "eksperiq:official-lookup-checklist",
  healthRecordStorageKey: "eksperiq:health-records",
  saleChecklistStorageKey: "eksperiq:sale-checklist",
  vehiclesStorageKey: "eksperiq:vehicles",
  photoAnalysesStorageKey: "eksperiq:photo-analyses",
  analysisHistoryStorageKey: "eksperiq:analysis-history",
  productEventsStorageKey: "eksperiq:product-events",
  disclaimer:
    "Bu analiz yalnızca bilgilendirme ve karar desteği amacıyla hazırlanır. Profesyonel araç ekspertizinin, servis kontrolünün, resmî kayıt sorgularının veya hukuki incelemenin yerine geçmez. Son satın alma kararı kullanıcıya aittir.",
  privacy:
    "Girdiğiniz ilan ve araç bilgileri bu cihazda saklanır ve istediğiniz zaman silebilirsiniz. Uygulamada hesap/giriş sistemi yoktur; Pro/Pro+ abonelikleri Apple ID'nize bağlı App Store satın alması olarak yönetilir ve araç kayıtlarınız sunucuya gönderilmez.",
} as const;
