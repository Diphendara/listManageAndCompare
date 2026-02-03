/**
 * Merge parsed items into inventory: same name+tag => add quantity; else append.
 * Used when applying the change list (§7 add).
 */

import type { Item } from "../models/Item";
import type { Inventory } from "../models/Inventory";

function key(item: Item): string {
  const tag = item.tag ?? "";
  return `${item.name}|${tag}`;
}

/** Returns a new inventory with items merged (add quantity by name+tag, else append). */
export function mergeItemsIntoInventory(
  inventory: Inventory,
  toAdd: Item[]
): Inventory {
  const byKey = new Map<string, Item>();
  for (const item of inventory) {
    byKey.set(key(item), { ...item });
  }
  for (const item of toAdd) {
    const k = key(item);
    const existing = byKey.get(k);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      byKey.set(k, { ...item });
    }
  }
  return Array.from(byKey.values());
}
