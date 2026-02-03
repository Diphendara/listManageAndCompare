/**
 * Merge parsed items into inventory: same name+tag => add quantity; else append.
 * Used when applying the change list (§7 add).
 */

import type { Item } from "../models/Item";
import type { Inventory } from "../models/Inventory";

function key(item: Item): string {
  const tag = (item.tag ?? "").toLowerCase();
  return `${item.name.toLowerCase()}|${tag}`;
}

/** Returns a new inventory with items merged (add quantity by name+tag, else append). */
export function mergeItemsIntoInventory(
  inventory: Inventory,
  toAdd: Item[]
): Inventory {
  const byKey = new Map<string, Item>();
  // Normalize existing inventory items to lowercase
  for (const item of inventory) {
    const normalized = {
      ...item,
      name: item.name.toLowerCase(),
      tag: item.tag?.toLowerCase(),
    };
    byKey.set(key(normalized), normalized);
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
