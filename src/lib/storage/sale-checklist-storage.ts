"use client";

import { appConfig } from "@/lib/constants/app";
import { createSessionChecklistStore } from "./session-checklist";

const store = createSessionChecklistStore(appConfig.saleChecklistStorageKey);

export const saveSaleChecklist = store.save;
export const loadSaleChecklist = store.load;
