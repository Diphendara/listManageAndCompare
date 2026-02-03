/**
 * Custom lists persistence per specs.md §8.
 * - Each list saved as {listName}.json
 * - listasEnUso.json tracks which lists are marked as inUse
 */

import type { CustomList } from "../models/CustomList";
import type { StorageService } from "./storageService";
import { listFiles, deleteFile } from "./indexedDBStorage";

const LISTS_IN_USE_FILENAME = "listasEnUso.json";

export interface CustomListsService {
  loadList(listName: string): Promise<CustomList | null>;
  saveList(list: CustomList): Promise<void>;
  deleteList(listName: string, replaceWith?: string): Promise<void>;
  listExists(listName: string): Promise<boolean>;
  updateListInUseStatus(listName: string, inUse: boolean): Promise<void>;
  getListsInUse(): Promise<string[]>;
  getAllLists(): Promise<CustomList[]>;
}

/**
 * Creates the custom lists service.
 */
export function createCustomListsService(
  storage: StorageService
): CustomListsService {
  function getListFilename(listName: string): string {
    // Sanitize filename: replace spaces and special chars with underscore
    const sanitized = listName.replace(/[^a-zA-Z0-9_-]/g, "_");
    return `${sanitized}.json`;
  }

  return {
    async loadList(listName: string): Promise<CustomList | null> {
      try {
        const filename = getListFilename(listName);
        return await storage.readJson<CustomList>(filename);
      } catch {
        return null;
      }
    },

    async saveList(list: CustomList): Promise<void> {
      const filename = getListFilename(list.name);
      await storage.writeJson(filename, list);
      // Update listasEnUso.json after saving
      await updateListsInUseFile(storage);
    },

    async deleteList(listName: string, replaceWith?: string): Promise<void> {
      const filename = getListFilename(listName);
      await deleteFile(filename);
      // Update listasEnUso.json after deleting
      // If caller provided a replacement name, try to update listasEnUso.json by replacing the old name
      if (typeof replaceWith === "string") {
        await updateListsInUseReplace(storage, listName, replaceWith);
      } else {
        // Fallback: rewrite listasEnUso.json from scratch
        await updateListsInUseFile(storage);
      }
    },

    async listExists(listName: string): Promise<boolean> {
      const list = await this.loadList(listName);
      return list !== null;
    },

    async updateListInUseStatus(
      listName: string,
      inUse: boolean
    ): Promise<void> {
      const list = await this.loadList(listName);
      if (list) {
        list.inUse = inUse;
        await this.saveList(list);
      }
    },

    async getListsInUse(): Promise<string[]> {
      try {
        return await storage.readJson<string[]>(LISTS_IN_USE_FILENAME);
      } catch {
        return [];
      }
    },

    async getAllLists(): Promise<CustomList[]> {
      try {
        const allFiles = await listFiles(/\.json$/);
        // Filter out system files
        const listFiles_ = allFiles.filter(
          (f) => f !== LISTS_IN_USE_FILENAME && !f.startsWith("inventory")
        );

        const lists: CustomList[] = [];
        for (const file of listFiles_) {
          try {
            const list = await storage.readJson<CustomList>(file);
            if (list && list.name && Array.isArray(list.decklist)) {
              lists.push(list);
            }
          } catch {
            // Skip invalid files
          }
        }
        return lists;
      } catch {
        return [];
      }
    },
  };
}

/**
 * Helper to update listasEnUso.json with all lists marked as inUse.
 * This is a simplified version; in production, would need a way to list all files.
 */
async function updateListsInUseFile(storage: StorageService): Promise<void> {
  try {
    const allFiles = await listFiles(/\.json$/);
    const listFiles_ = allFiles.filter(
      (f) => f !== LISTS_IN_USE_FILENAME && !f.startsWith("inventory")
    );

    const namesInUse: string[] = [];
    for (const file of listFiles_) {
      try {
        const maybe = await storage.readJson<CustomList>(file);
        if (maybe && typeof maybe.name === "string" && maybe.inUse) {
          namesInUse.push(maybe.name);
        }
      } catch {
        // ignore invalid files
      }
    }

    try {
      await storage.writeJson(LISTS_IN_USE_FILENAME, namesInUse);
    } catch (err) {
      console.warn("Failed to write listasEnUso.json:", err);
    }
  } catch (err) {
    console.warn("updateListsInUseFile failed:", err);
  }
}

async function updateListsInUseReplace(
  storage: StorageService,
  oldName: string,
  newName: string
): Promise<void> {
  try {
    // Try to read existing listasEnUso.json
    let current: string[] = [];
    try {
      current = await storage.readJson<string[]>(LISTS_IN_USE_FILENAME);
      if (!Array.isArray(current)) current = [];
    } catch {
      current = [];
    }

    // Replace occurrences of oldName with newName (preserve uniqueness)
    const set = new Set(current.filter((n) => n !== oldName));
    if (newName) set.add(newName);

    await storage.writeJson(LISTS_IN_USE_FILENAME, Array.from(set));
  } catch (err) {
    // Fallback: try full rewrite
    try {
      await updateListsInUseFile(storage);
    } catch {
      console.warn("Failed to update listasEnUso.json via replace:", err);
    }
  }
}
