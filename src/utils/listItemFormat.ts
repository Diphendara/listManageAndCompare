/**
 * Format list item for display: [Quantity]x [Name]
 */

import type { ListItem } from "../models/CustomList";

export function formatListItem(item: ListItem): string {
  return `${item.quantity}x ${item.name}`;
}
