"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  MessageSquareText,
  Minus,
  Plus,
  Share2,
  X,
} from "lucide-react";
import { appConfig } from "@/lib/constants/app";
import { shareReportPdf } from "@/lib/report/pdf-share";
import { BUYER_DECISION_GUIDE, BUYER_EDUCATION_NOTES } from "@/lib/analysis/buyer-education";
import { mileageAnswer, mileageSummarySentence } from "@/lib/analysis/mileage-summary";
import { SCORE_WEIGHTS } from "@/lib/constants/analysis";
import {
  loadAnalysis,
  loadChecklist,
  loadFindingFilter,
  saveChecklist,
  saveFindingFilter,
  type StoredFindingFilter,
} from "@/lib/storage/analysis-storage";
import type { AnalysisResult, ScoreCategory } from "@/lib/analysis/types";
import { riskBucket } from "@/lib/analysis/risk-bucket";
import { SectionCard } from "@/components/ui/section-card";

const scoreLabels = {
  damageHistory: "Hasar geçmişi",
  maintenance: "Bakım durumu",
  mileageAgeBalance: "Kilometre ve yaş dengesi",
  descriptionTransparency: "İlan açıklamasının şeffaflığı",
  documentsExpertise: "Evrak ve ekspertiz bilgileri",
  sellerTrust: "Satıcı güven işaretleri",
};

const severityLabels = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
};

type FindingFilter = StoredFindingFilter;

const findingFilters: Array<{ value: FindingFilter; label: string }> = [
  { value: "all", label: "Tümü" },
  { value: "high", label: "Yüksek" },
  { value: "medium", label: "Orta" },
  { value: "low", label: "Düşük" },
];

type ReportTab = "karar" | "ozet" | "riskler" | "plan" | "arac" | "kontrol";

const reportTabs: Array<{ id: ReportTab; label: string }> = [
  { id: "karar", label: "Alıcı Kararı" },
  { id: "ozet", label: "Özet" },
  { id: "riskler", label: "Riskler" },
  { id: "plan", label: "Alım Planı" },
  { id: "arac", label: "Araç/Fotolar" },
  { id: "kontrol", label: "Kontrol Listesi" },
];

function severityClass(severity: string) {
  if (severity === "high") return "border-destructive/30 bg-destructive/10 text-destructive";
  if (severity === "medium") return "border-warning/30 bg-warning/10 text-warning";
  return "border-success/30 bg-success/10 text-success";
}

function scorePercent(category: ScoreCategory, value: number): number {
  return Math.round((value / SCORE_WEIGHTS[category]) * 100);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value);
}

type SellerQuestionHelp = {
  why: string;
  meaning: string;
};

