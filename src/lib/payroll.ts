/**
 * Italian gross-to-net payroll computation for the 2026 tax year.
 *
 * This module is deliberately free of React and of any presentation concern: it
 * takes a gross annual salary and returns every intermediate figure of the
 * calculation, so the UI can render the breakdown step by step and the rules can
 * be unit-tested in isolation.
 *
 * Scope (see README): permanent employee resident in Milan (Lombardy), no tax
 * credits and no contribution reliefs.
 *
 * Rounding happens only at display time. Every value returned here keeps full
 * floating-point precision, because rounding intermediate steps would make the
 * displayed figures inconsistent with each other (the parts would no longer add
 * up to the gross salary).
 */

/**
 * Upper limit of the first pensionable income bracket for 2026. Earnings above
 * it carry one extra percentage point of employee pension contribution.
 * Source: INPS circular no. 6/2026.
 */
const PENSION_CONTRIBUTION_CAP = 56_224;

/** Extra pension contribution rate applied above {@link PENSION_CONTRIBUTION_CAP}. */
const CONTRIBUTION_SURCHARGE_ABOVE_CAP = 0.01;

/** Default employee IVS (pension) contribution rate, as a percentage. */
export const DEFAULT_INPS_RATE = 9.19;

/** Milan municipal surtax rate, applied without brackets. */
const MUNICIPAL_SURTAX_RATE = 0.008;

/**
 * Taxable income at or below this threshold is fully exempt from the Milan
 * municipal surtax. Note this is an exemption, not an allowance: above the
 * threshold the rate applies to the *entire* taxable income, not just the excess.
 */
const MUNICIPAL_SURTAX_EXEMPTION_THRESHOLD = 23_000;

/**
 * A progressive tax band: {@link upperBound} is the income level at which the
 * band ends, {@link rate} the marginal rate applied inside it.
 */
interface TaxBand {
  /** Inclusive upper bound of the band, `Infinity` for the topmost one. */
  readonly upperBound: number;
  /** Marginal rate as a fraction, e.g. `0.23` for 23%. */
  readonly rate: number;
}

/** National income tax (IRPEF) bands for 2026. Source: art. 11 TUIR. */
const INCOME_TAX_BANDS: readonly TaxBand[] = [
  { upperBound: 28_000, rate: 0.23 },
  { upperBound: 50_000, rate: 0.33 },
  { upperBound: Infinity, rate: 0.43 },
];

/** Lombardy regional surtax bands, applied to the same taxable income as IRPEF. */
const REGIONAL_SURTAX_BANDS: readonly TaxBand[] = [
  { upperBound: 15_000, rate: 0.0123 },
  { upperBound: 28_000, rate: 0.0158 },
  { upperBound: 50_000, rate: 0.0172 },
  { upperBound: Infinity, rate: 0.0173 },
];

/** One band's contribution to a progressive tax, kept for the UI breakdown. */
export interface TaxBandBreakdown {
  /** Portion of taxable income falling inside this band. */
  readonly amount: number;
  /** Marginal rate of the band, as a fraction. */
  readonly rate: number;
  /** Tax due on this portion, i.e. `amount * rate`. */
  readonly tax: number;
  /** Lower bound of the band, used to label it in the UI. */
  readonly lowerBound: number;
  /** Upper bound of the band, `Infinity` for the topmost one. */
  readonly upperBound: number;
}

/** Pension contributions, split across the cap so the UI can show both rows. */
export interface ContributionBreakdown {
  /** Gross salary portion at or below {@link PENSION_CONTRIBUTION_CAP}. */
  readonly amountUpToCap: number;
  /** Gross salary portion above the cap; `0` when the salary stays below it. */
  readonly amountAboveCap: number;
  /** Contribution due on {@link amountUpToCap}. */
  readonly contributionUpToCap: number;
  /** Contribution due on {@link amountAboveCap}, at the surcharged rate. */
  readonly contributionAboveCap: number;
}

/** Every figure of a gross-to-net calculation, in euros, unrounded. */
export interface PayrollBreakdown {
  /** Gross annual salary the calculation started from. */
  readonly grossSalary: number;
  /** Employee pension (IVS) contribution rate used, as a fraction. */
  readonly contributionRate: number;
  /** Total employee pension contributions withheld. */
  readonly socialContributions: number;
  /** Split of {@link socialContributions} around the pensionable income cap. */
  readonly contributions: ContributionBreakdown;
  /** Income subject to IRPEF and surtaxes, i.e. gross salary less contributions. */
  readonly taxableIncome: number;
  /** Total national income tax due. */
  readonly incomeTax: number;
  /** Per-band detail of {@link incomeTax}, empty bands omitted. */
  readonly incomeTaxBands: readonly TaxBandBreakdown[];
  /** Total Lombardy regional surtax due. */
  readonly regionalSurtax: number;
  /** Per-band detail of {@link regionalSurtax}, empty bands omitted. */
  readonly regionalSurtaxBands: readonly TaxBandBreakdown[];
  /** Milan municipal surtax due; `0` below the exemption threshold. */
  readonly municipalSurtax: number;
  /** Contributions plus every tax, i.e. the whole gap between gross and net. */
  readonly totalDeductions: number;
  /** Net annual salary. */
  readonly netSalary: number;
  /** Top marginal IRPEF rate reached by {@link taxableIncome}, as a fraction. */
  readonly marginalTaxRate: number;
}

