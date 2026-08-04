import { CURRENT_DATA_SCHEMA_VERSION, type DataExportBundle } from "./schema";

type Migration = (bundle: DataExportBundle) => DataExportBundle;

/**
 * No migrations exist yet — schema version 1 is the first version this app
 * has ever exported. When the export shape changes in a breaking way,
 * bump CURRENT_DATA_SCHEMA_VERSION and add an entry here keyed by the
 * version being migrated FROM (e.g. migrations[1] converts a v1 bundle to
 * v2). migrateBundle() then walks forward automatically.
 */
const migrations: Record<number, Migration> = {};

export function migrateBundle(bundle: DataExportBundle): DataExportBundle {
  let current = bundle;
  while (current.schemaVersion < CURRENT_DATA_SCHEMA_VERSION) {
    const migrate = migrations[current.schemaVersion];
    if (!migrate) break;
    current = migrate(current);
  }
  return current;
}
