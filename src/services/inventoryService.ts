/**
 * Inventory persistence per specs.md §6, §7.
 * - Inventory stored in inventory.json (§6).
 * - Every change creates inventory_backup_DD_MM_YY_HH_MM.json (§7).
 * - Maximum backups per day is configurable (default: 10).
 */

import type { Inventory } from "../models/Inventory";
import type { StorageService } from "./storageService";
import { INVENTORY_FILENAME, getInventoryBackupFilename } from "../constants/paths";
import { getBackupDateString } from "../utils/dateUtils";
import { listFiles, deleteFile } from "./indexedDBStorage";
import { DEFAULT_SETTINGS } from "../models/AppSettings";

export interface InventoryPaths {
  readonly INVENTORY_FILENAME: string;
  getInventoryBackupFilename(): string;
}

export interface InventoryService {
  loadInventory(): Promise<Inventory>;
  saveInventory(inventory: Inventory): Promise<void>;
}

function sortInventory(inventory: Inventory): Inventory {
  return [...inventory].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    if (nameA !== nameB) {
      return nameA.localeCompare(nameB);
    }

    const tagA = (a.tag ?? "").toLowerCase();
    const tagB = (b.tag ?? "").toLowerCase();
    return tagA.localeCompare(tagB);
  });
}

/**
 * Creates the inventory service: load from inventory.json, save and create backup on every change (§7).
 * The inventory is synced from the latest backup file for data integrity.
 * Limits backups per day based on settings; deletes the oldest backup of the day if limit is exceeded.
 * Note: Settings are read at cleanup time to support dynamic configuration changes.
 */
export function createInventoryService(
  storage: StorageService,
  paths: InventoryPaths = { INVENTORY_FILENAME, getInventoryBackupFilename }
): InventoryService {
  return {
    async loadInventory(): Promise<Inventory> {
      try {
        // First try to load from main inventory.json
        return await storage.readJson<Inventory>(paths.INVENTORY_FILENAME);
      } catch {
        // If that fails, try to load from the latest backup
        try {
          const backups = await listFiles(/inventory_backup_.+\.json$/);
          if (backups.length > 0) {
            // Get the newest backup (first one, as they're sorted descending)
            const latestBackup = backups[0];
            const inventory = await storage.readJson<Inventory>(latestBackup);
            // Sync it to inventory.json for next time
            await storage.writeJson(paths.INVENTORY_FILENAME, inventory);
            return inventory;
          }
        } catch (e) {
          // If no backups exist either, return empty
        }
        return [];
      }
    },

    async saveInventory(inventory: Inventory): Promise<void> {
      // 1. First, create backup of CURRENT state (before changes)
      try {
        const currentInventory = await storage.readJson<Inventory>(paths.INVENTORY_FILENAME);
        const backupFilename = paths.getInventoryBackupFilename();
        await storage.writeJson(backupFilename, currentInventory);
      } catch {
        // If inventory.json doesn't exist yet, create empty backup
        const backupFilename = paths.getInventoryBackupFilename();
        await storage.writeJson(backupFilename, []);
      }

      // 2. Then update inventory.json with NEW state
      const sorted = sortInventory(inventory);
      await storage.writeJson(paths.INVENTORY_FILENAME, sorted);

      // 3. Clean up old backups (reads settings dynamically to support configuration changes)
      await cleanupOldBackups(storage);
    },
  };
}

/**
 * Cleans up old backups, keeping maximum configured number per day.
 * If more backups exist than max, deletes the oldest one.
 * Reads current settings from storage to support dynamic configuration.
 */
async function cleanupOldBackups(storage: StorageService): Promise<void> {
  try {
    // Load current settings to get max backups limit
    let maxBackupsPerDay = DEFAULT_SETTINGS.maxBackupsPerDay;
    try {
      const settings = await storage.readJson<{ maxBackupsPerDay: number }>("app_settings.json");
      if (settings && typeof settings.maxBackupsPerDay === "number") {
        maxBackupsPerDay = settings.maxBackupsPerDay;
      }
    } catch {
      // Use default if settings not found
    }

    const today = getBackupDateString(new Date()).substring(0, 8); // DD_MM_YY format
    const todayPattern = new RegExp(`inventory_backup_${today}_.+\\.json$`);

    const backupsToday = await listFiles(todayPattern);

    // If more than max backups today, delete the oldest
    if (backupsToday.length > maxBackupsPerDay) {
      const oldestBackup = backupsToday[0]; // Already sorted by timestamp in listFiles
      await deleteFile(oldestBackup);
    }
  } catch (err) {
    // Silently ignore cleanup errors to not disrupt saving
    console.warn("Failed to cleanup old backups:", err);
  }
}
