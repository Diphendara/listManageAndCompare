/**
 * Inventory concept per specs.md §6.
 * The Inventory is the canonical collection of all items.
 * Structure: array of item objects.
 */

import type { Item } from "./Item";

/** Inventory: array of item objects (§6). */
export type Inventory = Item[];
