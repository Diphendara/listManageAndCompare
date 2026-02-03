/**
 * Format item for display per specs.md §5.1 text format: [Quantity]x [Name] #[TAG]
 * Name displayed in title case.
 */

import type { Item } from "../models/Item";
import { toTitleCase } from "./textFormat";

export function formatItem(item: Item): string {
  const tagPart = item.tag != null ? ` #${item.tag}` : "";
  return `${item.quantity}x ${toTitleCase(item.name)}${tagPart}`;
}
