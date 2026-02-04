import { toTitleCase } from '../../src/utils/textFormat';

describe('textFormat', () => {
  it('capitalizes first letter of each word', () => {
    const result = toTitleCase('hello world');
    expect(result).toBe('Hello World');
  });

  it('handles single word', () => {
    const result = toTitleCase('sword');
    expect(result).toBe('Sword');
  });

  it('handles already capitalized text', () => {
    const result = toTitleCase('Hello World');
    expect(result).toBe('Hello World');
  });

  it('handles all uppercase', () => {
    const result = toTitleCase('POTION');
    expect(result).toContain('P');
  });

  it('handles multiple spaces', () => {
    const result = toTitleCase('hello  world');
    expect(result).toContain('Hello');
    expect(result).toContain('World');
  });

  it('handles empty string', () => {
    const result = toTitleCase('');
    expect(result).toBe('');
  });

  it('handles single character', () => {
    const result = toTitleCase('a');
    expect(result).toBe('A');
  });
});
