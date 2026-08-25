const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const { checkRateLimit } = require("../_lib/rate-limit.js");
const { applyCorsHeaders, handlePreflight } = require("../_lib/cors.js");
const { REPORT_LOGO_PNG_BASE64 } = require("../_lib/report-logo.js");
const { REPORT_FONT_REGULAR_TTF_BASE64 } = require("../_lib/report-font-regular.js");
const { REPORT_FONT_BOLD_TTF_BASE64 } = require("../_lib/report-font-bold.js");

const DEFAULT_DAILY_LIMIT = 300;
const DEFAULT_DAILY_LIMIT_PER_INSTALL = 30;
const DEFAULT_BURST_LIMIT = 6;
const DEFAULT_BURST_WINDOW_SECONDS = 60;

const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const NAVY = rgb(0.0863, 0.2314, 0.3216);
const BLUE = rgb(0.1333, 0.4549, 0.6471);
const INK = rgb(0.13, 0.16, 0.19);
const MUTED = rgb(0.42, 0.46, 0.5);
const LINE = rgb(0.85, 0.87, 0.89);
const WHITE = rgb(1, 1, 1);

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

function parsePositiveInt(value, fallback) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw.trim()) return null;
  return JSON.parse(raw);
}

function asString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value, max = 50) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string" && item.trim()).slice(0, max);
}

