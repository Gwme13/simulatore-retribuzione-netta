import { describe, expect, it } from 'vitest';

import {
  formatCurrency,
  formatFractionAsRate,
  formatRate,
  formatShare,
  formatWholeRate,
} from './format';

describe('formatCurrency', () => {
  it('uses a space after the symbol and a dot as thousands separator', () => {
    expect(formatCurrency(35_000)).toBe('€ 35.000');
    expect(formatCurrency(250_000)).toBe('€ 250.000');
  });

  it('groups four-digit amounts, which Italian would otherwise leave ungrouped', () => {
    expect(formatCurrency(8_000)).toBe('€ 8.000');
  });

  it('rounds to whole euros', () => {
    expect(formatCurrency(3_216.5)).toBe('€ 3.217');
    expect(formatCurrency(254.268)).toBe('€ 254');
    expect(formatCurrency(0)).toBe('€ 0');
  });
});

describe('formatShare', () => {
  it('renders one decimal with a comma', () => {
    expect(formatShare(7_688.555, 31_783.5)).toBe('24,2%');
    expect(formatShare(1, 2)).toBe('50,0%');
  });

  it('falls back to 0,0% instead of dividing by a non-positive base', () => {
    expect(formatShare(100, 0)).toBe('0,0%');
    expect(formatShare(100, -1)).toBe('0,0%');
  });
});

describe('formatRate', () => {
  it('renders statutory rates with two decimals', () => {
    expect(formatRate(9.19)).toBe('9,19%');
    expect(formatRate(1.23)).toBe('1,23%');
    expect(formatRate(10.19)).toBe('10,19%');
  });
});

describe('formatFractionAsRate', () => {
  it('converts a fraction before formatting, absorbing float noise', () => {
    expect(formatFractionAsRate(0.0123)).toBe('1,23%');
    expect(formatFractionAsRate(0.0919)).toBe('9,19%');
  });
});

describe('formatWholeRate', () => {
  it('renders income tax rates without decimals', () => {
    expect(formatWholeRate(23)).toBe('23%');
    expect(formatWholeRate(43)).toBe('43%');
  });
});
