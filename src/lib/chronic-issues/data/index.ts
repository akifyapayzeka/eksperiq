import type { ModelEntry } from "../types";
import { FIAT_ENTRIES } from "./fiat";
import { FORD_OPEL_ENTRIES } from "./ford-opel";
import { VW_ENTRIES } from "./vw";
import { TOYOTA_HYUNDAI_DACIA_ENTRIES } from "./toyota-hyundai-dacia";
import { PEUGEOT_SEAT_ENTRIES } from "./peugeot-seat";
import { SKODA_HONDA_CITROEN_NISSAN_KIA_ENTRIES } from "./skoda-honda-citroen-nissan-kia";

// Populated incrementally, model by model, from grounded research (forum
// consensus, known engine-family issues, technical service bulletins,
// official recalls) — never invented. Each ModelEntry only lists issues
// that are genuinely well-documented; see ../types.ts for the schema.
export const CHRONIC_ISSUES_DB: ModelEntry[] = [
  ...FIAT_ENTRIES,
  ...FORD_OPEL_ENTRIES,
  ...VW_ENTRIES,
  ...TOYOTA_HYUNDAI_DACIA_ENTRIES,
  ...PEUGEOT_SEAT_ENTRIES,
  ...SKODA_HONDA_CITROEN_NISSAN_KIA_ENTRIES,
];
