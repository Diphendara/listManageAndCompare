/**
 * File names and paths per specs.md §6, §7.
 */

import { getBackupDateString } from "../utils/dateUtils";

/** Inventory filename per specs.md §6. */
export const INVENTORY_FILENAME = "inventory.json";

/** Backup filename per specs.md §7: inventory_backup_DD_MM_YY_HH_MM.json */
export function getInventoryBackupFilename(): string {
  return `inventory_backup_${getBackupDateString(new Date())}.json`;
}
