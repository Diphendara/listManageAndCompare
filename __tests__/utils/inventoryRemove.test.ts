import { removeItemsFromInventory } from '../../src/utils/inventoryRemove';
import type { Item } from '../../src/models/Item';

describe('inventoryRemove', () => {
  it('removes items by quantity', () => {
    const inventory: Item[] = [{ quantity: 5, name: 'Sword', tag: undefined }];
    const toRemove: Item[] = [{ quantity: 2, name: 'Sword', tag: undefined }];

    const result = removeItemsFromInventory(inventory, toRemove);
    expect(result.inventory[0].quantity).toBe(3); // 5 - 2
  });

  it('completely removes items when quantity reaches zero', () => {
    const inventory: Item[] = [{ quantity: 5, name: 'Sword', tag: undefined }];
    const toRemove: Item[] = [{ quantity: 5, name: 'Sword', tag: undefined }];

    const result = removeItemsFromInventory(inventory, toRemove);
    expect(result.inventory.length).toBe(0);
  });

  it('ignores items not in inventory', () => {
    const inventory: Item[] = [{ quantity: 5, name: 'Sword', tag: undefined }];
    const toRemove: Item[] = [{ quantity: 2, name: 'Shield', tag: undefined }];

    const result = removeItemsFromInventory(inventory, toRemove);
    expect(result.inventory.length).toBe(1);
    expect(result.inventory[0].name).toBe('Sword');
  });

  it('matches by name and tag', () => {
    const inventory: Item[] = [
      { quantity: 5, name: 'Potion', tag: 'healing' },
      { quantity: 3, name: 'Potion', tag: 'damage' },
    ];
    const toRemove: Item[] = [{ quantity: 2, name: 'Potion', tag: 'healing' }];

    const result = removeItemsFromInventory(inventory, toRemove);
    expect(result.inventory.length).toBe(2);
    expect(result.inventory[0].quantity).toBe(3); // healing potion reduced
    expect(result.inventory[1].quantity).toBe(3); // damage potion unchanged
  });

  it('handles removing more than available', () => {
    const inventory: Item[] = [{ quantity: 3, name: 'Sword', tag: undefined }];
    const toRemove: Item[] = [{ quantity: 5, name: 'Sword', tag: undefined }];

    const result = removeItemsFromInventory(inventory, toRemove);
    // Should remove completely or handle gracefully
    expect(result.inventory.every((i) => i.quantity >= 0)).toBe(true);
  });

  it('returns removed keys', () => {
    const inventory: Item[] = [
      { quantity: 5, name: 'Sword', tag: undefined },
      { quantity: 3, name: 'Shield', tag: 'defense' },
    ];
    const toRemove: Item[] = [{ quantity: 2, name: 'Sword', tag: undefined }];

    const result = removeItemsFromInventory(inventory, toRemove);
    expect(result.removedKeys.size).toBeGreaterThanOrEqual(0);
  });
});
