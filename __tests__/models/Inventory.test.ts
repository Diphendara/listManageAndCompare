import type { Inventory } from '../../src/models/Inventory';

describe('Inventory model', () => {
  it('is an array of items', () => {
    const inventory: Inventory = [
      { quantity: 5, name: 'Sword', tag: undefined },
      { quantity: 3, name: 'Shield', tag: 'defense' },
    ];

    expect(Array.isArray(inventory)).toBe(true);
    expect(inventory.length).toBe(2);
  });

  it('can be empty', () => {
    const inventory: Inventory = [];
    expect(inventory.length).toBe(0);
  });

  it('supports large quantities of items', () => {
    const inventory: Inventory = Array.from({ length: 1000 }, (_, i) => ({
      quantity: i + 1,
      name: `Item ${i}`,
      tag: undefined,
    }));

    expect(inventory.length).toBe(1000);
  });

  it('preserves item order', () => {
    const inventory: Inventory = [
      { quantity: 1, name: 'First', tag: undefined },
      { quantity: 2, name: 'Second', tag: undefined },
      { quantity: 3, name: 'Third', tag: undefined },
    ];

    expect(inventory[0].name).toBe('First');
    expect(inventory[1].name).toBe('Second');
    expect(inventory[2].name).toBe('Third');
  });

  it('can contain items with various tags', () => {
    const inventory: Inventory = [
      { quantity: 5, name: 'Sword', tag: 'weapon' },
      { quantity: 3, name: 'Shield', tag: 'armor' },
      { quantity: 1, name: 'Healing Potion', tag: 'healing' },
      { quantity: 10, name: 'Gold', tag: 'currency' },
      { quantity: 2, name: 'Mystery Box', tag: undefined },
    ];

    expect(inventory.length).toBe(5);
    const withTags = inventory.filter((i) => i.tag).length;
    const noTags = inventory.filter((i) => !i.tag).length;
    expect(withTags).toBe(4);
    expect(noTags).toBe(1);
  });

  it('supports inventory manipulation', () => {
    let inventory: Inventory = [
      { quantity: 5, name: 'Sword', tag: undefined },
    ];

    // Add item
    inventory = [
      ...inventory,
      { quantity: 3, name: 'Shield', tag: undefined },
    ];
    expect(inventory.length).toBe(2);

    // Remove item
    inventory = inventory.filter((i) => i.name !== 'Sword');
    expect(inventory.length).toBe(1);
  });
});
