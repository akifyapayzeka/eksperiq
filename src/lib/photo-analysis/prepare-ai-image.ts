"use client";

const MAX_DIMENSION = 1600;
const INITIAL_QUALITY = 0.82;
const MIN_QUALITY = 0.35;
const QUALITY_STEP = 0.1;

// Vercel serverless functions reject request bodies over ~4.5MB. Stay well
// under that so up to 4 images plus JSON/base64 overhead never trips the
// limit; api/ai/photo-damage.js enforces the same ceiling server-side as a
// second, independent check (client-side limits are advisory only).
export const MAX_AI_UPLOAD_PAYLOAD_BYTES = 3_500_000;
const PER_IMAGE_TARGET_BYTES = Math.floor(MAX_AI_UPLOAD_PAYLOAD_BYTES / 4);

export type PreparedAiImage = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("read")));
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("decode"));
    image.src = src;
  });
}

function dataUrlByteLength(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(",");
  const base64 = commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
  // Base64 encodes 3 raw bytes as 4 characters; padding is close enough for a size budget.
  return Math.ceil((base64.length * 3) / 4);
}

/**
 * Resizes and re-encodes a photo for the AI vision endpoint. Redrawing the
 * decoded pixels onto a fresh canvas — rather than re-using the original file
 * bytes — also strips EXIF metadata (GPS location, device info, timestamps)
 * by construction, since toDataURL only ever encodes pixel data.
 */
async function compressForAiUpload(file: File): Promise<string | null> {
  try {
    const original = await readAsDataUrl(file);
    const image = await loadImage(original);
    const naturalWidth = image.naturalWidth || image.width;
    const naturalHeight = image.naturalHeight || image.height;
    const scale = Math.min(1, MAX_DIMENSION / Math.max(naturalWidth, naturalHeight, 1));
    const width = Math.max(1, Math.round(naturalWidth * scale));
    const height = Math.max(1, Math.round(naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 0, 0, width, height);

    let quality = INITIAL_QUALITY;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    while (dataUrlByteLength(dataUrl) > PER_IMAGE_TARGET_BYTES && quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
      dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (quality === MIN_QUALITY) break;
    }
    return dataUrl;
  } catch {
    return null;
  }
}

/**
 * Compresses each file for AI upload and enforces a combined payload budget,
 * dropping (not truncating) any image that would push the total over the
 * limit. Callers should tell the user how many photos were skipped.
 */
export async function prepareAiImages(files: File[]): Promise<{ images: PreparedAiImage[]; skippedCount: number }> {
  const images: PreparedAiImage[] = [];
  let skippedCount = 0;
  let remainingBudget = MAX_AI_UPLOAD_PAYLOAD_BYTES;

  for (const file of files) {
    const dataUrl = await compressForAiUpload(file);
    if (!dataUrl) {
      skippedCount += 1;
      continue;
    }

    const size = dataUrlByteLength(dataUrl);
    if (size > remainingBudget) {
      skippedCount += 1;
      continue;
    }

    remainingBudget -= size;
    images.push({ name: file.name, mimeType: "image/jpeg", dataUrl });
  }

  return { images, skippedCount };
}