/**
 * Splits an income across progressive tax bands and taxes each slice at its own
 * rate. Bands that receive no income are omitted from the result.
 *
 * @param income - Income to split, in euros.
 * @param bands - Bands in ascending order of upper bound.
 * @returns The taxed slices, in the same order as `bands`.
 *
 * @example
 * // 31_783.5 of taxable income across the IRPEF bands yields two slices:
 * // 28_000 at 23% and 3_783.5 at 33%.
 * splitAcrossBands(31_783.5, INCOME_TAX_BANDS);
 */
function splitAcrossBands(income: number, bands: readonly TaxBand[]): TaxBandBreakdown[] {
  const slices: TaxBandBreakdown[] = [];
  let lowerBound = 0;

  for (const band of bands) {
    const amount = Math.max(0, Math.min(income, band.upperBound) - lowerBound);
    if (amount > 0) {
      slices.push({
        amount,
        rate: band.rate,
        tax: amount * band.rate,
        lowerBound,
        upperBound: band.upperBound,
      });
    }
    lowerBound = band.upperBound;
  }

  return slices;
}

/** Sums the tax due across a set of band slices. */
function sumTax(slices: readonly TaxBandBreakdown[]): number {
  return slices.reduce((total, slice) => total + slice.tax, 0);
}

/**
 * Computes employee pension contributions, which carry one extra percentage
 * point on the portion of salary above the pensionable income cap.
 *
 * @param grossSalary - Gross annual salary, in euros.
 * @param contributionRate - Base IVS rate as a fraction, e.g. `0.0919`.
 */
function computeContributions(
  grossSalary: number,
  contributionRate: number,
): ContributionBreakdown {
  const amountUpToCap = Math.min(grossSalary, PENSION_CONTRIBUTION_CAP);
  const amountAboveCap = Math.max(0, grossSalary - PENSION_CONTRIBUTION_CAP);

  return {
    amountUpToCap,
    amountAboveCap,
    contributionUpToCap: amountUpToCap * contributionRate,
    contributionAboveCap: amountAboveCap * (contributionRate + CONTRIBUTION_SURCHARGE_ABOVE_CAP),
  };
}

/**
 * Runs the full gross-to-net calculation.
 *
 * @param grossSalary - Gross annual salary (RAL), in euros.
 * @param inpsRatePercent - Employee IVS rate as a percentage, e.g. `9.19`.
 * @returns Every intermediate and final figure, unrounded.
 *
 * @example
 * const result = calculatePayroll(35_000);
 * result.socialContributions; // 3_216.5
 * result.taxableIncome;       // 31_783.5
 * result.netSalary;           // 23_385.70…
 */
export function calculatePayroll(
  grossSalary: number,
  inpsRatePercent: number = DEFAULT_INPS_RATE,
): PayrollBreakdown {
  const contributionRate = inpsRatePercent / 100;

  const contributions = computeContributions(grossSalary, contributionRate);
  const socialContributions =
    contributions.contributionUpToCap + contributions.contributionAboveCap;

  // Pension contributions are deductible: they never reach the tax base.
  const taxableIncome = Math.max(0, grossSalary - socialContributions);

  const incomeTaxBands = splitAcrossBands(taxableIncome, INCOME_TAX_BANDS);
  const incomeTax = sumTax(incomeTaxBands);

  const regionalSurtaxBands = splitAcrossBands(taxableIncome, REGIONAL_SURTAX_BANDS);
  const regionalSurtax = sumTax(regionalSurtaxBands);

  const municipalSurtax =
    taxableIncome > MUNICIPAL_SURTAX_EXEMPTION_THRESHOLD
      ? taxableIncome * MUNICIPAL_SURTAX_RATE
      : 0;

  const totalDeductions = socialContributions + incomeTax + regionalSurtax + municipalSurtax;

  return {
    grossSalary,
    contributionRate,
    socialContributions,
    contributions,
    taxableIncome,
    incomeTax,
    incomeTaxBands,
    regionalSurtax,
    regionalSurtaxBands,
    municipalSurtax,
    totalDeductions,
    netSalary: grossSalary - totalDeductions,
    marginalTaxRate: marginalRateFor(taxableIncome),
  };
}

/**
 * Returns the IRPEF rate that would apply to one more euro of income: the rate
 * of the highest band the income actually reaches.
 *
 * @param taxableIncome - Income subject to IRPEF, in euros.
 * @returns The marginal rate as a fraction, e.g. `0.33`.
 */
function marginalRateFor(taxableIncome: number): number {
  let marginalRate = INCOME_TAX_BANDS[0]?.rate ?? 0;

  for (const band of INCOME_TAX_BANDS) {
    if (taxableIncome > band.upperBound) continue;
    marginalRate = band.rate;
    break;
  }

  return marginalRate;
}

export {
  PENSION_CONTRIBUTION_CAP,
  MUNICIPAL_SURTAX_RATE,
  MUNICIPAL_SURTAX_EXEMPTION_THRESHOLD,
  CONTRIBUTION_SURCHARGE_ABOVE_CAP,
};
