import { afterEach, describe, expect, it } from "vitest";
import { appConfig } from "@/lib/constants/app";
import { exportDataAsJson } from "@/lib/data-management/export-import";
import { loadProductEvents, recordProductEvent } from "@/lib/analytics/productEvents";
import { upsertExpense } from "@/lib/storage/expenses-storage";
import { upsertReminder } from "@/lib/storage/reminders-storage";

describe("local product events", () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  it("stores only local scalar payloads for product workflow events", () => {
    recordProductEvent("analysis_created", {
      scoreBand: 70,
      riskLabel: "Düşük risk",
      findingCount: 2,
      highFindingCount: 0,
      completenessPercent: 88,
    });

    expect(loadProductEvents()).toMatchObject([
      {
        name: "analysis_created",
        payload: {
          scoreBand: 70,
          riskLabel: "Düşük risk",
          findingCount: 2,
          highFindingCount: 0,
          completenessPercent: 88,
        },
      },
    ]);
    expect(window.localStorage.getItem(appConfig.productEventsStorageKey)).not.toContain("Toyota");
  });

  it("records expense, reminder, and export milestones without blocking the workflow", () => {
    upsertExpense({
      id: "expense-1",
      category: "bakim",
      amount: 1200,
      date: "2026-08-17",
      odometer: 64000,
      note: "Kişisel not kayda girmemeli",
      createdAt: "2026-08-17T10:00:00.000Z",
      vehicleId: "vehicle-1",
    });
    upsertReminder({
      id: "reminder-1",
      category: "muayene",
      title: "Muayene",
      dueDate: "2026-09-01",
      recurrence: "yearly",
      history: [],
      amount: 1900,
      note: "Not kayda girmemeli",
      createdAt: "2026-08-17T10:00:00.000Z",
      vehicleId: "vehicle-1",
    });
    exportDataAsJson();

    const events = loadProductEvents();
    expect(events.map((event) => event.name)).toEqual(["data_exported", "reminder_saved", "expense_record_saved"]);
    expect(events[1].payload).toEqual({
      category: "muayene",
      recurrence: "yearly",
      hasAmount: true,
      hasVehicle: true,
    });
    expect(events[2].payload).toEqual({
      category: "bakim",
      hasOdometer: true,
      hasVehicle: true,
    });
    expect(window.localStorage.getItem(appConfig.productEventsStorageKey)).not.toContain("Kişisel not");
  });
});
