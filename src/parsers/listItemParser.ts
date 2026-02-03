/**
 * List item parser per specs.md §8.
 * Text format: [Quantity]x [Name] (NO tag for lists, only name)
 */

import type { ListItem } from "../models/CustomList";

export type ParseLineResult =
  | { ok: true; item: ListItem }
  | { ok: false; error: string };

export type ParseTextResult =
  | { ok: true; items: ListItem[] }
  | { ok: false; error: string };

const LINE_REGEX = /^(\d{1,3})x\s+(.+?)$/;
// Alternative format: [Quantity] [Name] (without "x")
const ALT_LINE_REGEX = /^(\d{1,3})\s+(.+?)$/;

/**
 * Parses a single line for list items (no tags).
 * Format: [Quantity]x [Name] or [Quantity] [Name]
 */
export function parseListItemLine(line: string): ParseLineResult | { ok: true; empty: true } {
  const trimmed = line.trim();
  if (trimmed === "") {
    return { ok: true, empty: true };
  }

  let match = trimmed.match(LINE_REGEX);
  if (!match) {
    match = trimmed.match(ALT_LINE_REGEX);
  }
  if (!match) {
    return { ok: false, error: "Invalid format" };
  }

  const quantity = parseInt(match[1], 10);
  const name = match[2].trim();

  if (name === "") {
    return { ok: false, error: "Invalid format" };
  }

  return { ok: true, item: { quantity, name } };
}

/**
 * Parses multiple lines. Ignores empty lines. Aborts on first error.
 */
export function parseListText(text: string): ParseTextResult {
  const lines = text.split(/\r?\n/);
  const items: ListItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const result = parseListItemLine(lines[i]);
    if ("empty" in result) {
      continue;
    }
    if (!result.ok) {
      return { ok: false, error: `Line ${i + 1}: ${result.error}` };
    }
    items.push(result.item);
  }

  return { ok: true, items };
}
