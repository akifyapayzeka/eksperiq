"use client";

import { Camera, MediaTypeSelection } from "@capacitor/camera";

/**
 * The OS-provided file-input action sheet ("Take Photo" / "Photo Library" /
 * "Browse") is rendered by WebKit itself and always follows the device's
 * system language, regardless of the app's own Turkish UI — there is no
 * supported way to relocalize it from web code. Using the native Camera
 * plugin's two separate methods (instead of the combined system prompt)
 * lets the app show its own Turkish "Kamera" / "Galeriden seç" choice
 * up front, then go straight to the camera viewfinder or the gallery grid
 * with no OS-text choice screen in between.
 */

async function webPathToBlob(webPath: string | undefined): Promise<Blob | null> {
  if (!webPath) return null;
  const response = await fetch(webPath);
  return await response.blob();
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Fotoğraf okunamadı."));
    reader.readAsDataURL(blob);
  });
}

/** Opens the camera and returns the captured photo as a data URL, or null if the user cancelled. */
export async function takePhotoAsDataUrl(): Promise<string | null> {
  try {
    const result = await Camera.takePhoto({ quality: 80, saveToGallery: false });
    const blob = await webPathToBlob(result.webPath);
    return blob ? await blobToDataUrl(blob) : null;
  } catch {
    return null;
  }
}

/** Opens the photo gallery and returns the selected photo(s) as data URLs — empty if the user cancelled. */
export async function chooseFromGalleryAsDataUrls(limit: number): Promise<string[]> {
  try {
    const { results } = await Camera.chooseFromGallery({
      mediaType: MediaTypeSelection.Photo,
      allowMultipleSelection: limit > 1,
      limit,
    });
    const blobs = await Promise.all(results.map((result) => webPathToBlob(result.webPath)));
    const dataUrls = await Promise.all(blobs.filter((blob): blob is Blob => Boolean(blob)).map(blobToDataUrl));
    return dataUrls;
  } catch {
    return [];
  }
}

function blobToFile(blob: Blob, name: string): File {
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}

/** Opens the camera and returns the captured photo as a File, or null if the user cancelled. */
export async function takePhotoAsFile(): Promise<File | null> {
  try {
    const result = await Camera.takePhoto({ quality: 80, saveToGallery: false });
    const blob = await webPathToBlob(result.webPath);
    return blob ? blobToFile(blob, `foto-${Date.now()}.jpg`) : null;
  } catch {
    return null;
  }
}

/** Opens the photo gallery and returns the selected photo(s) as Files — empty if the user cancelled. */
export async function chooseFromGalleryAsFiles(limit: number): Promise<File[]> {
  try {
    const { results } = await Camera.chooseFromGallery({
      mediaType: MediaTypeSelection.Photo,
      allowMultipleSelection: limit > 1,
      limit,
    });
    const blobs = await Promise.all(results.map((result) => webPathToBlob(result.webPath)));
    return blobs
      .map((blob, index) => (blob ? blobToFile(blob, `foto-${Date.now()}-${index}.jpg`) : null))
      .filter((file): file is File => Boolean(file));
  } catch {
    return [];
  }
}
