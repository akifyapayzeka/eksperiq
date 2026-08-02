"use client";

const MAX_WIDTH = 480;
const JPEG_QUALITY = 0.6;

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

/**
 * Best-effort thumbnail for local storage. Returns null (never throws) if the
 * file can't be decoded as an image, so callers can skip a photo instead of
 * failing the whole save.
 */
export async function downscaleImage(file: File): Promise<string | null> {
  try {
    const original = await readAsDataUrl(file);
    const image = await loadImage(original);
    const scale = Math.min(1, MAX_WIDTH / (image.naturalWidth || image.width || MAX_WIDTH));
    const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
    const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } catch {
    return null;
  }
}
