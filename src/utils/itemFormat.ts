/**
 * Format item for display per specs.md §5.1 text format: [Quantity]x [Name] #[TAG]
 */

import type { Item } from "../models/Item";

export function formatItem(item: Item): string {
  const tagPart = item.tag != null ? ` #${item.tag}` : "";
  return `${item.quantity}x ${item.name}${tagPart}`;
}
