import { describe, expect, it } from 'vitest';

import { formatCurrency } from './format';
import {
  calculatePayroll,
  MUNICIPAL_SURTAX_EXEMPTION_THRESHOLD,
  PENSION_CONTRIBUTION_CAP,
} from './payroll';

/**
 * Reference figures come from the design handoff, which states the expected
 * output for a 35.000 € gross salary at the default 9,19% contribution rate.
 * They are compared as displayed, i.e. rounded to whole euros.
 */
describe('calculatePayroll', () => {
  describe('reference case: 35.000 € gross', () => {
    const result = calculatePayroll(35_000);

    it('matches every published figure once rounded for display', () => {
      expect(formatCurrency(result.socialContributions)).toBe('€ 3.217');
      expect(formatCurrency(result.taxableIncome)).toBe('€ 31.784');
      expect(formatCurrency(result.incomeTax)).toBe('€ 7.689');
      expect(formatCurrency(result.regionalSurtax)).toBe('€ 455');
      expect(formatCurrency(result.municipalSurtax)).toBe('€ 254');
      expect(formatCurrency(result.netSalary)).toBe('€ 23.386');
    });

    it('keeps full precision internally, without intermediate rounding', () => {
      expect(result.socialContributions).toBeCloseTo(3_216.5, 6);
      expect(result.taxableIncome).toBeCloseTo(31_783.5, 6);
      expect(result.netSalary).toBeCloseTo(23_385.701, 3);
    });

    it('taxes each band at its own rate rather than applying a single one', () => {
      expect(result.incomeTaxBands).toHaveLength(2);
      expect(result.incomeTaxBands[0]).toMatchObject({ amount: 28_000, rate: 0.23 });
      expect(result.incomeTaxBands[1]?.rate).toBe(0.33);
      expect(result.marginalTaxRate).toBe(0.33);
    });
  });

  describe('municipal surtax exemption', () => {
    it('charges nothing when taxable income stays under the threshold', () => {
      const result = calculatePayroll(20_000);

      expect(result.taxableIncome).toBeLessThan(MUNICIPAL_SURTAX_EXEMPTION_THRESHOLD);
      expect(result.municipalSurtax).toBe(0);
    });

    it('applies the rate to the whole taxable income once above the threshold', () => {
      const result = calculatePayroll(35_000);

      // An allowance would tax only the excess; the exemption taxes everything.
      expect(result.municipalSurtax).toBeCloseTo(result.taxableIncome * 0.008, 6);
    });
  });

  describe('pension contribution surcharge above the cap', () => {
    it('uses a single band when the salary stays under the cap', () => {
      const result = calculatePayroll(35_000);

      expect(result.contributions.amountAboveCap).toBe(0);
      expect(result.contributions.contributionAboveCap).toBe(0);
    });

    it('adds one percentage point on the portion above the cap', () => {
      const result = calculatePayroll(80_000);
      const { contributions } = result;

      expect(contributions.amountUpToCap).toBe(PENSION_CONTRIBUTION_CAP);
      expect(contributions.amountAboveCap).toBe(80_000 - PENSION_CONTRIBUTION_CAP);
      expect(contributions.contributionUpToCap).toBeCloseTo(
        PENSION_CONTRIBUTION_CAP * 0.0919,
        6,
      );
      expect(contributions.contributionAboveCap).toBeCloseTo(
        (80_000 - PENSION_CONTRIBUTION_CAP) * 0.1019,
        6,
      );
    });
  });

  describe('top bands', () => {
    const result = calculatePayroll(150_000);

    it('reaches the 43% income tax band', () => {
      expect(result.marginalTaxRate).toBe(0.43);

      const topBand = result.incomeTaxBands.at(-1);
      expect(topBand?.rate).toBe(0.43);
      expect(topBand?.lowerBound).toBe(50_000);
      expect(topBand?.upperBound).toBe(Infinity);
    });

    it('reaches the 1,73% regional surtax band', () => {
      expect(result.regionalSurtaxBands.at(-1)?.rate).toBe(0.0173);
      expect(result.regionalSurtaxBands).toHaveLength(4);
    });
  });

  describe('invariants', () => {
    const grossSalaries = [8_000, 20_000, 35_000, 55_000, 56_224, 80_000, 150_000, 1_000_000];

    it.each(grossSalaries)('net + deductions equals the gross salary (%i €)', (gross) => {
      const result = calculatePayroll(gross);
      const parts =
        result.netSalary +
        result.socialContributions +
        result.incomeTax +
        result.regionalSurtax +
        result.municipalSurtax;

      expect(parts).toBeCloseTo(gross, 6);
    });

    it.each(grossSalaries)('never produces a negative figure (%i €)', (gross) => {
      const result = calculatePayroll(gross);

      expect(result.netSalary).toBeGreaterThan(0);
      expect(result.taxableIncome).toBeGreaterThanOrEqual(0);
      expect(result.municipalSurtax).toBeGreaterThanOrEqual(0);
    });
  });

  describe('configurable contribution rate', () => {
    it('feeds the custom rate through the whole calculation', () => {
      const result = calculatePayroll(35_000, 10);

      expect(result.contributionRate).toBe(0.1);
      expect(result.socialContributions).toBeCloseTo(3_500, 6);
      expect(result.taxableIncome).toBeCloseTo(31_500, 6);
    });
  });
});
