"use client";

import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export async function prepareListingImportNotifications(): Promise<"granted" | "denied" | "unavailable"> {
  if (!Capacitor.isNativePlatform()) return "unavailable";

  const current = await LocalNotifications.checkPermissions();
  if (current.display === "granted") return "granted";
  if (current.display === "denied") return "denied";

  const requested = await LocalNotifications.requestPermissions();
  return requested.display === "granted" ? "granted" : "denied";
}
