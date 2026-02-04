import { mergeItemsIntoInventory } from '../../src/utils/inventoryMerge';
import type { Item } from '../../src/models/Item';

describe('inventoryMerge', () => {
  it('adds new items to inventory', () => {
    const inventory: Item[] = [{ quantity: 5, name: 'Sword', tag: undefined }];
    const newItems: Item[] = [{ quantity: 3, name: 'Shield', tag: undefined }];

    const result = mergeItemsIntoInventory(inventory, newItems);
    expect(result.length).toBe(2);
    expect(result[1].name).toBe('Shield');
  });

  it('updates existing items by quantity', () => {
    const inventory: Item[] = [{ quantity: 5, name: 'Sword', tag: undefined }];
    const newItems: Item[] = [{ quantity: 3, name: 'Sword', tag: undefined }];

    const result = mergeItemsIntoInventory(inventory, newItems);
    expect(result.length).toBe(1);
    expect(result[0].quantity).toBe(8); // 5 + 3
  });

  it('matches items with same name and tag', () => {
    const inventory: Item[] = [{ quantity: 5, name: 'Potion', tag: 'healing' }];
    const newItems: Item[] = [{ quantity: 2, name: 'Potion', tag: 'healing' }];

    const result = mergeItemsIntoInventory(inventory, newItems);
    expect(result.length).toBe(1);
    expect(result[0].quantity).toBe(7);
  });

  it('distinguishes items by tag', () => {
    const inventory: Item[] = [
      { quantity: 5, name: 'Potion', tag: 'healing' },
    ];
    const newItems: Item[] = [
      { quantity: 2, name: 'Potion', tag: 'damage' },
    ];

    const result = mergeItemsIntoInventory(inventory, newItems);
    expect(result.length).toBe(2);
  });

  it('preserves original inventory items not in merge', () => {
    const inventory: Item[] = [
      { quantity: 5, name: 'Sword', tag: undefined },
      { quantity: 3, name: 'Shield', tag: undefined },
    ];
    const newItems: Item[] = [{ quantity: 1, name: 'Helmet', tag: undefined }];

    const result = mergeItemsIntoInventory(inventory, newItems);
    expect(result.length).toBe(3);
    expect(result.map((i) => i.name)).toContain('Sword');
    expect(result.map((i) => i.name)).toContain('Shield');
  });

  it('returns immutable copy', () => {
    const inventory: Item[] = [{ quantity: 5, name: 'Sword', tag: undefined }];
    const newItems: Item[] = [{ quantity: 3, name: 'Shield', tag: undefined }];

    const result = mergeItemsIntoInventory(inventory, newItems);
    expect(result).not.toBe(inventory);
    expect(inventory.length).toBe(1); // Original unchanged
  });
});
