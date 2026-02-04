import { parseListText } from '../../src/parsers/listItemParser';

describe('listItemParser', () => {
  it('parses valid list items', () => {
    const result = parseListText('5x Sword\n3x Shield\n1x Helmet');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items.length).toBe(3);
      expect(result.items[0].quantity).toBe(5);
      expect(result.items[1].quantity).toBe(3);
    }
  });

  it('parses items with expected structure', () => {
    const result = parseListText('2x Potion\n1x Sword');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items[0].quantity).toBe(2);
      expect(result.items[0].name).toBe('Potion');
    }
  });

  it('handles empty input', () => {
    const result = parseListText('');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items.length).toBe(0);
    }
  });

  it('rejects invalid items', () => {
    const result = parseListText('5x Sword\nbad line');
    expect(result.ok).toBe(false);
  });
});
