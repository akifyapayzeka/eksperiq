// Third-party listing text (bodyText/jsonLd/description) can legitimately
// contain a SELLER's own contact details (phone, email, plate) mixed in with
// the vehicle description — sellers often paste "0532 xxx xx xx aramayin
// yaziniz" or a plate number directly into the ad text. This is redacted
// before the text is sent to OpenRouter (a third-party AI provider), since
// the AI only needs the vehicle's technical/condition details to do its job,
// never a private individual's contact info.
//
// This is a best-effort regex pass, not NLP-grade PII detection: it reliably
// catches phone numbers, email addresses, and Turkish vehicle plates (all
// have a fairly rigid shape), but deliberately does NOT attempt to redact
// free-form names or addresses — a regex/keyword pass for those would either
// miss most real cases or, worse, strip legitimate vehicle description text
// (brand/model/trim names, street-style location mentions like "Kadıköy
// servis kaydı"), corrupting the very data the analysis needs. Never widen
// this to match single all-caps words or short digit runs — km/price/engine
// values (e.g. "150.000 km", "850.000 TL", "1.6 dizel") must survive intact.

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+?90[\s.-]?)?0?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}(?!\d)/g;
const PLATE_REGEX = /\b(?:0[1-9]|[1-7]\d|80|81)\s?[A-PR-VYZ]{1,3}\s?\d{2,4}\b/g;

function redactPersonalData(text) {
  if (typeof text !== "string" || !text) return text;
  return text
    .replace(EMAIL_REGEX, "[EMAIL_REDACTED]")
    .replace(PHONE_REGEX, "[PHONE_REDACTED]")
    .replace(PLATE_REGEX, "[PLATE_REDACTED]");
}

module.exports = { redactPersonalData };
