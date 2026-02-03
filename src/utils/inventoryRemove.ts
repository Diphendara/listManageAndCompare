/**
 * Remove items from inventory: subtract quantity or delete if quantity reaches 0.
 * Returns both the updated inventory and which items were actually removed.
 * Used when applying the delete operation (§7 remove).
 */

import type { Item } from "../models/Item";
import type { Inventory } from "../models/Inventory";

export interface RemoveResult {
  inventory: Inventory;
  removedKeys: Set<string>;
}

function key(item: Item): string {
  const tag = item.tag ?? "";
  return `${item.name}|${tag}`;
}

/**
 * Returns a new inventory with items removed, plus a set of keys that were actually removed.
 * - If quantity after subtraction > 0: update quantity
 * - If quantity after subtraction <= 0: remove item completely
 * - If item not found in inventory: return unchanged inventory and don't add to removedKeys
 */
export function removeItemsFromInventory(
  inventory: Inventory,
  toRemove: Item[]
): RemoveResult {
  const byKey = new Map<string, Item>();
  for (const item of inventory) {
    byKey.set(key(item), { ...item });
  }

  const removedKeys = new Set<string>();

  for (const item of toRemove) {
    const k = key(item);
    const existing = byKey.get(k);
    if (existing) {
      existing.quantity -= item.quantity;
      if (existing.quantity <= 0) {
        byKey.delete(k);
      }
      removedKeys.add(k);
    }
    // If item not found, don't add to removedKeys (stays in textarea)
  }

  return {
    inventory: Array.from(byKey.values()),
    removedKeys,
  };
}
