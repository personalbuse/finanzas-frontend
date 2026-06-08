import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../utils/format';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56)).toContain('1,234.56');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toContain('0.00');
  });

  it('handles negative values', () => {
    expect(formatCurrency(-500)).toContain('-500.00');
  });
});
