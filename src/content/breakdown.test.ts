import { describe, expect, it } from 'vitest';

import { calculatePayroll } from '../lib/payroll';
import { articleFor, buildBreakdownSteps, buildNetSalaryFormula } from './breakdown';

/** Convenience helper: the five steps for a given gross salary. */
function stepsFor(grossSalary: number) {
  return buildBreakdownSteps(calculatePayroll(grossSalary));
}

describe('buildBreakdownSteps', () => {
  it('always produces the five steps, in order', () => {
    expect(stepsFor(35_000).map((step) => step.id)).toEqual(['1', '2', '3', '4', '5']);
  });

  describe('step 1: pension contributions', () => {
    it('shows a single row when the salary stays under the cap', () => {
      const [step] = stepsFor(35_000);

      expect(step?.rows).toEqual([
        { description: '€ 35.000 di RAL', rate: '9,19%', amount: '€ 3.217' },
      ]);
      expect(step?.formula).toBe('€ 35.000 × 9,19% = € 3.217');
    });

    it('splits into two rows above the cap, the second surcharged by one point', () => {
      const [step] = stepsFor(80_000);

      expect(step?.rows).toHaveLength(2);
      expect(step?.rows[0]?.description).toBe('€ 56.224 fino a € 56.224');
      expect(step?.rows[0]?.rate).toBe('9,19%');
      expect(step?.rows[1]?.description).toBe('€ 23.776 oltre € 56.224');
      expect(step?.rows[1]?.rate).toBe('10,19%');
      expect(step?.formula).toMatch(
        /^Aliquota IVS 9,19%, maggiorata di 1 punto oltre € 56\.224 = /,
      );
    });
  });

  describe('step 3: income tax', () => {
    it('labels each band with its own range and rate', () => {
      const step = stepsFor(35_000)[2];

      expect(step?.rows).toEqual([
        { description: '€ 28.000 nella fascia 0–28k', rate: '23%', amount: '€ 6.440' },
        { description: '€ 3.784 nella fascia 28–50k', rate: '33%', amount: '€ 1.249' },
      ]);
    });

    it('reaches the top band, described as "oltre 50.000"', () => {
      const step = stepsFor(150_000)[2];
      const topRow = step?.rows.at(-1);

      expect(topRow?.rate).toBe('43%');
      expect(topRow?.description).toMatch(/oltre 50\.000$/);
    });
  });

  describe('step 4: regional surtax', () => {
    it("elides the article before percentages starting with 1", () => {
      const step = stepsFor(35_000)[3];

      // 1,4% reads "uno virgola quattro", so the article elides.
      expect(step?.formula).toContain("pari all'1,4% dell'imponibile");
      expect(step?.info).toContain("equivale all'1,4% dell'imponibile");
    });

    it('stays elided across the whole salary range, as Lombardy rates always start with 1', () => {
      for (const grossSalary of [8_000, 35_000, 150_000, 1_000_000]) {
        expect(stepsFor(grossSalary)[3]?.formula).toContain("pari all'1,");
      }
    });

    it('reaches the 1,73% band on high salaries', () => {
      const step = stepsFor(150_000)[3];

      expect(step?.rows).toHaveLength(4);
      expect(step?.rows.at(-1)?.rate).toBe('1,73%');
    });
  });

  describe('step 5: municipal surtax', () => {
    it('states the exemption instead of a formula when nothing is due', () => {
      const step = stepsFor(20_000)[4];

      expect(step?.formula).toBe('Imponibile sotto la soglia di esenzione: nessun prelievo.');
      expect(step?.valueTone).toBe('muted');
      expect(step?.value).toBe('− € 0');
    });

    it('shows the multiplication once above the threshold', () => {
      const step = stepsFor(35_000)[4];

      expect(step?.formula).toBe('€ 31.784 × 0,80% = € 254');
      expect(step?.valueTone).toBe('deducted');
    });
  });

  it('marks the taxable base as carried forward rather than deducted', () => {
    const step = stepsFor(35_000)[1];

    expect(step?.valueTone).toBe('neutral');
    expect(step?.value).toBe('€ 31.784');
  });
});

describe('articleFor', () => {
  it.each(['1,4%', '1,73%', '8,0%'])('elides before %s, which reads as a vowel', (rate) => {
    expect(articleFor(rate)).toBe("all'");
  });

  it.each(['2,0%', '3,5%', '9,19%'])('keeps the article separate before %s', (rate) => {
    expect(articleFor(rate)).toBe('al ');
  });
});

describe('buildNetSalaryFormula', () => {
  it('states the gross salary less everything withheld', () => {
    expect(buildNetSalaryFormula(calculatePayroll(35_000))).toBe(
      '€ 35.000 − € 11.614 di contributi e imposte',
    );
  });
});
