import { formatItem } from '../../src/utils/itemFormat';
import type { Item } from '../../src/models/Item';

describe('itemFormat', () => {
  it('formats item with quantity and name', () => {
    const item: Item = { quantity: 5, name: 'Sword', tag: undefined };
    const result = formatItem(item);
    expect(result).toContain('5');
    expect(result).toContain('Sword');
  });

  it('includes tag when present', () => {
    const item: Item = { quantity: 3, name: 'Potion', tag: 'healing' };
    const result = formatItem(item);
    expect(result).toContain('healing');
  });

  it('handles items without tags', () => {
    const item: Item = { quantity: 1, name: 'Helmet', tag: undefined };
    const result = formatItem(item);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles various quantity values', () => {
    const testCases = [
      { quantity: 1, name: 'Item', tag: undefined },
      { quantity: 99, name: 'Item', tag: undefined },
      { quantity: 999, name: 'Item', tag: undefined },
    ];

    testCases.forEach((item) => {
      const result = formatItem(item);
      expect(result).toContain(item.quantity.toString());
    });
  });
});
