import { getBackupDateString } from '../../src/utils/dateUtils';

describe('dateUtils', () => {
  it('returns formatted backup date string', () => {
    const date = new Date('2026-02-04T14:30:00');
    const result = getBackupDateString(date);
    // Format: DD_MM_YY_HH_MM
    expect(result).toMatch(/^\d{2}_\d{2}_\d{2}_\d{2}_\d{2}$/);
  });

  it('returns consistent format', () => {
    const date = new Date('2026-02-04T14:30:00');
    const result1 = getBackupDateString(date);
    const result2 = getBackupDateString(date);
    // Both should follow same format
    expect(result1).toMatch(/^\d{2}_\d{2}_\d{2}_\d{2}_\d{2}$/);
    expect(result2).toMatch(/^\d{2}_\d{2}_\d{2}_\d{2}_\d{2}$/);
    expect(result1).toBe(result2); // Same date should produce same string
  });

  it('contains valid date components', () => {
    const date = new Date('2026-02-04T14:30:00');
    const result = getBackupDateString(date);
    const parts = result.split('_');
    expect(parts.length).toBe(5); // DD_MM_YY_HH_MM

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const hour = parseInt(parts[3], 10);
    const minute = parseInt(parts[4], 10);

    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(31);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
    expect(hour).toBeGreaterThanOrEqual(0);
    expect(hour).toBeLessThanOrEqual(23);
    expect(minute).toBeGreaterThanOrEqual(0);
    expect(minute).toBeLessThanOrEqual(59);
  });
});
