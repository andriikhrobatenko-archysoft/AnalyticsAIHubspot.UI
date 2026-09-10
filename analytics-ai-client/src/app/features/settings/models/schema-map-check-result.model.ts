export interface SchemaMapCheckResult {
  hasChanges: boolean;
  itemsNow: number;
  added: string[];
  removed: string[];
  changed: string[];
}
