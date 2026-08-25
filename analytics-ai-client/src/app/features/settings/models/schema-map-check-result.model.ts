export interface SchemaMapCheckResult {
  changed: boolean;
  tablesNow: number;
  addedTables: string[];
  removedTables: string[];
  changedTables: string[];
}
