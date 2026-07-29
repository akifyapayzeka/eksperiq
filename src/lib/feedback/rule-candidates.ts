import type { AnalysisFinding } from "@/lib/analysis/types";
import type { ModuleId } from "@/lib/modules/types";

export type RuleCandidateStatus = "needs-feedback" | "ready-for-test" | "accepted" | "rejected";

export type RuleCandidateSource = "user-feedback" | "expert-review" | "market-observation";

export type RuleCandidate = {
  id: string;
  moduleId: ModuleId;
  status: RuleCandidateStatus;
  source: RuleCandidateSource;
  affectedRuleFile: string;
  inputSignal: string;
  expectedFinding: Pick<AnalysisFinding, "category" | "severity" | "title" | "recommendation">;
  validationQuestion: string;
  feedbackRecord: RuleFeedbackRecord;
};

export type RuleFeedbackRecord = {
  issueTitle: string;
  feedbackType: string;
  anonymizedInputFields: string[];
  expectedBehaviorPrompt: string;
  currentBehaviorPrompt: string;
  acceptanceEvidence: string[];
};

export const ruleCandidates: RuleCandidate[] = [
  {
    id: "seller-claims-garage-kept",
    moduleId: "listing-analysis",
    status: "accepted",
    source: "market-observation",
    affectedRuleFile: "src/lib/analysis/rules/seller-rules.ts",
    inputSignal: "İlan açıklamasında garaj arabası, kapalı garajda durdu veya benzer iddialar geçiyor.",
    expectedFinding: {
      category: "Satıcı açıklaması",
      severity: "low",
      title: "Garaj kullanımı iddiası doğrulanmalı",
      recommendation: "Aracın boya, güneş yanığı, trim ve lastik durumunu ekspertizde ayrıca kontrol ettirin.",
    },
    validationQuestion: "Bu ifade kullanıcılar için raporda doğrulanması gereken iddia olarak görünmeli mi?",
    feedbackRecord: {
      issueTitle: "[Kural geri bildirimi] Garaj kullanımı iddiası",
      feedbackType: "Yeni ilan açıklaması ifadesi",
      anonymizedInputFields: ["Marka", "Model", "Model yılı", "İlan açıklamasındaki ilgili cümle"],
      expectedBehaviorPrompt:
        "Bu iddia raporda doğrulanması gereken düşük riskli bir satıcı açıklaması bulgusu olmalı mı?",
      currentBehaviorPrompt: "Mevcut rapor bu iddiayı hiç göstermiyor mu veya farklı mı yorumluyor?",
      acceptanceEvidence: [
        "En az iki kullanıcı bu ifadeyi doğrulanması gereken iddia olarak işaretledi.",
        "Pozitif ve negatif seller-rules unit testleri yazıldı.",
      ],
    },
  },
  {
    id: "maintenance-chain-unknown",
    moduleId: "listing-analysis",
    status: "needs-feedback",
    source: "user-feedback",
    affectedRuleFile: "src/lib/analysis/rules/maintenance-rules.ts",
    inputSignal: "Triger veya zincir değişim bilgisi bilinmiyor ve araç yüksek kilometrede.",
    expectedFinding: {
      category: "Bakım durumu",
      severity: "medium",
      title: "Triger veya zincir geçmişi netleştirilmeli",
      recommendation: "Motor tipine göre triger/zincir bakım geçmişini fatura veya servis kaydıyla doğrulayın.",
    },
    validationQuestion: "Bu uyarının kilometre eşiği hangi aralıkta başlamalı?",
    feedbackRecord: {
      issueTitle: "[Kural geri bildirimi] Triger veya zincir geçmişi",
      feedbackType: "Bakım ve yakın masraf sinyali",
      anonymizedInputFields: ["Model yılı", "Kilometre", "Motor hacmi", "Yakıt türü", "Triger veya zincir bilgisi"],
      expectedBehaviorPrompt: "Yüksek kilometrede bilinmeyen triger/zincir bilgisi hangi seviyede uyarı üretmeli?",
      currentBehaviorPrompt: "Mevcut rapor bakım geçmişini yeterince görünür gösteriyor mu?",
      acceptanceEvidence: [
        "Kilometre eşiği kullanıcı geri bildirimi veya uzman görüşüyle netleşti.",
        "Pozitif ve negatif maintenance-rules unit testleri yazıldı.",
      ],
    },
  },
  {
    id: "document-owner-proxy-sale",
    moduleId: "listing-analysis",
    status: "needs-feedback",
    source: "expert-review",
    affectedRuleFile: "src/lib/analysis/rules/document-rules.ts",
    inputSignal: "Ruhsat sahibi bilgisi belirsiz veya satış vekaletle yapılacak.",
    expectedFinding: {
      category: "Evrak ve ekspertiz",
      severity: "medium",
      title: "Ruhsat sahibi ve satış yetkisi doğrulanmalı",
      recommendation: "Noter öncesinde ruhsat sahibi, vekalet geçerliliği, rehin ve haciz durumunu kontrol edin.",
    },
    validationQuestion: "Vekaletle satışta kullanıcıya hangi belge kontrolü ayrıca sorulmalı?",
    feedbackRecord: {
      issueTitle: "[Kural geri bildirimi] Ruhsat sahibi ve vekaletle satış",
      feedbackType: "Eksik bilgi ve belge uyarısı",
      anonymizedInputFields: ["Ruhsat sahibi bilgisi", "Satıcı açıklaması", "Şehir"],
      expectedBehaviorPrompt: "Vekaletle satış veya belirsiz ruhsat sahibi bilgisi hangi belge kontrolünü tetiklemeli?",
      currentBehaviorPrompt: "Mevcut rapor ruhsat sahibi ve satış yetkisini yeterince öne çıkarıyor mu?",
      acceptanceEvidence: [
        "Kullanıcı geri bildiriminde belge kontrolü ihtiyacı açıkça tekrarlandı.",
        "Pozitif ve negatif document-rules unit testleri yazıldı.",
      ],
    },
  },
];

export function candidatesByStatus(status: RuleCandidateStatus): RuleCandidate[] {
  return ruleCandidates.filter((candidate) => candidate.status === status);
}

export function ruleFeedbackIssueTitle(candidate: RuleCandidate): string {
  return candidate.feedbackRecord.issueTitle;
}