/** A single "word" wider than the line itself (long URL, no-space blob) is hard-broken by character so it can never run off the page edge. */
function breakLongWord(font, size, maxWidth, word) {
  const chunks = [];
  let current = "";
  for (const char of word) {
    const attempt = current + char;
    if (font.widthOfTextAtSize(attempt, size) > maxWidth && current) {
      chunks.push(current);
      current = char;
    } else {
      current = attempt;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function wrapText(font, size, maxWidth, text) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const attempt = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(attempt, size) <= maxWidth) {
      current = attempt;
      continue;
    }
    if (current) lines.push(current);
    if (font.widthOfTextAtSize(word, size) > maxWidth) {
      const chunks = breakLongWord(font, size, maxWidth, word);
      lines.push(...chunks.slice(0, -1));
      current = chunks[chunks.length - 1] ?? "";
    } else {
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

/** Small stateful writer: tracks the cursor and starts a fresh page (with header) when content would overflow. */
function createWriter(doc, fonts, logoImage) {
  const state = { page: null, y: 0 };

  function drawFooter(page) {
    page.drawLine({
      start: { x: MARGIN, y: 56 },
      end: { x: PAGE_WIDTH - MARGIN, y: 56 },
      thickness: 0.75,
      color: LINE,
    });
    page.drawText(`© ${new Date().getFullYear()} EksperIQ. Tüm hakları saklıdır. İzinsiz çoğaltılamaz.`, {
      x: MARGIN,
      y: 40,
      size: 8,
      font: fonts.regular,
      color: MUTED,
    });
  }

  function newPage() {
    if (state.page) drawFooter(state.page);
    const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    state.page = page;
    state.y = PAGE_HEIGHT - MARGIN;
    return page;
  }

  function ensureSpace(height) {
    if (state.y - height < 72) newPage();
  }

  function drawHeader(vehicleLine) {
    const page = newPage();
    page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 96, width: PAGE_WIDTH, height: 96, color: NAVY });
    if (logoImage) {
      const logoW = 34;
      const logoH = (logoImage.height / logoImage.width) * logoW;
      page.drawImage(logoImage, { x: MARGIN, y: PAGE_HEIGHT - 96 + (96 - logoH) / 2, width: logoW, height: logoH });
    }
    page.drawText("EksperIQ", {
      x: MARGIN + (logoImage ? 46 : 0),
      y: PAGE_HEIGHT - 52,
      size: 20,
      font: fonts.bold,
      color: WHITE,
    });
    page.drawText("Araç Analiz Raporu", {
      x: MARGIN + (logoImage ? 46 : 0),
      y: PAGE_HEIGHT - 72,
      size: 11,
      font: fonts.regular,
      color: rgb(0.85, 0.9, 0.94),
    });
    if (vehicleLine) {
      page.drawText(vehicleLine, {
        x: MARGIN + (logoImage ? 46 : 0),
        y: PAGE_HEIGHT - 88,
        size: 10,
        font: fonts.regular,
        color: rgb(0.78, 0.85, 0.9),
      });
    }
    state.y = PAGE_HEIGHT - 96 - 28;
    return page;
  }

  function sectionTitle(title) {
    ensureSpace(28);
    state.page.drawText(title.toUpperCase(), {
      x: MARGIN,
      y: state.y,
      size: 10.5,
      font: fonts.bold,
      color: BLUE,
    });
    state.y -= 6;
    state.page.drawLine({
      start: { x: MARGIN, y: state.y },
      end: { x: PAGE_WIDTH - MARGIN, y: state.y },
      thickness: 0.75,
      color: LINE,
    });
    state.y -= 16;
  }

  function paragraph(text, { size = 10.5, font = fonts.regular, color = INK, gap = 6 } = {}) {
    const lines = wrapText(font, size, CONTENT_WIDTH, text);
    for (const line of lines) {
      ensureSpace(size + 4);
      state.page.drawText(line, { x: MARGIN, y: state.y, size, font, color });
      state.y -= size + 4;
    }
    state.y -= gap;
  }

  function numberedList(items, { size = 10.5 } = {}) {
    items.forEach((item, index) => {
      const prefix = `${index + 1}. `;
      const prefixWidth = fonts.bold.widthOfTextAtSize(prefix, size);
      const lines = wrapText(fonts.regular, size, CONTENT_WIDTH - prefixWidth, item);
      lines.forEach((line, lineIndex) => {
        ensureSpace(size + 4);
        if (lineIndex === 0) {
          state.page.drawText(prefix, { x: MARGIN, y: state.y, size, font: fonts.bold, color: BLUE });
        }
        state.page.drawText(line, { x: MARGIN + prefixWidth, y: state.y, size, font: fonts.regular, color: INK });
        state.y -= size + 4;
      });
    });
    state.y -= 4;
  }

  /** Draws embedded images in a 2-column grid, scaling each to fit its cell while preserving aspect ratio. */
  function imageGrid(images) {
    const columns = 2;
    const gap = 10;
    const cellWidth = (CONTENT_WIDTH - gap * (columns - 1)) / columns;
    const maxCellHeight = 130;
    let column = 0;
    let rowTopY = 0;
    images.forEach((image) => {
      const scale = Math.min(cellWidth / image.width, maxCellHeight / image.height, 1);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      if (column === 0) {
        ensureSpace(maxCellHeight + 8);
        rowTopY = state.y;
      }
      const x = MARGIN + column * (cellWidth + gap) + (cellWidth - drawWidth) / 2;
      state.page.drawImage(image, {
        x,
        y: rowTopY - maxCellHeight + (maxCellHeight - drawHeight) / 2,
        width: drawWidth,
        height: drawHeight,
      });
      column = (column + 1) % columns;
      if (column === 0) state.y = rowTopY - maxCellHeight - 8;
    });
    if (column !== 0) state.y = rowTopY - maxCellHeight - 8;
  }

  function finish() {
    if (state.page) drawFooter(state.page);
  }

  return {
    drawHeader,
    sectionTitle,
    paragraph,
    numberedList,
    imageGrid,
    ensureSpace,
    get page() {
      return state.page;
    },
    get y() {
      return state.y;
    },
    set y(value) {
      state.y = value;
    },
    finish,
  };
}

const IMAGE_FETCH_TIMEOUT_MS = 8000;
const MAX_REPORT_IMAGES = 8;

function looksLikePng(buffer) {
  return buffer.length > 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
}

async function fetchImageBytes(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const DATA_URL_PATTERN = /^data:[^;]+;base64,(.+)$/;

/** Decodes a "data:<mime>;base64,<...>" string (see native imageData) back into raw bytes. */
function decodeDataUrl(dataUrl) {
  if (typeof dataUrl !== "string") return null;
  const match = DATA_URL_PATTERN.exec(dataUrl);
  if (!match) return null;
  try {
    return Buffer.from(match[1], "base64");
  } catch {
    return null;
  }
}

/**
 * Fetches and embeds listing photos so the report matches what the app
 * already shows (result.listingImages) — the PDF previously had no
 * pictures at all. Every step is best-effort: a failed fetch, an
 * unsupported format, or a corrupt file for one photo just skips that
 * photo rather than failing the whole report.
 *
 * sahibinden.com/arabam.com reject image requests from a server-side
 * datacenter IP outright (confirmed live — see
 * EksperIQListingFetchPlugin.swift's file header), so a plain server fetch
 * by URL essentially never succeeds for these two sources. The app now
 * fetches a handful of these photos natively on-device instead (same
 * network a real Safari tab would use) and sends the bytes along as
 * `imageData` — prefer that whenever present for a URL, and only fall back
 * to the (likely-failing, but harmless) server fetch for the rest, so an
 * older app version or a partial native fetch still degrades gracefully.
 */
async function embedListingImages(doc, urls, imageData) {
  const providedBytesByUrl = new Map();
  if (Array.isArray(imageData)) {
    for (const item of imageData) {
      if (!item || typeof item.url !== "string") continue;
      const buffer = decodeDataUrl(item.dataUrl);
      if (buffer) providedBytesByUrl.set(item.url, buffer);
    }
  }
  const candidates = Array.isArray(urls)
    ? urls.filter((url) => typeof url === "string" && url.trim()).slice(0, MAX_REPORT_IMAGES)
    : [];
  const buffers = await Promise.all(candidates.map((url) => providedBytesByUrl.get(url) ?? fetchImageBytes(url)));
  const embedded = [];
  for (const buffer of buffers) {
    if (!buffer) continue;
    try {
      const image = looksLikePng(buffer) ? await doc.embedPng(buffer) : await doc.embedJpg(buffer);
      embedded.push(image);
    } catch {
      // Not a JPG/PNG this library can decode — skip it.
    }
  }
  return embedded;
}

async function buildPdf(payload) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  // pdf-lib's 14 standard fonts use WinAnsi encoding, which has no Turkish
  // ş/ğ/ı/İ (widthOfTextAtSize throws on them) — embed a real Unicode font
  // (Noto Sans subset, see docs/report-pdf-font.md) instead.
  const fonts = {
    regular: await doc.embedFont(Buffer.from(REPORT_FONT_REGULAR_TTF_BASE64, "base64"), { subset: true }),
    bold: await doc.embedFont(Buffer.from(REPORT_FONT_BOLD_TTF_BASE64, "base64"), { subset: true }),
  };

  let logoImage = null;
  try {
    logoImage = await doc.embedPng(Buffer.from(REPORT_LOGO_PNG_BASE64, "base64"));
  } catch {
    logoImage = null;
  }

  const vehicleLabel = [payload.year, payload.brand, payload.model].filter(Boolean).join(" ");
  const w = createWriter(doc, fonts, logoImage);
  w.drawHeader(vehicleLabel);

  // Score card
  w.ensureSpace(70);
  const scoreBoxY = w.y;
  w.page.drawRectangle({
    x: MARGIN,
    y: scoreBoxY - 62,
    width: CONTENT_WIDTH,
    height: 62,
    color: rgb(0.94, 0.97, 0.99),
    borderColor: LINE,
    borderWidth: 0.75,
  });
  w.page.drawText(String(payload.totalScore ?? "-"), {
    x: MARGIN + 16,
    y: scoreBoxY - 44,
    size: 30,
    font: fonts.bold,
    color: NAVY,
  });
  w.page.drawText("/ 100", {
    x: MARGIN + 16 + fonts.bold.widthOfTextAtSize(String(payload.totalScore ?? "-"), 30) + 4,
    y: scoreBoxY - 32,
    size: 11,
    font: fonts.regular,
    color: MUTED,
  });
  w.page.drawText(asString(payload.riskLabel, "Risk skoru"), {
    x: MARGIN + 110,
    y: scoreBoxY - 24,
    size: 13,
    font: fonts.bold,
    color: INK,
  });
  const decisionLines = wrapText(fonts.regular, 9.5, CONTENT_WIDTH - 126, asString(payload.decision));
  decisionLines.slice(0, 2).forEach((line, index) => {
    w.page.drawText(line, {
      x: MARGIN + 110,
      y: scoreBoxY - 38 - index * 13,
      size: 9.5,
      font: fonts.regular,
      color: MUTED,
    });
  });
  w.y = scoreBoxY - 62 - 22;

  const vehicleFacts = [
    payload.mileage != null ? `${Number(payload.mileage).toLocaleString("tr-TR")} km` : null,
    payload.price != null ? `${Number(payload.price).toLocaleString("tr-TR")} TL` : null,
    payload.city || null,
  ]
    .filter(Boolean)
    .join("  ·  ");
  if (vehicleFacts) {
    w.paragraph(vehicleFacts, { size: 10, color: MUTED, gap: 12 });
  }

  const listingImages = await embedListingImages(doc, payload.listingImages, payload.listingImageData);
  if (listingImages.length) {
    w.sectionTitle("İlan fotoğrafları");
    w.imageGrid(listingImages);
    w.y -= 6;
  }

  const priorityActions = Array.isArray(payload.priorityActions) ? payload.priorityActions.slice(0, 6) : [];
  if (priorityActions.length) {
    w.sectionTitle("Öncelikli aksiyonlar");
    w.numberedList(
      priorityActions.map((action) =>
        action && action.reason
          ? `${asString(action.title)} — ${asString(action.reason)}`
          : asString(action && action.title),
      ),
    );
  }

  const buyerDecisionGuide = Array.isArray(payload.buyerDecisionGuide) ? payload.buyerDecisionGuide.slice(0, 4) : [];
  if (buyerDecisionGuide.length) {
    w.sectionTitle("Adım adım karar rehberi");
    w.numberedList(
      buyerDecisionGuide.map((item) => {
        const title = asString(item && item.title);
        const meaning = asString(item && item.meaning);
        const action = asString(item && item.action);
        return `${title}: ${meaning} Ne yap: ${action}`;
      }),
      { size: 9.8 },
    );
  }

  const findings = Array.isArray(payload.findings) ? payload.findings.slice(0, 8) : [];
  if (findings.length) {
    w.sectionTitle("Öne çıkan riskler");
    w.numberedList(
      findings.map((finding) =>
        finding && finding.recommendation
          ? `${asString(finding.title)}: ${asString(finding.recommendation)}`
          : asString(finding && finding.title),
      ),
    );
  }

  const strengths = asStringArray(payload.strengths, 8);
  if (strengths.length) {
    w.sectionTitle("Güçlü yönler");
    strengths.forEach((item) => w.paragraph(`•  ${item}`, { gap: 2 }));
    w.y -= 6;
  }

  const sellerQuestions = asStringArray(payload.sellerQuestions, 8);
  if (sellerQuestions.length) {
    w.sectionTitle("Satıcıya sorulacak sorular");
    w.numberedList(sellerQuestions);
  }

  const inspectionFocus = asStringArray(payload.inspectionFocus, 10);
  if (inspectionFocus.length) {
    w.sectionTitle("Ekspertizde özellikle kontrol edilmesi gerekenler");
    inspectionFocus.forEach((item) => w.paragraph(`•  ${item}`, { gap: 2 }));
    w.y -= 6;
  }

  const negotiation = payload.negotiation && typeof payload.negotiation === "object" ? payload.negotiation : null;
  if (negotiation && Number(negotiation.listingPrice) > 0) {
    w.sectionTitle("Pazarlık payı önerisi");
    w.paragraph(
      "Benzer ilanlarla canlı piyasa karşılaştırması değildir; yalnızca bu ilandaki bulgulara dayalı yaklaşık bir aralıktır.",
      { size: 9, color: MUTED, gap: 6 },
    );
    const offerLow = Number(negotiation.suggestedOfferLow) || 0;
    const offerHigh = Number(negotiation.suggestedOfferHigh) || 0;
    w.paragraph(
      `İlan fiyatı: ${Number(negotiation.listingPrice).toLocaleString("tr-TR")} TL. Önerilen pazarlık aralığı: ${offerLow.toLocaleString("tr-TR")} - ${offerHigh.toLocaleString("tr-TR")} TL.`,
      { size: 10, gap: 4 },
    );
    const reasons = asStringArray(negotiation.reasons, 6);
    if (reasons.length) {
      reasons.forEach((item) => w.paragraph(`•  ${item}`, { gap: 2 }));
    }
    w.y -= 6;
  }

  const costs = Array.isArray(payload.costs) ? payload.costs.slice(0, 10) : [];
  if (costs.length) {
    w.sectionTitle("Olası maliyet sinyalleri");
    costs.forEach((cost) => {
      const item = asString(cost && cost.item);
      const level = asString(cost && cost.level);
      w.paragraph(`•  ${item}${level ? ` — ${level}` : ""}`, { gap: 2 });
    });
    w.y -= 6;
  }

  const knownIssues = Array.isArray(payload.knownIssues) ? payload.knownIssues.slice(0, 6) : [];
  if (knownIssues.length) {
    w.sectionTitle("Bu marka/model/motor için bilinen kronik sorunlar");
    w.paragraph(
      "Bu bulgular ARACIN kendi geçmişiyle ilgili değildir; aynı marka/model/motor ailesinde genel olarak bilinen eğilimlerdir ve risk skorunu etkilemez.",
      { size: 9, color: MUTED, gap: 8 },
    );
    knownIssues.forEach((issue) => {
      const title = asString(issue && issue.title);
      const detail = asString(issue && issue.detail);
      const meta = [asString(issue && issue.typicalOnset), asString(issue && issue.costLevel)]
        .filter(Boolean)
        .join(" · ");
      w.paragraph(`${title}: ${detail}${meta ? ` (${meta})` : ""}`, { size: 9.8, gap: 4 });
    });
    w.y -= 4;
  }

  const completeness = payload.completeness && typeof payload.completeness === "object" ? payload.completeness : null;
  if (completeness) {
    w.sectionTitle("Bilgi doluluğu");
    w.paragraph(
      `Dolu bilgi alanları: ${completeness.completed ?? "-"} / ${completeness.total ?? "-"} (%${completeness.percentage ?? "-"})`,
      { size: 10, gap: 4 },
    );
    const missing = asStringArray(completeness.missing, 20);
    if (missing.length) {
      w.paragraph(`Satıcıdan tamamlanması istenecek bilgiler: ${missing.join(", ")}`, {
        size: 9.5,
        color: MUTED,
        gap: 0,
      });
    }
  }

  w.sectionTitle("Uyarı");
  w.paragraph(
    asString(
      payload.disclaimer,
      "Bu analiz yalnızca bilgilendirme ve karar desteği amacıyla hazırlanır. Profesyonel araç ekspertizinin, servis kontrolünün, resmî kayıt sorgularının veya hukuki incelemenin yerine geçmez. Son satın alma kararı kullanıcıya aittir.",
    ),
    { size: 9.5, color: MUTED, gap: 0 },
  );

  // Kept as the very last section on purpose (moved from before "Uyarı") —
  // it's context/explainer material, not a decision input, so it belongs
  // after everything actionable rather than competing for attention above it.
  const buyerEducation = Array.isArray(payload.buyerEducation) ? payload.buyerEducation.slice(0, 8) : [];
  if (buyerEducation.length) {
    w.sectionTitle("Araç alırken bunlar neden önemli?");
    w.numberedList(
      buyerEducation.map((item) => {
        const title = asString(item && item.title);
        const why = asString(item && item.why);
        const check = asString(item && item.check);
        return `${title}: ${why} Ne yapmalı: ${check}`;
      }),
      { size: 9.6 },
    );
  }

  w.finish();
  return doc.save();
}

/**
 * Generates a branded PDF report from the client's already-computed
 * AnalysisResult (server does no scoring, just lays out fields it's given).
 * Replaces the previous "share plain text + vercel.app link" flow: the
 * native share sheet previously auto-expanded that link into an unwanted
 * preview card, and a link is a worse artifact than an actual report file.
 */
async function handler(request, response) {
  applyCorsHeaders(request, response);
  if (handlePreflight(request, response)) return;

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Yalnızca POST desteklenir." });
    return;
  }

  const rateLimit = await checkRateLimit(request, {
    usageKey: "report-pdf",
    burstLimit: parsePositiveInt(process.env.REPORT_PDF_BURST_LIMIT, DEFAULT_BURST_LIMIT),
    burstWindowSeconds: parsePositiveInt(process.env.REPORT_PDF_BURST_WINDOW_SECONDS, DEFAULT_BURST_WINDOW_SECONDS),
    dailyLimitPerIdentity: parsePositiveInt(
      process.env.REPORT_PDF_DAILY_LIMIT_PER_INSTALL,
      DEFAULT_DAILY_LIMIT_PER_INSTALL,
    ),
    globalDailyLimit: parsePositiveInt(process.env.REPORT_PDF_DAILY_REQUEST_LIMIT, DEFAULT_DAILY_LIMIT),
  });

  if (!rateLimit.ok) {
    if (rateLimit.reason === "unavailable") {
      sendJson(response, 503, { error: "Rapor oluşturma şu anda doğrulanamadı." });
      return;
    }
    sendJson(response, 429, { error: "Çok fazla rapor isteği gönderildi. Birazdan tekrar deneyin." });
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(request);
  } catch {
    sendJson(response, 400, { error: "Geçersiz istek gövdesi." });
    return;
  }

  if (!payload || typeof payload !== "object") {
    sendJson(response, 400, { error: "Rapor verisi eksik." });
    return;
  }

  try {
    const pdfBytes = await buildPdf(payload);
    response.statusCode = 200;
    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Content-Disposition", 'inline; filename="eksperiq-rapor.pdf"');
    response.end(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("[report-pdf] PDF generation failed:", error);
    sendJson(response, 500, { error: "Rapor oluşturulamadı." });
  }
}

module.exports = handler;
