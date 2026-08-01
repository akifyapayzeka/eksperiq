export const appConfig = {
  name: "EksperIQ",
  shortName: "EksperIQ",
  tagline: "Araç ilanını gir, riskleri gör, satıcıya ne soracağını öğren.",
  productionUrl: "https://eksperiq.vercel.app",
  feedbackIssueUrl: "https://github.com/akifyapayzeka/eksperiq/issues/1",
  newRuleFeedbackUrl: "https://github.com/akifyapayzeka/eksperiq/issues/new?template=rule-feedback.md",
  newUserTestFeedbackUrl: "https://github.com/akifyapayzeka/eksperiq/issues/new?template=user-test-feedback.md",
  storageKey: "eksperiq:last-analysis",
  remindersStorageKey: "eksperiq:reminders",
  disclaimer:
    "Bu analiz yalnızca bilgilendirme ve karar desteği amacıyla hazırlanır. Profesyonel araç ekspertizinin, servis kontrolünün, resmî kayıt sorgularının veya hukuki incelemenin yerine geçmez. Son satın alma kararı kullanıcıya aittir.",
  privacy:
    "Girdiğiniz ilan ve araç bilgileri hesabınıza kaydedilmez. Analiz yalnızca mevcut tarayıcı oturumunda gerçekleştirilir.",
} as const;