function sellerQuestionHelp(question: string): SellerQuestionHelp {
  const text = question.toLocaleLowerCase("tr-TR");

  if (text.includes("ruhsatta") || text.includes("adınıza")) {
    return {
      why: "Aracı satan kişinin gerçekten satış yetkisi olup olmadığını anlamak için sorulur.",
      meaning:
        "Ruhsat sahibi satıcı değilse vekalet, noter süreci ve para transferi daha dikkatli ilerlemelidir; cevap kaçamaksa resmi kontrol şarttır.",
    };
  }
  if (text.includes("şasi numarası") || text.includes("şasi numarasının")) {
    return {
      why: "Tramer, servis, ekspertiz ve parça geçmişini aynı araç üzerinden doğrulamak için gerekir.",
      meaning:
        "Şasi bilgisini paylaşmaktan kaçınıyorsa araç geçmişini doğrulamanız zorlaşır; ekspertizde ruhsat ve şasi eşleşmesi mutlaka kontrol edilir.",
    };
  }
  if (text.includes("tramer")) {
    return {
      why: "Hasar kaydının sadece tutarı değil, tarihi ve hangi kazadan oluştuğu önemlidir.",
      meaning:
        "Eski ve küçük bir hasar ile yakın tarihli ağır hasar aynı risk değildir; tarih, tutar ve parça detayı pazarlık ve ekspertiz odağını belirler.",
    };
  }
  if (text.includes("değişen") || text.includes("boyalı")) {
    return {
      why: "Kaporta işleminin kozmetik mi, yapısal riske yakın mı olduğunu ayırmak için sorulur.",
      meaning:
        "Tampon gibi sök-tak parçalar genelde daha düşük risklidir; kaput, tavan, direk, podye gibi parçalar daha ciddi inceleme gerektirir.",
    };
  }
  if (text.includes("podye") || text.includes("direk") || text.includes("tavan") || text.includes("şasi,")) {
    return {
      why: "Aracın taşıyıcı gövdesinde işlem olup olmadığını anlamak için kritik sorudur.",
      meaning:
        "Bu bölgelerde işlem varsa güvenlik, değer kaybı ve satış kolaylığı etkilenebilir; bağımsız ekspertiz raporu olmadan karar verilmemelidir.",
    };
  }
  if (text.includes("airbag")) {
    return {
      why: "Airbag açılması genellikle ciddi darbe ihtimalini gösterir ve güvenlik sistemlerinin doğru onarılıp onarılmadığı önemlidir.",
      meaning:
        "Airbag değişimi varsa fatura, beyin/kayış/torpido kontrolleri ve arıza lambası taraması istenir; belgesiz onarım yüksek risktir.",
    };
  }
  if (text.includes("son bakım")) {
    return {
      why: "Bakımın zamanı ve kilometresi, aracın kısa vadede masraf çıkarma ihtimalini gösterir.",
      meaning:
        "Bakım yeni ve belgeli ise risk düşer; bakım tarihi belirsizse yağ, filtre, fren, sıvı ve ağır bakım masrafını satın alma fiyatına katmalısınız.",
    };
  }
  if (text.includes("bakım faturaları")) {
    return {
      why: "Satıcının 'bakımlı' iddiasını belgeyle doğrulamak için sorulur.",
      meaning:
        "Fatura veya servis kaydı varsa geçmiş daha güvenilir okunur; yoksa ekspertizde mekanik kontrolü geniş tutmak ve pazarlık payı bırakmak gerekir.",
    };
  }
  if (text.includes("triger") || text.includes("zincir")) {
    return {
      why: "Triger kayışı veya zincir ihmal edilirse motoru ciddi şekilde bozabilecek pahalı bir kalemdir.",
      meaning:
        "Değişim belgeli değilse yaş/km uygun olsa bile kısa vadede ağır bakım masrafı doğabilir; servis geçmişi veya usta kontrolü istenir.",
    };
  }
  if (text.includes("şanzıman yağı")) {
    return {
      why: "Otomatik şanzıman bakımı ihmal edilirse vuruntu, geçiş gecikmesi ve yüksek onarım masrafı oluşabilir.",
      meaning:
        "Yağ değişimi belgeli ise iyi işarettir; hiç değişmediyse test sürüşünde vites geçişleri ve kaçırma/vuruntu özellikle kontrol edilir.",
    };
  }
  if (text.includes("lastik")) {
    return {
      why: "Lastik yaşı ve durumu hem güvenlik hem de yakın masraf için önemlidir.",
      meaning:
        "Diş iyi görünse bile eski tarihli lastik sertleşmiş olabilir; dört lastik değişimi pazarlıkta ciddi bir masraf kalemidir.",
    };
  }
  if (text.includes("yedek anahtar")) {
    return {
      why: "Yedek anahtar hem kullanım kolaylığı hem de güvenlik ve ilerideki satış değeri için önemlidir.",
      meaning:
        "Yoksa yeni anahtar kodlama masrafı çıkabilir; ayrıca kayıp anahtar ihtimali için immobilizer/anahtar kayıt kontrolü istenebilir.",
    };
  }
  if (text.includes("arıza lambası")) {
    return {
      why: "Gösterge panelindeki aktif uyarılar görünmeyen motor, emisyon, fren veya güvenlik sistemi sorunlarını işaret edebilir.",
      meaning:
        "Lamba yanıyorsa OBD arıza kodu okutulmalı; satıcı 'önemsiz' dese bile kod görülmeden risk düşük kabul edilmemelidir.",
    };
  }
  if (text.includes("soğuk motor")) {
    return {
      why: "Bazı motor, enjektör, zincir, turbo ve duman sorunları araç sıcakken gizlenebilir.",
      meaning:
        "Soğuk çalıştırmada zor çalışma, ses, duman veya titreme varsa mekanik kontrol derinleşmeli; satıcı izin vermiyorsa dikkatli olunmalıdır.",
    };
  }
  if (text.includes("ekspertiz")) {
    return {
      why: "Satıcının aracı bağımsız kontrole açıp açmadığını görmek için sorulur.",
      meaning:
        "Kendi seçtiğiniz ekspertize izin veriyorsa iyi işarettir; belirli yere yönlendirme veya kaçınma varsa risk artar.",
    };
  }
  if (text.includes("rehin") || text.includes("haciz") || text.includes("borç")) {
    return {
      why: "Noter satışında veya satış sonrasında hukuki/finansal sorun yaşamamak için sorulur.",
      meaning:
        "Rehin, haciz, MTV veya ceza borcu varsa satış tamamlanmayabilir ya da ek ödeme çıkabilir; e-Devlet/noter kontrolü yapılmalıdır.",
    };
  }
  if (text.includes("kilometre")) {
    return {
      why: "Kilometrenin gerçekçi olup olmadığını TÜVTÜRK, servis ve muayene kayıtlarıyla karşılaştırmak için sorulur.",
      meaning:
        "Kayıtlar birbiriyle uyumsuzsa km düşürme veya eksik geçmiş şüphesi doğar; fiyat ve satın alma kararı buna göre yeniden değerlendirilir.",
    };
  }
  if (text.includes("lpg")) {
    return {
      why: "LPG ruhsata işli değilse muayene, sigorta ve satış sürecinde problem çıkarabilir.",
      meaning:
        "Ruhsata işliyse proje/muayene uyumu kontrol edilir; işli değilse yasal işlem ve dönüşüm masrafı alıcıya kalabilir.",
    };
  }
  if (text.includes("yağ yakma") || text.includes("su eksiltme") || text.includes("hararet")) {
    return {
      why: "Bu belirtiler motor içi aşınma, conta, soğutma sistemi veya turbo gibi pahalı sorunlara işaret edebilir.",
      meaning:
        "Satıcı kabul ediyorsa masraf büyüyebilir; reddetse bile ekspertizde kompresyon, kaçak, duman ve soğutma testi istenmelidir.",
    };
  }
  if (text.includes("satış sebebi")) {
    return {
      why: "Satıcının hikayesindeki tutarlılığı ve acele satış sebebini anlamak için sorulur.",
      meaning:
        "Net ve tutarlı cevap güveni artırır; sürekli değişen, baskı kuran veya 'detay telefonda' diyen cevaplarda belgeyle ilerlemek gerekir.",
    };
  }
  if (text.includes("dpf") || text.includes("partikül")) {
    return {
      why: "Dizel araçlarda DPF tıkanması performans düşüşü, arıza lambası ve yüksek temizlik/değişim masrafı doğurabilir.",
      meaning:
        "Temizlik/değişim belgesi iyi işarettir; iptal edilmiş veya sürekli arıza veren DPF hem yasal hem mekanik risk oluşturur.",
    };
  }
  if (text.includes("turbo")) {
    return {
      why: "Turbo arızası yağ tüketimi, çekiş düşüklüğü ve pahalı onarım anlamına gelebilir.",
      meaning:
        "Bakım veya değişim belgeli değilse test sürüşünde ıslık sesi, duman, geç dolma ve yağ kaçağı kontrol edilmelidir.",
    };
  }
  if (text.includes("batarya")) {
    return {
      why: "Hibrit/elektrikli araçlarda batarya sağlığı aracın değeri ve ilerideki en büyük masraf kalemlerinden biridir.",
      meaning:
        "Sağlık raporu ve garanti varsa risk azalır; yoksa menzil düşüşü, hücre dengesi ve garanti şartları kontrol edilmelidir.",
    };
  }
  if (text.includes("aktarma") || text.includes("transfer") || text.includes("diferansiyel")) {
    return {
      why: "4x4/AWD sistemlerinde ihmal edilen yağ bakımı ve sert kullanım pahalı aktarma sorunlarına yol açabilir.",
      meaning:
        "Bakım kaydı yoksa test sürüşünde uğultu, vuruntu, titreme ve çekiş sistemi uyarıları özellikle kontrol edilir.",
    };
  }
  if (text.includes("süspansiyon") || text.includes("motor takoz")) {
    return {
      why: "Yüksek kilometrede yürüyen aksam ve motor bağlantıları konforu, güvenliği ve masrafı doğrudan etkiler.",
      meaning:
        "Değişim yoksa rot, burç, amortisör, takoz ve salıncak kontrolleri yapılmalı; ses/titreşim pazarlık kalemi olabilir.",
    };
  }
  if (text.includes("pas") || text.includes("korozyon")) {
    return {
      why: "Pas özellikle eski araçlarda gizli yapısal zayıflık ve ileride büyüyen kaporta masrafı anlamına gelebilir.",
      meaning:
        "Alt takım, marşpiyel, kapı içleri ve şase noktalarında pas varsa ekspertiz ve lift kontrolü olmadan karar verilmemelidir.",
    };
  }

  return {
    why: "Bu soru, satıcının iddiasını somut bilgi veya belgeyle destekleyip desteklemediğini anlamak için sorulur.",
    meaning:
      "Net, yazılı ve belgeye dayalı cevap güveni artırır; belirsiz cevaplarda ekspertiz kapsamını genişletmek ve pazarlık payı bırakmak gerekir.",
  };
}

function SellerQuestionCard({ question, index }: { question: string; index: number }) {
  const help = sellerQuestionHelp(question);

  return (
    <li className="list-none">
      <details className="group rounded-theme-sm border border-border bg-card">
        <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 marker:hidden">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/10 text-sm font-bold text-accent">
            {index}
          </span>
          <span className="min-w-0 flex-1 text-sm font-semibold leading-6 text-foreground">{question}</span>
          <Plus
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-muted-foreground group-open:hidden"
            strokeWidth={2.2}
          />
          <Minus
            aria-hidden="true"
            className="hidden h-4 w-4 shrink-0 text-accent group-open:block"
            strokeWidth={2.2}
          />
        </summary>
        <div className="border-t border-border bg-muted/60 px-4 py-4">
          <div className="grid gap-3 text-sm leading-6 sm:grid-cols-2">
            <div>
              <p className="font-semibold text-foreground">Neden sorulur?</p>
              <p className="mt-1 text-muted-foreground">{help.why}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Cevap ne anlatır?</p>
              <p className="mt-1 text-muted-foreground">{help.meaning}</p>
            </div>
          </div>
        </div>
      </details>
    </li>
  );
}

