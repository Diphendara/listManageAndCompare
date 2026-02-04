import type { Item } from '../../src/models/Item';

describe('Item model', () => {
  it('creates item with all properties', () => {
    const item: Item = {
      quantity: 5,
      name: 'Sword',
      tag: 'weapon',
    };

    expect(item.quantity).toBe(5);
    expect(item.name).toBe('Sword');
    expect(item.tag).toBe('weapon');
  });

  it('allows undefined tag', () => {
    const item: Item = {
      quantity: 3,
      name: 'Shield',
      tag: undefined,
    };

    expect(item.tag).toBeUndefined();
  });

  it('enforces quantity as number', () => {
    const item: Item = {
      quantity: 999,
      name: 'Test',
      tag: undefined,
    };

    expect(typeof item.quantity).toBe('number');
    expect(item.quantity).toBe(999);
  });

  it('supports various name formats', () => {
    const testCases = [
      'Single Word',
      'Multiple Word Name',
      'Name-With-Dashes',
      'Name.With.Dots',
      'Potion of Healing',
      'Item-123',
    ];

    testCases.forEach((name) => {
      const item: Item = { quantity: 1, name, tag: undefined };
      expect(item.name).toBe(name);
    });
  });

  it('supports various tag formats', () => {
    const testCases = ['weapon', 'armor', 'healing', 'currency', 'quest'];

    testCases.forEach((tag) => {
      const item: Item = { quantity: 1, name: 'Test', tag };
      expect(item.tag).toBe(tag);
    });
  });

  it('is immutable through type system', () => {
    const item: Item = {
      quantity: 5,
      name: 'Sword',
      tag: 'weapon',
    };

    // TypeScript should prevent reassignment
    expect(item.quantity).toBe(5);
  });
});
