/**
 * Item parser per specs.md §5 (Item Data Model) and §10 (Parsing Rules).
 * - Text format: [Quantity]x [Name] #[TAG]
 * - Ignore empty lines; reject invalid formats; no auto-correction; abort if errors exist.
 */

import type { Item } from "../models/Item";

export type { Item };

/** Result of parsing a single line (non-empty). */
export type ParseLineResult =
  | { ok: true; item: Item }
  | { ok: false; error: string };

/** Result of parsing multiple lines. Aborts on first invalid line per §10. */
export type ParseTextResult =
  | { ok: true; items: Item[] }
  | { ok: false; error: string };

const LINE_REGEX = /^(\d{1,3})x\s+(.+?)(?:\s+#(\S+))?$/;
// Additional format: [Quantity] [Name] #[TAG] (without the "x", tag still optional)
const ALT_LINE_REGEX = /^(\d{1,3})\s+(.+?)(?:\s+#(\S+))?$/;

/**
 * Parses a single line in format [Quantity]x [Name] #[TAG].
 * - Quantity: integer, max 3 digits (§5.1).
 * - Name: one or more words (§5.1).
 * - Tag: optional, single word, prefixed with # (§5.1).
 * Returns { ok: true, empty: true } for empty/whitespace-only lines (caller should ignore per §10).
 */
export function parseLine(line: string): ParseLineResult | { ok: true; empty: true } {
  const trimmed = line.trim();
  if (trimmed === "") {
    return { ok: true, empty: true };
  }

  let match = trimmed.match(LINE_REGEX);
  if (!match) {
    // Try alternate format without the "x"
    match = trimmed.match(ALT_LINE_REGEX);
  }
  if (!match) {
    return { ok: false, error: "Invalid format" };
  }

  const quantity = parseInt(match[1], 10);
  const name = match[2].trim();
  const tag = match[3] ?? undefined;

  if (name === "") {
    return { ok: false, error: "Invalid format" };
  }

  return {
    ok: true,
    item: { quantity, name, ...(tag !== undefined ? { tag } : {}) },
  };
}

/**
 * Parses multiple lines. Ignores empty lines (§10). Rejects invalid formats; aborts operation if any errors exist (§10).
 */
export function parseText(text: string): ParseTextResult {
  const lines = text.split(/\r?\n/);
  const items: Item[] = [];

  for (let i = 0; i < lines.length; i++) {
    const result = parseLine(lines[i]);
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
