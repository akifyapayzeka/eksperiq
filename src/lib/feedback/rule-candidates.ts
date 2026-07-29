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
};

export const ruleCandidates: RuleCandidate[] = [
  {
    id: "seller-claims-garage-kept",
    moduleId: "listing-analysis",
    status: "needs-feedback",
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
  },
];

export function candidatesByStatus(status: RuleCandidateStatus): RuleCandidate[] {
  return ruleCandidates.filter((candidate) => candidate.status === status);
}
