/**
 * Validation of the gross salary typed into the input field.
 *
 * Kept apart from the components so the rules, and their order (which decides
 * which message wins), can be read and tested without rendering anything.
 */

import { INPUT_RANGE, VALIDATION_MESSAGES } from '../content/labels';

/** Outcome of validating the raw field text. */
export interface SalaryValidation {
  /** Message to show, or `null` when the input is acceptable. */
  readonly errorMessage: string | null;
  /** Parsed amount, or `null` when the input cannot be used for a calculation. */
  readonly amount: number | null;
}

/**
 * Validates the raw text of the salary field.
 *
 * A comma is accepted as decimal separator before parsing, since that is what an
 * Italian keyboard produces. Checks run in order, so the first failure is the
 * message the user sees.
 *
 * @param rawValue - Exact text currently in the field.
 * @returns The message to display and the amount to calculate with.
 *
 * @example
 * validateGrossSalary('35000'); // { errorMessage: null, amount: 35000 }
 * validateGrossSalary('');      // { errorMessage: 'Inserisci una RAL valida.', amount: null }
 */
export function validateGrossSalary(rawValue: string): SalaryValidation {
  const amount = Number.parseFloat(rawValue.replace(',', '.'));

  if (rawValue === '' || Number.isNaN(amount)) {
    return { errorMessage: VALIDATION_MESSAGES.notANumber, amount: null };
  }

  if (amount < INPUT_RANGE.min) {
    return { errorMessage: VALIDATION_MESSAGES.belowMinimum, amount: null };
  }

  if (amount > INPUT_RANGE.max) {
    return { errorMessage: VALIDATION_MESSAGES.aboveMaximum, amount: null };
  }

  return { errorMessage: null, amount };
}
