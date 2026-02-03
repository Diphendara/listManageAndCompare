/**
 * JSON importer for inventory.json files.
 * Validates that imported JSON has the correct format: { quantity, name, tag? }[]
 */

import type { Item } from "../models/Item";
import type { Inventory } from "../models/Inventory";

export interface ImportResult {
  ok: true;
  inventory: Inventory;
}

export interface ImportError {
  ok: false;
  error: string;
}

export type ImportJsonResult = ImportResult | ImportError;

/**
 * Validates that an item has the required properties.
 */
function isValidItem(item: unknown): item is Item {
  if (typeof item !== "object" || item === null) {
    return false;
  }

  const obj = item as Record<string, unknown>;

  // Check required properties
  if (typeof obj.quantity !== "number" || obj.quantity <= 0) {
    return false;
  }
  if (typeof obj.name !== "string" || obj.name.trim() === "") {
    return false;
  }

  // Check optional tag
  if (obj.tag !== undefined && typeof obj.tag !== "string") {
    return false;
  }

  return true;
}

/**
 * Imports and validates a JSON file content.
 * Expects an array of items: { quantity, name, tag? }[]
 */
export function importJsonInventory(jsonContent: string): ImportJsonResult {
  try {
    const parsed = JSON.parse(jsonContent);

    // Must be an array
    if (!Array.isArray(parsed)) {
      return { ok: false, error: "JSON must be an array of items" };
    }

    // Validate each item
    for (let i = 0; i < parsed.length; i++) {
      if (!isValidItem(parsed[i])) {
        return {
          ok: false,
          error: `Item ${i}: invalid format. Expected { quantity: number, name: string, tag?: string }`,
        };
      }
    }

    return { ok: true, inventory: parsed as Inventory };
  } catch (err) {
    return {
      ok: false,
      error: `Invalid JSON: ${err instanceof Error ? err.message : "unknown error"}`,
    };
  }
}
