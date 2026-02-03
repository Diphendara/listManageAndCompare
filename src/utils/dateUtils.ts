/**
 * Date formatting for backup filenames per specs.md §7 (inventory_backup_DD_MM_YY_HH_MM.json).
 */

/** Returns "DD_MM_YY_HH_MM" (2-digit day, month, year, hour, minute) for backup filename. */
export function getBackupDateString(date: Date): string {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear().toString().slice(-2);
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${d}_${m}_${y}_${h}_${min}`;
}
