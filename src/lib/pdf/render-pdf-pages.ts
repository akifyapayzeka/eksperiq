"use client";

const MAX_PAGES = 4;
const RENDER_SCALE = 2;

/**
 * Renders the first pages of a PDF file to JPEG data URLs entirely on-device
 * (no upload of the raw PDF anywhere) so they can be fed into the same AI
 * vision pipeline used for photo uploads. Runs via pdfjs-dist's worker; if
 * the worker asset fails to load (e.g. an unusual native WebView setup) the
 * caller gets a clear error instead of a silent crash and can fall back to
 * asking the user to upload photos of the report instead.
 */
export async function renderPdfPagesToImages(file: File): Promise<{ name: string; dataUrl: string }[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdfDocument = await loadingTask.promise;
  const pageCount = Math.min(pdfDocument.numPages, MAX_PAGES);
  const results: { name: string; dataUrl: string }[] = [];

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const canvas = window.document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");
    if (!context) continue;

    await page.render({ canvasContext: context, viewport, canvas }).promise;
    results.push({
      name: `${file.name.replace(/\.pdf$/i, "")}-sayfa-${pageNumber}.jpg`,
      dataUrl: canvas.toDataURL("image/jpeg", 0.85),
    });
  }

  await loadingTask.destroy();
  return results;
}
