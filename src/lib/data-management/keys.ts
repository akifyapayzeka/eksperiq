import { appConfig } from "@/lib/constants/app";
import { INSTALL_ID_STORAGE_KEY } from "@/lib/api/install-id";

/**
 * Persistent (localStorage) data the user actually created — these are the
 * only keys included in export/import. Each name here is also the key used
 * inside the export bundle's `data` object.
 */
export const EXPORTABLE_STORAGE_KEYS: Record<string, string> = {
  vehicles: appConfig.vehiclesStorageKey,
  reminders: appConfig.remindersStorageKey,
  expenses: appConfig.expensesStorageKey,
  healthRecords: appConfig.healthRecordStorageKey,
  photoAnalyses: appConfig.photoAnalysesStorageKey,
  comparison: appConfig.comparisonStorageKey,
  analysisHistory: appConfig.analysisHistoryStorageKey,
};

/**
 * Session-scoped (sessionStorage) state — intentionally excluded from
 * export/import since it resets every session by design, but still cleared
 * by "delete all data" so a reset is actually complete.
 */
export const EPHEMERAL_SESSION_STORAGE_KEYS: string[] = [
  appConfig.storageKey,
  `${appConfig.storageKey}:checklist`,
  `${appConfig.storageKey}:finding-filter`,
  `${appConfig.storageKey}:ai-note-feedback`,
  appConfig.testDriveChecklistStorageKey,
  appConfig.officialLookupChecklistStorageKey,
  appConfig.saleChecklistStorageKey,
];

/** Anonymous device/install identifiers — cleared on full reset, never exported (not user content). */
export const DEVICE_IDENTITY_LOCAL_STORAGE_KEYS: string[] = [INSTALL_ID_STORAGE_KEY];
