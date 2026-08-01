"use client";

import { appConfig } from "@/lib/constants/app";
import { createSessionChecklistStore } from "./session-checklist";

const store = createSessionChecklistStore(appConfig.testDriveChecklistStorageKey);

export const saveTestDriveChecklist = store.save;
export const loadTestDriveChecklist = store.load;
