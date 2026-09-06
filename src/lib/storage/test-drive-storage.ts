"use client";

import { appConfig } from "@/lib/constants/app";
import { createSessionChecklistStore } from "./session-checklist";

// Aracin basinda doldurulan liste; oturumluk tutuldugunda iOS uygulamayi
// bellek icin sonlandirdiginda kayboluyordu.
const store = createSessionChecklistStore(appConfig.testDriveChecklistStorageKey, { persistent: true });

export const saveTestDriveChecklist = store.save;
export const loadTestDriveChecklist = store.load;
