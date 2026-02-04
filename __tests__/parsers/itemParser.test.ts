import { parseText } from '../../src/parsers/itemParser';

describe('itemParser', () => {
  it('parses valid item with quantity and name', () => {
    const result = parseText('5x Sword');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items[0].quantity).toBe(5);
      expect(result.items[0].name).toBe('Sword');
    }
  });

  it('parses item with tag', () => {
    const result = parseText('3x Potion #magic');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items[0].quantity).toBe(3);
      expect(result.items[0].name).toBe('Potion');
      expect(result.items[0].tag).toBe('magic');
    }
  });

  it('parses with space separator', () => {
    const result = parseText('2 Shield #defense');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items[0].quantity).toBe(2);
      expect(result.items[0].name).toBe('Shield');
    }
  });

  it('ignores empty lines', () => {
    const result = parseText('5x Sword\n\n3x Shield');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items.length).toBe(2);
    }
  });

  it('rejects invalid quantity', () => {
    const result = parseText('999x Sword');
    expect(result.ok).toBe(false);
  });

  it('rejects quantity with leading zero', () => {
    const result = parseText('05x Sword');
    expect(result.ok).toBe(false);
  });

  it('rejects negative quantity', () => {
    const result = parseText('-5x Sword');
    expect(result.ok).toBe(false);
  });

  it('rejects missing name', () => {
    const result = parseText('5x');
    expect(result.ok).toBe(false);
  });

  it('aborts on first error', () => {
    const text = '5x Sword\ninvalid line\n3x Shield';
    const result = parseText(text);
    expect(result.ok).toBe(false);
  });
});
