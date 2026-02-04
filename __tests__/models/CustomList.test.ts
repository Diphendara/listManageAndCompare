import type { CustomList, ListItem } from '../../src/models/CustomList';

describe('CustomList model', () => {
  it('creates a valid custom list', () => {
    const list: CustomList = {
      name: 'My Deck',
      decklist: [
        { quantity: 5, name: 'Sword' },
        { quantity: 3, name: 'Shield' },
      ],
      inUse: true,
    };

    expect(list.name).toBe('My Deck');
    expect(list.decklist.length).toBe(2);
    expect(list.inUse).toBe(true);
  });

  it('supports empty decklist', () => {
    const list: CustomList = {
      name: 'Empty Deck',
      decklist: [],
      inUse: false,
    };

    expect(list.decklist.length).toBe(0);
  });

  it('supports inUse toggle', () => {
    const list: CustomList = {
      name: 'Test Deck',
      decklist: [{ quantity: 1, name: 'Item' }],
      inUse: false,
    };

    expect(list.inUse).toBe(false);

    const toggledList: CustomList = { ...list, inUse: true };
    expect(toggledList.inUse).toBe(true);
  });

  it('can contain many items', () => {
    const decklist: ListItem[] = Array.from({ length: 100 }, (_, i) => ({
      quantity: i + 1,
      name: `Card ${i}`,
    }));

    const list: CustomList = {
      name: 'Large Deck',
      decklist,
      inUse: true,
    };

    expect(list.decklist.length).toBe(100);
  });

  it('calculates total quantity', () => {
    const list: CustomList = {
      name: 'My Deck',
      decklist: [
        { quantity: 5, name: 'Sword' },
        { quantity: 3, name: 'Shield' },
        { quantity: 2, name: 'Helmet' },
      ],
      inUse: true,
    };

    const total = list.decklist.reduce((sum, item) => sum + item.quantity, 0);
    expect(total).toBe(10);
  });
});
