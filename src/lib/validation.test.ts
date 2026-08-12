import { describe, expect, it } from 'vitest';

import { VALIDATION_MESSAGES } from '../content/labels';
import { validateGrossSalary } from './validation';

describe('validateGrossSalary', () => {
  it('accepts a salary inside the allowed range', () => {
    expect(validateGrossSalary('35000')).toEqual({ errorMessage: null, amount: 35_000 });
  });

  it('accepts a comma as decimal separator', () => {
    expect(validateGrossSalary('35000,5').amount).toBe(35_000.5);
  });

  it.each(['', '   ', 'abc'])('rejects non-numeric input (%o)', (input) => {
    const { errorMessage, amount } = validateGrossSalary(input);

    expect(errorMessage).toBe(VALIDATION_MESSAGES.notANumber);
    expect(amount).toBeNull();
  });

  it('rejects salaries below the minimum', () => {
    const { errorMessage, amount } = validateGrossSalary('7999');

    expect(errorMessage).toBe(VALIDATION_MESSAGES.belowMinimum);
    expect(amount).toBeNull();
  });

  it('rejects salaries above the maximum', () => {
    const { errorMessage, amount } = validateGrossSalary('1000001');

    expect(errorMessage).toBe(VALIDATION_MESSAGES.aboveMaximum);
    expect(amount).toBeNull();
  });

  it.each(['8000', '1000000'])('accepts the bounds themselves (%s)', (input) => {
    expect(validateGrossSalary(input).errorMessage).toBeNull();
  });
});
