/**
 * Item data model per specs.md §5.2 (JSON Representation).
 */

export interface Item {
  quantity: number;
  name: string;
  tag?: string;
}