function formatReportDate(value: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function findingCount(result: AnalysisResult, severity: keyof typeof severityLabels): number {
  return result.findings.filter((finding) => finding.severity === severity).length;
}

/**
 * Reuses riskBucket() (the single source of truth for score thresholds) —
 * previously this had its own 4-band 80/60/40 scale, which could disagree
 * with RiskBadge/ScoreRing. Now always the same 3-band low/medium/high.
 */
function riskToneClass(score: number): string {
  const bucket = riskBucket(score);
  if (bucket === "low") return "bg-success/10 text-success ring-success/30";
  if (bucket === "medium") return "bg-warning/10 text-warning ring-warning/30";
  return "bg-destructive/10 text-destructive ring-destructive/30";
}

function simpleFindingMeaning(category: string): string {
  const normalized = category.toLocaleLowerCase("tr-TR");
  if (normalized.includes("hasar")) {
    return "Bu başlık aracın güvenliği, ikinci el değeri ve satarken alıcı bulması açısından önemlidir.";
  }
  if (normalized.includes("bakım")) {
    return "Bakım belgesi yoksa küçük ihmal ileride motor, şanzıman veya soğutma masrafına dönüşebilir.";
  }
  if (normalized.includes("evrak") || normalized.includes("ekspertiz")) {
    return "Belgeyle doğrulanmayan bilgi satıcı beyanı olarak kalır; satın almadan önce kanıt görmek gerekir.";
  }
  if (normalized.includes("satıcı")) {
    return "Satıcı açıklaması ne kadar belirsizse, yazılı soru ve bağımsız kontrol o kadar önem kazanır.";
  }
  if (normalized.includes("kilometre")) {
    return "Kilometre, yaş ve kullanım tipi birlikte değerlendirilmezse gerçek yıpranma seviyesi kaçabilir.";
  }
  return "Bu bulgu tek başına kesin karar verdirmez; pazarlık, ekspertiz ve belge kontrolünde öncelik verir.";
}

const SCORE_RING_RADIUS = 16;
const SCORE_RING_CIRCUMFERENCE = 2 * Math.PI * SCORE_RING_RADIUS;
const MIN_IMAGE_ZOOM = 1;
const MAX_IMAGE_ZOOM = 4;

function clampListingImageZoom(value: number): number {
  return Math.min(MAX_IMAGE_ZOOM, Math.max(MIN_IMAGE_ZOOM, Number(value.toFixed(2))));
}

function touchDistance(touches: {
  length: number;
  item(index: number): { clientX: number; clientY: number } | null;
}): number | null {
  if (touches.length < 2) return null;
  const first = touches.item(0);
  const second = touches.item(1);
  if (!first || !second) return null;
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
}

function scoreRingOffset(score: number): number {
  const clamped = Math.min(100, Math.max(0, score));
  return SCORE_RING_CIRCUMFERENCE - (clamped / 100) * SCORE_RING_CIRCUMFERENCE;
}

function scoreRingColorClass(score: number): string {
  const bucket = riskBucket(score);
  if (bucket === "low") return "stroke-success";
  if (bucket === "medium") return "stroke-warning";
  return "stroke-destructive";
}

function buyerDecision(result: AnalysisResult): {
  label: string;
  headline: string;
  reasons: string[];
  conditions: string[];
} {
  const highCount = findingCount(result, "high");
  const mediumCount = findingCount(result, "medium");
  const missingCount = result.completeness.missing.length;
  const topFindings = result.findings.slice(0, 3).map((finding) => finding.title);
  const topQuestions = result.sellerQuestions.slice(0, 3);

  if (highCount > 0 || result.totalScore < 60) {
    return {
      label: "Dikkatli yaklaş",
      headline: "Bu araç ancak kritik konular doğrulanırsa değerlendirilmeli.",
      reasons: topFindings.length ? topFindings : ["Risk skoru satın alma öncesi ek doğrulama gerektiriyor."],
      conditions: topQuestions.length
        ? topQuestions
        : ["TRAMER, boya/değişen ve bakım kayıtlarını yazılı kanıtla doğrulayın."],
    };
  }

  if (mediumCount > 0 || missingCount > 3 || result.totalScore < 80) {
    return {
      label: "Şartlı alınır",
      headline: "İlan mantıklı olabilir; karar ekspertiz ve belge doğrulamasına bağlı.",
      reasons: topFindings.length ? topFindings : ["Bazı bilgiler eksik veya orta riskli başlıklar var."],
      conditions: topQuestions.length
        ? topQuestions
        : ["Eksik bilgileri satıcıdan isteyin ve ekspertizde özellikle kontrol ettirin."],
    };
  }

  return {
    label: "Değerlendirilebilir",
    headline: "Mevcut bilgilerle araç incelenmeye değer görünüyor.",
    reasons: result.strengths.slice(0, 3),
    conditions: [
      "TRAMER ve kilometre kaydını resmi kanaldan doğrulayın.",
      "Bağımsız ekspertiz raporu almadan kapora veya kesin karar vermeyin.",
      "Test sürüşünde motor, şanzıman, fren ve yürüyen aksamı özellikle kontrol edin.",
    ],
  };
}

function answeredBuyerQuestions(result: AnalysisResult): Array<{ question: string; answer: string }> {
  const knownIssueAnswer = result.knownIssues.length
    ? `${result.knownIssues.length} bilinen model/motor riski eşleşti; en önemlileri Riskler sekmesinde.`
    : "Bu araç için veritabanında net kronik sorun eşleşmesi bulunamadı; bu, araç sorunsuz demek değildir.";
  const damageAnswer = result.findings.some((finding) => finding.category.toLocaleLowerCase("tr-TR").includes("hasar"))
    ? "Hasar/boya/değişen tarafında kontrol edilmesi gereken bulgular var."
    : "Girilen veriyle ağır hasar tarafında belirgin bulgu az; yine de TRAMER ve boya ölçümü şart.";
  const priceAnswer =
    result.input.price > 0
      ? `İstenen fiyat ${formatCurrency(result.input.price)}; pazarlık gerekçelerini Alım Planı sekmesinde kullanın.`
      : "İlanda fiyat net alınamadı; fiyat olmadan piyasa karşılaştırması ve pazarlık sağlıklı olmaz.";

  return [
    { question: "Bu araç alınır mı?", answer: buyerDecision(result).headline },
    { question: "Kronik sorunu var mı?", answer: knownIssueAnswer },
    {
      question: "Km normal mi?",
      answer: mileageAnswer(result.mileage),
    },
    { question: "Boya/değişen/tramer riskli mi?", answer: damageAnswer },
    { question: "Fiyat pazarlığı yapılır mı?", answer: priceAnswer },
  ];
}

function negotiationReasons(result: AnalysisResult): string[] {
  const reasons = [
    ...result.findings
      .filter((finding) => finding.severity !== "low")
      .slice(0, 3)
      .map((finding) => finding.title),
    ...result.costs
      .filter((cost) => cost.level !== "Düşük" && cost.level !== "Yakın tarihli")
      .slice(0, 2)
      .map((cost) => `${cost.item}: ${cost.level}`),
  ];
  if (result.completeness.missing.length) {
    reasons.push(`Eksik bilgi: ${result.completeness.missing.slice(0, 3).join(", ")}`);
  }
  return Array.from(new Set(reasons)).slice(0, 6);
}

function sellerMessage(result: AnalysisResult): string {
  const vehicle = `${result.input.year} ${result.input.brand} ${result.input.model}`;
  const questions = result.sellerQuestions.slice(0, 4).map((question) => `- ${question}`);
  return `Merhaba, ${vehicle} ilanınızla ilgileniyorum. Aracı görmeden önce şu bilgileri yazılı paylaşabilir misiniz?
${questions.join("\n")}

Uygunsa aracı bağımsız ekspertize göstermek ve TRAMER/kilometre kayıtlarını doğrulamak istiyorum.`;
}

const reportActionLinks = [
  {
    title: "Satın alma rehberi",
    description: "İlandan notere kadar adım adım ne yapacağınızı görün.",
    href: "/satin-alma-rehberi",
  },
  {
    title: "Resmi sorgular",
    description: "TRAMER, km, ruhsat, şasi, rehin, haciz ve borç kontrollerini sıraya koyun.",
    href: "/resmi-sorgu-rehberi",
  },
  {
    title: "Yakındaki ekspertiz",
    description: "Aracı kendi seçeceğiniz ekspertize götürmek için konuma göre firma bulun.",
    href: "/yakinimdaki-hizmetler?kategori=ekspertiz",
  },
  {
    title: "Masraf tahmini",
    description: "Çıkabilecek bakım/onarım kalemlerini pazarlık öncesi yaklaşık aralıkla görün.",
    href: "/onarim-maliyeti",
  },
];

const purchaseDocumentChecks = [
  "Plaka, şasi ve motor numarası ruhsatla eşleşiyor mu kontrol edin.",
  "TRAMER/hasar kaydı ve kilometre geçmişini resmi kanaldan doğrulayın.",
  "Rehin, haciz, vergi/ceza borcu ve muayene durumunu noter öncesi netleştirin.",
  "Kapora verilecekse açıklamaya araç plakası/şasi, tarih ve iade şartını yazın.",
  "Satıştan hemen sonra trafik sigortası ve ilk bakım planını yapın.",
];

export function ResultClient() {
  const [isReady, setIsReady] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "summary-copied" | "shared" | "downloaded" | "failed">("idle");
  const [findingFilter, setFindingFilter] = useState<FindingFilter>("all");
  const [checkedChecklist, setCheckedChecklist] = useState<Set<string>>(new Set());
  const [scoreRingFilled, setScoreRingFilled] = useState(false);
  const [toastNonce, setToastNonce] = useState(0);
  const [activeTab, setActiveTab] = useState<ReportTab>("karar");
  const [selectedListingImageIndex, setSelectedListingImageIndex] = useState<number | null>(null);
  const [listingImageZoom, setListingImageZoom] = useState(MIN_IMAGE_ZOOM);
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef(MIN_IMAGE_ZOOM);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const pinchActiveRef = useRef(false);

  const listingImages = result?.listingImages ?? [];
  const selectedListingImage =
    selectedListingImageIndex !== null ? (listingImages[selectedListingImageIndex] ?? null) : null;

  // setCopyStatus alone doesn't restart the toast if the same action is
  // repeated within 3s (React bails out on setting an identical primitive
  // value, so the animation would silently never replay) — bump a nonce
  // alongside every real status change and key the toast element on it.
  function announceCopyStatus(status: Exclude<typeof copyStatus, "idle">) {
    setCopyStatus(status);
    setToastNonce((current) => current + 1);
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const current = loadAnalysis();
      setResult(current);
      setFindingFilter(loadFindingFilter());
      setCheckedChecklist(new Set(current ? loadChecklist(current.finalChecklist) : []));
      setIsReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!result) return;
    const timer = window.setTimeout(() => setScoreRingFilled(true), 80);
    return () => window.clearTimeout(timer);
  }, [result]);

  useEffect(() => {
    if (copyStatus === "idle") return;
    const timer = window.setTimeout(() => setCopyStatus("idle"), 3000);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  useEffect(() => {
    if (selectedListingImageIndex === null) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedListingImageIndex(null);
      if (event.key === "ArrowLeft" && listingImages.length > 1) {
        setSelectedListingImageIndex((current) =>
          current === null ? current : (current - 1 + listingImages.length) % listingImages.length,
        );
        setListingImageZoom(MIN_IMAGE_ZOOM);
      }
      if (event.key === "ArrowRight" && listingImages.length > 1) {
        setSelectedListingImageIndex((current) => (current === null ? current : (current + 1) % listingImages.length));
        setListingImageZoom(MIN_IMAGE_ZOOM);
      }
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [listingImages.length, selectedListingImageIndex]);

  function openListingImage(index: number) {
    setSelectedListingImageIndex(index);
    setListingImageZoom(MIN_IMAGE_ZOOM);
  }

  function closeListingImage() {
    setSelectedListingImageIndex(null);
    setListingImageZoom(MIN_IMAGE_ZOOM);
    pinchStartDistanceRef.current = null;
    pinchStartZoomRef.current = MIN_IMAGE_ZOOM;
    swipeStartRef.current = null;
    pinchActiveRef.current = false;
  }

  function navigateListingImage(delta: number) {
    if (listingImages.length < 2) return;
    setSelectedListingImageIndex((current) =>
      current === null ? current : (current + delta + listingImages.length) % listingImages.length,
    );
    setListingImageZoom(MIN_IMAGE_ZOOM);
    pinchStartDistanceRef.current = null;
    pinchStartZoomRef.current = MIN_IMAGE_ZOOM;
    swipeStartRef.current = null;
    pinchActiveRef.current = false;
  }

  function handleListingImageTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    const distance = touchDistance(event.touches);
    if (distance) {
      pinchActiveRef.current = true;
      swipeStartRef.current = null;
      pinchStartDistanceRef.current = distance;
      pinchStartZoomRef.current = listingImageZoom;
      return;
    }
    const touch = event.touches.item(0);
    swipeStartRef.current =
      touch && listingImageZoom === MIN_IMAGE_ZOOM ? { x: touch.clientX, y: touch.clientY } : null;
    pinchActiveRef.current = false;
  }

  function handleListingImageTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    const startDistance = pinchStartDistanceRef.current;
    const currentDistance = touchDistance(event.touches);
    if (!startDistance || !currentDistance) return;
    event.preventDefault();
    setListingImageZoom(clampListingImageZoom(pinchStartZoomRef.current * (currentDistance / startDistance)));
  }

  function handleListingImageTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (event.touches.length >= 2) {
      const distance = touchDistance(event.touches);
      if (distance) {
        pinchStartDistanceRef.current = distance;
        pinchStartZoomRef.current = listingImageZoom;
      }
      return;
    }
    if (pinchActiveRef.current) {
      pinchStartDistanceRef.current = null;
      pinchStartZoomRef.current = listingImageZoom;
      pinchActiveRef.current = false;
      swipeStartRef.current = null;
      return;
    }
    const start = swipeStartRef.current;
    const touch = event.changedTouches.item(0);
    if (start && touch && listingImages.length > 1 && listingImageZoom === MIN_IMAGE_ZOOM) {
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      if (Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
        navigateListingImage(deltaX < 0 ? 1 : -1);
        return;
      }
    }
    pinchStartDistanceRef.current = null;
    pinchStartZoomRef.current = listingImageZoom;
    swipeStartRef.current = null;
  }

  async function copyText(text: string, successStatus: "summary-copied") {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        copyTextWithFallback(text);
      }
      announceCopyStatus(successStatus);
    } catch {
      try {
        copyTextWithFallback(text);
        announceCopyStatus(successStatus);
      } catch {
        announceCopyStatus("failed");
      }
    }
  }

  function copyTextWithFallback(text: string) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (!copied) {
      throw new Error("Copy fallback failed");
    }
  }

  async function shareSummary() {
    if (!result) return;

    const outcome = await shareReportPdf(result);

    if (outcome === "shared") {
      announceCopyStatus("shared");
    } else if (outcome === "downloaded") {
      announceCopyStatus("downloaded");
    } else {
      announceCopyStatus("failed");
    }
  }

  function actionStatusMessage() {
    if (copyStatus === "summary-copied") return "Rapor özeti panoya kopyalandı.";
    if (copyStatus === "shared") return "Rapor PDF'i paylaşım paneline gönderildi.";
    if (copyStatus === "downloaded") return "Rapor PDF olarak indirildi.";
    if (copyStatus === "failed") return "Paylaşma veya kopyalama tarayıcı tarafından engellendi.";
    return "";
  }

  function selectFindingFilter(filter: FindingFilter) {
    setFindingFilter(filter);
    saveFindingFilter(filter);
  }

  function toggleChecklistItem(item: string) {
    setCheckedChecklist((current) => {
      const next = new Set(current);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      saveChecklist([...next]);
      return next;
    });
  }

  if (!isReady) {
    return (
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-4 pb-28 pt-12 text-center sm:px-6 sm:pb-12 lg:px-8">
          <h1 className="text-3xl font-semibold text-foreground">Rapor hazırlanıyor</h1>
          <p className="mt-3 leading-7 text-foreground/80">Mevcut tarayıcı oturumundaki analiz kontrol ediliyor.</p>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-3xl px-4 pb-28 pt-12 text-center sm:px-6 sm:pb-12 lg:px-8">
          <h1 className="text-3xl font-semibold text-foreground">Analiz bulunamadı</h1>
          <p className="mt-3 leading-7 text-foreground/80">
            Sayfa yenilenmiş olabilir. Sonuç verisi URL içine yazılmaz ve yalnızca mevcut tarayıcı oturumunda tutulur.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-12 items-center rounded-full bg-primary px-5 font-semibold text-primary-foreground"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </main>
    );
  }

  const visibleFindings =
    findingFilter === "all" ? result.findings : result.findings.filter((finding) => finding.severity === findingFilter);
  const decision = buyerDecision(result);
  const answeredQuestions = answeredBuyerQuestions(result);
  const negotiationItems = negotiationReasons(result);
  const sellerMessageText = sellerMessage(result);

  return (
    <>
      <main className="flex-1 bg-background">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 pb-28 pt-6 sm:px-6 sm:pb-6 lg:px-8">
          <div className="print-only mb-2 flex items-center justify-between border-b border-border pb-3">
            <p className="text-lg font-semibold text-foreground">{appConfig.name}</p>
            <p className="text-sm text-muted-foreground">Rapor oluşturma: {formatReportDate(result.generatedAt)}</p>
          </div>
          <section className="overflow-hidden rounded-theme border border-border bg-card shadow-sm">
            <div className="bg-secondary p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Araç Risk Skoru</p>
                  <h1 className="mt-2 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
                    {result.input.year} {result.input.brand} {result.input.model}
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Rapor tarihi: {formatReportDate(result.generatedAt)}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${riskToneClass(
                    result.totalScore,
                  )}`}
                >
                  {result.riskLabel}
                </span>
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-[220px_1fr] lg:items-stretch">
                <div className="rounded-theme border border-border bg-card p-5 shadow-sm">
                  <div
                    className="relative mx-auto h-32 w-32"
                    role="img"
                    aria-label={`Araç risk skoru ${result.totalScore} / 100, ${result.riskLabel}`}
                  >
                    <svg viewBox="0 0 40 40" className="h-32 w-32 -rotate-90">
                      <circle
                        cx="20"
                        cy="20"
                        r={SCORE_RING_RADIUS}
                        fill="none"
                        strokeWidth="4"
                        className="stroke-muted"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r={SCORE_RING_RADIUS}
                        fill="none"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className={`transition-[stroke-dashoffset] duration-700 ease-out ${scoreRingColorClass(
                          result.totalScore,
                        )}`}
                        strokeDasharray={SCORE_RING_CIRCUMFERENCE}
                        strokeDashoffset={
                          scoreRingFilled ? scoreRingOffset(result.totalScore) : SCORE_RING_CIRCUMFERENCE
                        }
                      />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center text-center">
                      <div>
                        <strong className="block text-3xl text-foreground">{result.totalScore}</strong>
                        <span className="text-sm font-medium text-muted-foreground">/100</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-center text-sm font-medium text-foreground/80">
                    Skor kesin hüküm değil, inceleme önceliği verir.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-theme border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">Kısa karar özeti</p>
                    <p className="mt-2 text-lg font-semibold leading-snug text-foreground">{result.decision}</p>
                  </div>
                  <div className="rounded-theme border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">Riskli bulgu</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {findingCount(result, "high")} yüksek, {findingCount(result, "medium")} orta
                    </p>
                  </div>
                  <div className="rounded-theme border border-border bg-card p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground">Bilgi durumu</p>
                    <p className="mt-2 text-lg font-semibold text-foreground">
                      {result.completeness.completed} / {result.completeness.total}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="no-print grid gap-3 border-t border-border bg-card p-4 sm:grid-cols-2">
              {/* Raporu Aç: kullanıcının göndereceği referans ekran görüntüsü bekleniyor (kart içinde PDF görüntüleyici). */}
              <button
                type="button"
                onClick={shareSummary}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full transition active:scale-95 bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <Share2 aria-hidden="true" className="h-4 w-4" />
                Raporu paylaş
              </button>
            </div>
            {copyStatus !== "idle" ? (
              <div
                key={toastNonce}
                role="status"
                className="animate-toast-pop no-print fixed inset-x-0 bottom-24 z-40 flex justify-center px-4"
              >
                <p
                  className={`rounded-full px-4 py-2 text-sm font-semibold shadow-lg ${
                    copyStatus === "failed"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-accent text-primary-foreground"
                  }`}
                >
                  {actionStatusMessage()}
                </p>
              </div>
            ) : null}
          </section>
          <div
            role="tablist"
            aria-label="Rapor bölümleri"
            className="no-print flex gap-2 overflow-x-auto rounded-theme border border-border bg-card p-1.5 shadow-sm"
          >
            {reportTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`rapor-sekme-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`rapor-panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-11 shrink-0 rounded-theme-sm px-4 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/80 hover:bg-secondary hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id="rapor-panel-karar"
            aria-labelledby="rapor-sekme-karar"
            className={`report-tab-panel ${activeTab === "karar" ? "contents" : "hidden"}`}
          >
            <SectionCard
              accent={
                riskBucket(result.totalScore) === "low"
                  ? "success"
                  : riskBucket(result.totalScore) === "medium"
                    ? "warning"
                    : "danger"
              }
              title="Alıcı kararı"
              description="Google'da aratacağınız ana soruya kısa cevap: bu araç hangi şartlarla değerlendirilmeli?"
            >
              <div className="grid gap-4 rounded-theme border border-border bg-muted p-4 lg:grid-cols-[1fr_1fr]">
                <div>
                  <span className="inline-flex rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
                    {decision.label}
                  </span>
                  <p className="mt-3 text-xl font-semibold leading-snug text-foreground">{decision.headline}</p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-foreground">Neden?</p>
                    <ul className="mt-2 grid gap-2 text-sm leading-6 text-foreground/80">
                      {decision.reasons.map((reason) => (
                        <li key={reason} className="flex gap-2">
                          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="rounded-theme-sm border border-border bg-card p-4">
                  <p className="text-sm font-semibold text-foreground">Almadan önce şartlar</p>
                  <ol className="mt-2 grid list-decimal gap-2 pl-5 text-sm leading-6 text-foreground/80">
                    {decision.conditions.map((condition) => (
                      <li key={condition}>{condition}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </SectionCard>
            <SectionCard
              accent="violet"
              title="EksperIQ hangi soruları cevapladı?"
              description="Araç alacak kişinin Google'da ayrı ayrı aratacağı başlıkları tek yerde toplar."
            >
              <div className="grid gap-3 md:grid-cols-2">
                {answeredQuestions.map((item) => (
                  <article key={item.question} className="rounded-lg border border-border bg-card p-4">
                    <p className="font-semibold text-foreground">{item.question}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                  </article>
                ))}
              </div>
            </SectionCard>
            <SectionCard
              accent="success"
              title="Buradan sonra hangi ekrana gitmeliyim?"
              description="Araştırmalarda en çok aranan konular rapordan sonraki net adımlara bağlandı."
            >
              <div className="grid gap-3 md:grid-cols-2">
                {reportActionLinks.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="rounded-theme-sm border border-border bg-card p-4 hover:border-accent"
                  >
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                      Aç <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </SectionCard>
            <SectionCard
              accent="warning"
              title="Satın alma mantığı"
              description="Önce kanıt, sonra pahalı risk, sonra fiyat ve noter."
            >
              <div className="grid gap-3 md:grid-cols-2">
                {BUYER_DECISION_GUIDE.map((item) => (
                  <article key={item.title} className="rounded-lg border border-border bg-muted p-4">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.meaning}</p>
                    <p className="mt-2 text-sm font-medium leading-6 text-foreground/90">{item.action}</p>
                  </article>
                ))}
              </div>
            </SectionCard>
          </div>
          <div
            role="tabpanel"
            id="rapor-panel-ozet"
            aria-labelledby="rapor-sekme-ozet"
            className={`report-tab-panel ${activeTab === "ozet" ? "contents" : "hidden"}`}
          >
            <SectionCard
              accent="warning"
              title="Paylaşılabilir kısa özet"
              description="Uzun rapor yerine satıcıya, ekspertize veya kendinize gönderebileceğiniz kısa karar desteği özeti."
            >
              <div className="rounded-theme border border-border bg-muted p-4">
                <div className="grid gap-3 text-sm leading-6 text-foreground/80">
                  <p>
                    <strong className="text-foreground">
                      {result.input.year} {result.input.brand} {result.input.model}
                    </strong>{" "}
                    için EksperIQ skoru {result.totalScore}/100, sonuç: {result.riskLabel}.
                  </p>
                  <p>
                    Karar özeti: <strong className="text-foreground">{result.decision}</strong>
                  </p>
                  <div>
                    <p className="font-semibold text-foreground">İlk kontrol edilecek bulgular</p>
                    <ul className="mt-2 grid gap-1">
                      {result.findings.slice(0, 3).map((finding) => (
                        <li key={finding.id}>- {finding.title}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Satıcıya ilk sorular</p>
                    <ol className="mt-2 grid list-decimal gap-1 pl-5">
                      {result.sellerQuestions.slice(0, 3).map((question) => (
                        <li key={question}>{question}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </SectionCard>
            <SectionCard
              accent="success"
              title="Bilgi doluluğu"
              description="Daha fazla doğrulanabilir bilgi girildikçe raporun karar desteği değeri artar."
            >
              <div className="rounded-lg border border-border bg-muted p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground/90">Dolu bilgi alanları</span>
                  <strong
                    className="text-foreground"
                    aria-label={`Bilgi doluluğu ${result.completeness.completed} / ${result.completeness.total}`}
                  >
                    {result.completeness.completed} / {result.completeness.total}
                  </strong>
                </div>
                <div
                  className="mt-3 h-2 rounded-full bg-muted"
                  role="progressbar"
                  aria-label="Bilgi doluluğu yüzdesi"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={result.completeness.percentage}
                >
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${result.completeness.percentage}%` }} />
                </div>
                {result.completeness.missing.length ? (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-foreground/90">Satıcıdan tamamlanması istenecek bilgiler</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.completeness.missing.slice(0, 10).map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground/80"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-foreground/80">Temel bilgi alanları dolu görünüyor.</p>
                )}
              </div>
            </SectionCard>
          </div>
          <div
            id="rapor-panel-ozet-devam"
            className={`report-tab-panel ${activeTab === "ozet" ? "contents" : "hidden"}`}
          >
            <SectionCard title="Kategori skorları" accent="violet">
              <div className="grid gap-3 md:grid-cols-2">
                {Object.entries(result.breakdown).map(([key, value]) => {
                  const category = key as ScoreCategory;
                  const label = scoreLabels[category];

                  return (
                    <div key={key} className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-foreground/90">{label}</span>
                        <span className="font-semibold text-foreground">
                          {value} / {SCORE_WEIGHTS[category]}
                        </span>
                      </div>
                      <div
                        className="mt-3 h-2 rounded-full bg-muted"
                        role="progressbar"
                        aria-label={`${label} skoru`}
                        aria-valuemin={0}
                        aria-valuemax={SCORE_WEIGHTS[category]}
                        aria-valuenow={value}
                      >
                        <div
                          className="h-2 rounded-full bg-accent"
                          style={{ width: `${scorePercent(category, value)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
            <SectionCard
              accent="success"
              title="Güçlü taraflar"
              description="Bu maddeler girdiğiniz bilgiye dayanır; TRAMER veya e-Devlet'ten doğrulanmadıkça kesin kabul edilmemelidir."
            >
              <ul className="grid gap-2">
                {result.strengths.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard
              accent="warning"
              id="rapor-aksiyonlar"
              title="Öncelikli ilk aksiyonlar"
              description="Satıcıyla görüşmeden veya ekspertize gitmeden önce netleştirmeniz gereken başlıklar."
            >
              <ol className="grid list-decimal gap-3 pl-5">
                {result.priorityActions.map((action) => (
                  <li key={action.title} className="pl-1">
                    <span className="font-semibold text-foreground">{action.title}</span>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">Neden: {action.reason}</p>
                  </li>
                ))}
              </ol>
            </SectionCard>
          </div>
          <div
            role="tabpanel"
            id="rapor-panel-riskler"
            aria-labelledby="rapor-sekme-riskler"
            className={`report-tab-panel ${activeTab === "riskler" ? "contents" : "hidden"}`}
          >
            <SectionCard id="rapor-bulgular" title="Riskli noktalar" accent="danger">
              <div className="mb-4 grid gap-3 sm:grid-cols-3" aria-label="Risk bulgusu dağılımı">
                <div className="rounded-theme-sm border border-destructive/30 bg-destructive/10 p-3">
                  <p className="text-sm font-medium text-destructive">Yüksek riskli bulgu</p>
                  <strong className="mt-1 block text-2xl text-destructive">{findingCount(result, "high")}</strong>
                </div>
                <div className="rounded-theme-sm border border-warning/30 bg-warning/10 p-3">
                  <p className="text-sm font-medium text-warning">Orta riskli bulgu</p>
                  <strong className="mt-1 block text-2xl text-warning">{findingCount(result, "medium")}</strong>
                </div>
                <div className="rounded-theme-sm border border-success/30 bg-success/10 p-3">
                  <p className="text-sm font-medium text-success">Düşük riskli bulgu</p>
                  <strong className="mt-1 block text-2xl text-success">{findingCount(result, "low")}</strong>
                </div>
              </div>
              <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Risk bulgusu filtresi">
                {findingFilters.map((filter) => {
                  const isActive = findingFilter === filter.value;
                  const count = filter.value === "all" ? result.findings.length : findingCount(result, filter.value);

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => selectFindingFilter(filter.value)}
                      className={`min-h-11 rounded-theme-sm border px-4 text-sm font-semibold ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground/90 hover:border-accent hover:text-accent"
                      }`}
                    >
                      {filter.label} ({count})
                    </button>
                  );
                })}
              </div>
              <div className="grid gap-3">
                {visibleFindings.map((finding) => (
                  <article key={finding.id} className={`rounded-lg border p-4 ${severityClass(finding.severity)}`}>
                    <p className="text-xs font-semibold uppercase tracking-wide">
                      {finding.category} / {severityLabels[finding.severity]}
                    </p>
                    <h3 className="mt-1 font-semibold">{finding.title}</h3>
                    <p className="mt-2 text-sm leading-6">{finding.explanation}</p>
                    <p className="mt-2 rounded-theme-sm border border-current/20 bg-white/40 p-3 text-sm leading-6 text-current">
                      Basit anlamı: {simpleFindingMeaning(finding.category)}
                    </p>
                    <p className="mt-2 text-sm font-medium">{finding.recommendation}</p>
                  </article>
                ))}
              </div>
            </SectionCard>
          </div>
          <div
            id="rapor-panel-riskler-devam"
            className={`report-tab-panel ${activeTab === "riskler" ? "contents" : "hidden"}`}
          >
            {result.knownIssues.length > 0 ? (
              <SectionCard
                accent="violet"
                id="rapor-kronik-sorunlar"
                title="Bu motor için bilinen kronik sorunlar"
                description="Bu bölüm BU aracın kendi durumuyla değil, aynı marka/model/motoru kullanan araçlarda genel olarak bildirilen sorunlarla ilgilidir — risk skorunu etkilemez, ekspertizde nelere özellikle bakılması gerektiğine dair bir rehberdir."
              >
                {result.knownIssues.some((issue) => issue.broadMatch) ? (
                  <p className="mb-3 rounded-theme-sm border border-border bg-muted p-3 text-sm text-muted-foreground">
                    Motor hacmi/kodu belirtilmediği için bu marka/modelin bu yıl aralığındaki tüm motor seçeneklerinin
                    bilinen sorunları gösteriliyor. Motor bilgisini eklerseniz liste daralır.
                  </p>
                ) : null}
                <div className="grid gap-3">
                  {result.knownIssues.map((issue) => (
                    <article
                      key={`${issue.engineLabel}-${issue.id}`}
                      className={`rounded-lg border p-4 ${severityClass(issue.severity)}`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide">
                        {issue.engineLabel} / {severityLabels[issue.severity]}
                      </p>
                      <h3 className="mt-1 font-semibold">{issue.title}</h3>
                      <p className="mt-2 text-sm leading-6">{issue.detail}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium opacity-80">
                        {issue.typicalOnset ? <span>Tipik görülme: {issue.typicalOnset}</span> : null}
                        {issue.costLevel ? <span>Tahmini maliyet: {issue.costLevel}</span> : null}
                      </div>
                      <p className="mt-2 text-xs italic opacity-70">{issue.sourceNote}</p>
                    </article>
                  ))}
                </div>
              </SectionCard>
            ) : (
              <SectionCard
                accent="violet"
                id="rapor-kronik-sorunlar"
                title="Kronik sorun eşleşmesi"
                description="Bu bölüm yalnızca EksperIQ veritabanında marka/model/yıl/motor bilgisiyle eşleşen, araştırılmış kayıtları gösterir."
              >
                <div className="rounded-lg border border-border bg-muted p-4">
                  <p className="font-semibold text-foreground">
                    Bu araç için eşleşen kronik sorun kaydı gösterilemedi.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Bu sonuç aracın sorunsuz olduğu anlamına gelmez. Model henüz rehbere eklenmemiş olabilir, ilan motor
                    kodunu yeterince açık vermemiş olabilir veya sorunlar sadece ekspertiz/servis kontrolünde
                    görülebilir. Motor hacmi, motor kodu, şanzıman ve paket bilgisini netleştirerek yeniden analiz
                    yapmak listeyi daraltır.
                  </p>
                  <Link
                    href="/model-rehberi"
                    className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border px-4 text-sm font-semibold text-foreground/90 hover:border-accent hover:text-accent"
                  >
                    Model rehberini aç
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </div>
              </SectionCard>
            )}
            <SectionCard id="rapor-masraflar" title="Yakın zamanda çıkabilecek masraflar" accent="warning">
              <ul className="grid gap-2">
                {result.costs.map((cost) => (
                  <li key={cost.item} className="flex justify-between gap-3 rounded-lg border border-border p-3">
                    <span>{cost.item}</span>
                    <strong>{cost.level}</strong>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
          <div
            role="tabpanel"
            id="rapor-panel-plan"
            aria-labelledby="rapor-sekme-plan"
            className={`report-tab-panel ${activeTab === "plan" ? "contents" : "hidden"}`}
          >
            <SectionCard
              accent="success"
              id="rapor-satici-mesaji"
              title="Satıcıya gönderilecek hazır mesaj"
              description="İlk görüşmede dağılmadan, kanıt isteyerek ilerlemek için."
            >
              <div className="rounded-theme border border-border bg-muted p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-6 text-foreground/85">
                  {sellerMessageText}
                </pre>
                <button
                  type="button"
                  onClick={() => void copyText(sellerMessageText, "summary-copied")}
                  className="no-print mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  <MessageSquareText aria-hidden="true" className="h-4 w-4" />
                  Satıcı mesajını kopyala
                </button>
              </div>
            </SectionCard>
            <SectionCard id="rapor-sorular" title="Satıcıya sorulacak sorular" accent="violet">
              <ol className="grid gap-3">
                {result.sellerQuestions.map((question, index) => (
                  <SellerQuestionCard key={question} question={question} index={index + 1} />
                ))}
              </ol>
            </SectionCard>
            <SectionCard
              id="rapor-ekspertiz-kontrol"
              title="Ekspertizde özellikle kontrol edilmesi gerekenler"
              accent="success"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {result.inspectionFocus.map((item) => (
                  <span key={item} className="rounded-lg border border-border bg-card p-3">
                    {item}
                  </span>
                ))}
              </div>
              <Link
                href="/yakinimdaki-hizmetler?kategori=ekspertiz"
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-accent px-4 text-sm font-semibold text-accent"
              >
                Yakınımdaki ekspertiz ve noter firmalarını bul
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </SectionCard>
            <SectionCard
              accent="success"
              id="rapor-hizmet-yonlendirme"
              title="Şehir, servis ve noter yönlendirmesi"
              description="Araç neredeyse, o şehirde önce kontrol noktasını bulun; fiyatı telefonla teyit edin."
            >
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  [
                    "Ekspertiz",
                    "Kaporta, boya, şasi, podye, airbag, motor ve elektronik kontrol.",
                    "/yakinimdaki-hizmetler?kategori=ekspertiz",
                  ],
                  [
                    "Servis",
                    "Triger, şanzıman, turbo, DPF/EGR, uyarı lambası ve bakım geçmişi.",
                    "/yakinimdaki-hizmetler?kategori=servis",
                  ],
                  [
                    "Noter",
                    "Satış yetkisi, rehin/haciz, borç ve ödeme öncesi resmi adımlar.",
                    "/yakinimdaki-hizmetler?kategori=noter",
                  ],
                ].map(([title, description, href]) => (
                  <Link
                    key={title}
                    href={href}
                    className="rounded-lg border border-border bg-card p-4 hover:border-accent"
                  >
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                      Konuma göre bul <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    </span>
                  </Link>
                ))}
              </div>
            </SectionCard>
            <SectionCard
              accent="warning"
              id="rapor-pazarlik"
              title="Pazarlık gerekçeleri"
              description="Fiyat konuşurken somut ve ölçülebilir başlıklarla ilerleyin."
            >
              {negotiationItems.length ? (
                <ul className="grid gap-2">
                  {negotiationItems.map((item) => (
                    <li key={item} className="rounded-lg border border-border bg-card p-3 text-sm leading-6">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
                  Mevcut bilgilerle güçlü bir pazarlık gerekçesi oluşmadı; yine de ekspertiz ve resmi kayıt sonucuna
                  göre fiyatı tekrar değerlendirin.
                </p>
              )}
              <Link
                href="/onarim-maliyeti"
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-accent px-4 text-sm font-semibold text-accent"
              >
                Tahmini masraf aralığını aç
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </SectionCard>
            <SectionCard
              accent="danger"
              id="rapor-noter-oncesi"
              title="Noter ve ödeme öncesi kontrol"
              description="Aracı beğenseniz bile resmi işlemden önce bu maddeleri tamamlayın."
            >
              <div className="grid gap-2">
                {purchaseDocumentChecks.map((item) => (
                  <div key={item} className="flex gap-2 rounded-lg border border-border bg-card p-3 text-sm leading-6">
                    <FileSearch aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {item}
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
          <div
            id="rapor-panel-plan-devam"
            className={`report-tab-panel ${activeTab === "plan" ? "contents" : "hidden"}`}
          >
            <SectionCard
              accent="violet"
              id="rapor-alim-rehberi"
              title="Araç alırken bunlar neden önemli?"
              description="Kısa açıklamalar raporu okuyan kişinin teknik terimleri ezberlemeden doğru soruyu sormasına yardım eder."
            >
              <div className="grid gap-3">
                {BUYER_EDUCATION_NOTES.map((note) => (
                  <article key={note.title} className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-semibold text-foreground">{note.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Neden önemli: {note.why}</p>
                    <p className="mt-2 text-sm font-medium leading-6 text-foreground/90">Ne yapmalı: {note.check}</p>
                  </article>
                ))}
              </div>
            </SectionCard>
          </div>
          <div
            role="tabpanel"
            id="rapor-panel-arac"
            aria-labelledby="rapor-sekme-arac"
            className={`report-tab-panel ${activeTab === "arac" ? "contents" : "hidden"}`}
          >
            <SectionCard title="Araç ve ilan özeti" accent="success">
              <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-border p-3">
                  <dt className="text-sm text-muted-foreground">Araç</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {result.input.brand} {result.input.model}
                  </dd>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <dt className="text-sm text-muted-foreground">Yıl / km</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {result.input.year} / {result.input.mileage.toLocaleString("tr-TR")} km
                  </dd>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <dt className="text-sm text-muted-foreground">Fiyat</dt>
                  <dd className="mt-1 font-semibold text-foreground">{formatCurrency(result.input.price)}</dd>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <dt className="text-sm text-muted-foreground">Şehir</dt>
                  <dd className="mt-1 font-semibold text-foreground">{result.input.city}</dd>
                </div>
              </dl>
              <div className="mt-4 rounded-lg border border-border bg-muted p-4">
                <p className="font-medium text-foreground">{result.mileage.label}</p>
                <p className="mt-1 text-sm leading-6 text-foreground/80">{mileageSummarySentence(result.mileage)}</p>
              </div>
              {result.listingImages?.length ? (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-foreground">İlandan alınan fotoğraflar</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {result.listingImages.slice(0, 8).map((imageUrl, index) => (
                      <button
                        key={imageUrl}
                        type="button"
                        onClick={() => openListingImage(index)}
                        className="block aspect-square overflow-hidden rounded-lg border border-border bg-muted text-left transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        aria-label={`İlan fotoğrafını büyüt: ${index + 1}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- Listing image hosts vary by source site. */}
                        <img src={imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </SectionCard>
          </div>
          <div
            role="tabpanel"
            id="rapor-panel-kontrol"
            aria-labelledby="rapor-sekme-kontrol"
            className={`report-tab-panel ${activeTab === "kontrol" ? "contents" : "hidden"}`}
          >
            <SectionCard
              accent="success"
              id="rapor-kontrol-listesi"
              title="Son kontrol listesi"
              description="Bu liste yalnızca mevcut tarayıcı oturumunda saklanır; oturum verisini silerseniz işaretler de temizlenir."
            >
              <div className="mb-4 rounded-lg border border-border bg-muted p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-foreground/90">Tamamlanan kontroller</span>
                  <strong
                    className="text-foreground"
                    aria-label={`Tamamlanan kontroller ${checkedChecklist.size} / ${result.finalChecklist.length}`}
                  >
                    {checkedChecklist.size} / {result.finalChecklist.length}
                  </strong>
                </div>
                <div className="mt-3 h-2 rounded-full bg-muted" aria-hidden="true">
                  <div
                    className="h-2 rounded-full bg-accent transition-all"
                    style={{ width: `${Math.round((checkedChecklist.size / result.finalChecklist.length) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground" role="status">
                  {checkedChecklist.size === result.finalChecklist.length
                    ? "Tüm kontrol maddeleri işaretlendi. Yine de nihai karar öncesi belge ve ekspertiz sonuçlarını birlikte değerlendirin."
                    : "Satın alma öncesi doğruladığınız maddeleri işaretleyin."}
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {result.finalChecklist.map((item) => (
                  <label key={item} className="flex min-h-12 items-center gap-3 rounded-lg border border-border p-3">
                    <input
                      type="checkbox"
                      checked={checkedChecklist.has(item)}
                      onChange={() => toggleChecklistItem(item)}
                      className="h-5 w-5"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </main>
      {selectedListingImage ? (
        <div
          className="fixed inset-0 z-50 bg-foreground/80 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="İlan fotoğrafı görüntüleyici"
          onClick={closeListingImage}
        >
          <div
            className="relative mx-auto flex h-full max-w-5xl items-center justify-center overflow-hidden rounded-theme border border-border bg-card shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeListingImage}
              className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg sm:right-4 sm:top-4"
              aria-label="Fotoğraf görüntüleyiciyi kapat"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
            {listingImages.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => navigateListingImage(-1)}
                  className="absolute left-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-card/95 text-foreground shadow-lg ring-1 ring-border sm:left-4"
                  aria-label="Önceki fotoğraf"
                >
                  <ChevronLeft aria-hidden="true" className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => navigateListingImage(1)}
                  className="absolute right-3 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-card/95 text-foreground shadow-lg ring-1 ring-border sm:right-4"
                  aria-label="Sonraki fotoğraf"
                >
                  <ChevronRight aria-hidden="true" className="h-6 w-6" />
                </button>
              </>
            ) : null}
            <div
              className="h-full w-full overflow-auto bg-muted p-3"
              onTouchStart={handleListingImageTouchStart}
              onTouchMove={handleListingImageTouchMove}
              onTouchEnd={handleListingImageTouchEnd}
              onTouchCancel={handleListingImageTouchEnd}
              onDoubleClick={() => setListingImageZoom(MIN_IMAGE_ZOOM)}
              style={{ touchAction: "none" }}
            >
              <div className="flex min-h-full items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element -- Listing image hosts vary by source site. */}
                <img
                  src={selectedListingImage}
                  alt="İlandan alınan araç fotoğrafı"
                  className="max-h-full rounded-theme-sm object-contain shadow-sm"
                  style={{
                    width: `${listingImageZoom * 100}%`,
                    maxWidth: listingImageZoom === MIN_IMAGE_ZOOM ? "100%" : "none",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
