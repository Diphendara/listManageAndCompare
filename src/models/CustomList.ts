/**
 * Custom List data model per specs.md §8.
 * Each list has:
 * - name: identifier for the list
 * - inUse: boolean flag
 * - decklist: array of items (quantity + name, no tag)
 */

export interface ListItem {
  quantity: number;
  name: string;
}

export interface CustomList {
  name: string;
  inUse: boolean;
  decklist: ListItem[];
}
