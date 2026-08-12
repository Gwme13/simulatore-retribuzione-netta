/**
 * Italian number formatting for every figure shown in the UI.
 *
 * All rounding lives here. The payroll calculation keeps full precision (see
 * `payroll.ts`), so these helpers are the single place where numbers become
 * strings, which keeps the displayed format consistent across the page.
 */

const LOCALE = 'it-IT';

/**
 * Formats an amount as euros: no decimals, dot as thousands separator, and a
 * space after the symbol.
 *
 * `useGrouping: 'always'` is required because Italian would otherwise leave
 * four-digit numbers ungrouped, rendering `8000` instead of `8.000`.
 *
 * @param amount - Amount in euros.
 * @returns The formatted amount, e.g. `"€ 35.000"`.
 */
export function formatCurrency(amount: number): string {
  return `€ ${Math.round(amount).toLocaleString(LOCALE, { useGrouping: 'always' })}`;
}

/**
 * Formats how much one amount weighs on another, with a single decimal.
 *
 * @param amount - The part.
 * @param base - The whole. A non-positive base yields `"0,0%"` rather than a
 *   division by zero.
 * @returns The share, e.g. `"24,2%"`.
 */
export function formatShare(amount: number, base: number): string {
  if (base <= 0) return '0,0%';

  const percentage = (amount / base) * 100;
  return `${percentage.toLocaleString(LOCALE, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

/**
 * Formats a statutory rate with two decimals, as rates are published.
 *
 * @param percentage - Rate as a percentage, e.g. `9.19`.
 * @returns The formatted rate, e.g. `"9,19%"`.
 */
export function formatRate(percentage: number): string {
  return `${percentage.toLocaleString(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

/**
 * Formats an IRPEF band rate, which is always a whole percentage.
 *
 * @param percentage - Rate as a percentage, e.g. `23`.
 * @returns The formatted rate, e.g. `"23%"`.
 */
export function formatWholeRate(percentage: number): string {
  return `${percentage.toFixed(0)}%`;
}

/**
 * Formats a rate expressed as a fraction, with two decimals.
 *
 * @param fraction - Rate as a fraction, e.g. `0.0919`.
 * @returns The formatted rate, e.g. `"9,19%"`.
 */
export function formatFractionAsRate(fraction: number): string {
  return formatRate(fraction * 100);
}
