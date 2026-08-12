/**
 * Turns a {@link PayrollBreakdown} into the five explanatory steps rendered by
 * the "Il calcolo, passo per passo" panel.
 *
 * This is where numbers become sentences. Keeping it out of the components means
 * the copy (formulas, tooltips, band descriptions) can be read and reviewed in
 * one file, and the components stay purely presentational.
 */

import {
  formatCurrency,
  formatFractionAsRate,
  formatShare,
  formatWholeRate,
} from '../lib/format';
import type { PayrollBreakdown, TaxBandBreakdown } from '../lib/payroll';
import { PENSION_CONTRIBUTION_CAP } from '../lib/payroll';

/** Visual family of a step, mapped to colours in `styles/tokens.ts`. */
export type StepTone = 'contribution' | 'taxBase' | 'tax' | 'local';

/** How a step's headline amount should be coloured. */
export type StepValueTone = 'deducted' | 'neutral' | 'muted';

/** One row of the indented band detail shown under a formula. */
export interface BreakdownDetailRow {
  /** Portion of income the row covers, e.g. `"€ 28.000 nella fascia 0–28k"`. */
  readonly description: string;
  /** Rate applied to that portion, e.g. `"23%"`. */
  readonly rate: string;
  /** Resulting amount, e.g. `"€ 6.440"`. */
  readonly amount: string;
}

/** A fully rendered step of the calculation, ready to display. */
export interface BreakdownStepView {
  /** Stable identifier, also shown in the numbered badge. */
  readonly id: string;
  readonly title: string;
  /** Short category tag shown next to the title. */
  readonly tag: string;
  readonly tone: StepTone;
  /** One-line formula summarising the step. */
  readonly formula: string;
  /** Tooltip text explaining the rule behind the step. */
  readonly info: string;
  /** Band detail; empty when the step has no brackets. */
  readonly rows: readonly BreakdownDetailRow[];
  /** Headline amount, already signed and formatted. */
  readonly value: string;
  readonly valueTone: StepValueTone;
  /** Weight of the step on the gross salary, e.g. `"9,2% della RAL"`. */
  readonly share: string;
}

/** Suffix appended to every step's percentage. */
const OF_GROSS = 'della RAL';

/**
 * Describes the slice of income a band covers, matching the reference wording:
 * bounded bands read `"nella fascia 0–28k"`, the topmost one `"oltre 50.000"`.
 */
function describeBand(band: TaxBandBreakdown): string {
  const amount = formatCurrency(band.amount);

  if (band.upperBound === Infinity) {
    return `${amount} oltre ${band.lowerBound.toLocaleString('it-IT')}`;
  }

  return `${amount} nella fascia ${band.lowerBound / 1000}–${band.upperBound / 1000}k`;
}

/** Renders income tax bands, whose rates are always whole percentages. */
function toIncomeTaxRows(bands: readonly TaxBandBreakdown[]): BreakdownDetailRow[] {
  return bands.map((band) => ({
    description: describeBand(band),
    rate: formatWholeRate(band.rate * 100),
    amount: formatCurrency(band.tax),
  }));
}

/** Renders regional surtax bands, whose rates carry two decimals. */
function toRegionalSurtaxRows(bands: readonly TaxBandBreakdown[]): BreakdownDetailRow[] {
  return bands.map((band) => ({
    description: describeBand(band),
    rate: formatFractionAsRate(band.rate),
    amount: formatCurrency(band.tax),
  }));
}

/**
 * Picks the right form of the Italian article before a percentage: `all'` elides
 * before a vowel sound, which for spoken numbers means percentages starting with
 * 1 ("uno") or 8 ("otto"); everything else takes `al `.
 *
 * @param formattedPercentage - Percentage as displayed, e.g. `"1,4%"`.
 * @returns `"all'"` or `"al "`, ready to be concatenated.
 *
 * Note that with Lombardy's current bands the effective rate always falls
 * between 1,23% and 1,73%, so in this app only the elided form is ever produced.
 * The rule is kept general because the rate is data, not a constant.
 *
 * @example
 * articleFor('1,4%'); // "all'"  → "pari all'1,4%"
 * articleFor('2,0%'); // "al "   → "pari al 2,0%"
 */
export function articleFor(formattedPercentage: string): string {
  return /^[18]/.test(formattedPercentage) ? "all'" : 'al ';
}

/** Builds step 1: employee pension contributions. */
function buildContributionsStep(result: PayrollBreakdown): BreakdownStepView {
  const { contributions, contributionRate, grossSalary, socialContributions } = result;
  const baseRate = formatFractionAsRate(contributionRate);
  const cappedAmount = formatCurrency(PENSION_CONTRIBUTION_CAP);
  const exceedsCap = contributions.amountAboveCap > 0;

  const rows: BreakdownDetailRow[] = exceedsCap
    ? [
        {
          description: `${formatCurrency(contributions.amountUpToCap)} fino a ${cappedAmount}`,
          rate: baseRate,
          amount: formatCurrency(contributions.contributionUpToCap),
        },
        {
          description: `${formatCurrency(contributions.amountAboveCap)} oltre ${cappedAmount}`,
          rate: formatFractionAsRate(contributionRate + 0.01),
          amount: formatCurrency(contributions.contributionAboveCap),
        },
      ]
    : [
        {
          description: `${formatCurrency(grossSalary)} di RAL`,
          rate: baseRate,
          amount: formatCurrency(socialContributions),
        },
      ];

  return {
    id: '1',
    title: 'Contributi previdenziali trattenuti in busta paga',
    tag: 'Contributi INPS',
    tone: 'contribution',
    formula: exceedsCap
      ? `Aliquota IVS ${baseRate}, maggiorata di 1 punto oltre ${cappedAmount} = ${formatCurrency(socialContributions)}`
      : `${formatCurrency(grossSalary)} × ${baseRate} = ${formatCurrency(socialContributions)}`,
    info:
      `L'IVS (invalidità, vecchiaia e superstiti) è il contributo pensionistico ` +
      `versato all'INPS. L'aliquota complessiva è il 33% della retribuzione: ` +
      `${baseRate} è trattenuto al dipendente, il resto è a carico del datore di ` +
      `lavoro. Sulla quota di RAL che supera la prima fascia di retribuzione ` +
      `pensionabile (${cappedAmount} per il 2026) si aggiunge 1 punto percentuale.`,
    rows,
    value: `− ${formatCurrency(socialContributions)}`,
    valueTone: 'deducted',
    share: `${formatShare(socialContributions, grossSalary)} ${OF_GROSS}`,
  };
}

/** Builds step 2: the taxable base left once contributions are deducted. */
function buildTaxableIncomeStep(result: PayrollBreakdown): BreakdownStepView {
  const { grossSalary, socialContributions, taxableIncome } = result;

  return {
    id: '2',
    title: 'Reddito imponibile ai fini fiscali',
    tag: 'Base imponibile',
    tone: 'taxBase',
    formula: `${formatCurrency(grossSalary)} − ${formatCurrency(socialContributions)} di contributi = ${formatCurrency(taxableIncome)}`,
    info:
      `I contributi previdenziali sono un onere deducibile: si sottraggono dalla ` +
      `RAL e non concorrono a formare reddito tassabile. La differenza è ` +
      `l'imponibile fiscale, la base su cui si calcolano IRPEF e addizionali ` +
      `regionale e comunale.`,
    rows: [],
    // Not a deduction but the base carried forward, hence the neutral colour.
    value: formatCurrency(taxableIncome),
    valueTone: 'neutral',
    share: `${formatShare(taxableIncome, grossSalary)} ${OF_GROSS}`,
  };
}

/** Builds step 3: national income tax, band by band. */
function buildIncomeTaxStep(result: PayrollBreakdown): BreakdownStepView {
  const { grossSalary, incomeTax, incomeTaxBands, marginalTaxRate, taxableIncome } = result;
  const marginal = formatWholeRate(marginalTaxRate * 100);
  const effective = formatShare(incomeTax, taxableIncome);

  return {
    id: '3',
    title: 'IRPEF per scaglioni di reddito',
    tag: 'Imposta sul reddito',
    tone: 'tax',
    formula: `Aliquota marginale ${marginal}, media effettiva ${effective} = ${formatCurrency(incomeTax)}`,
    info:
      `L'imponibile è suddiviso in scaglioni e ogni quota è tassata con la propria ` +
      `aliquota. L'aliquota marginale (${marginal}) è quella applicata all'ultimo ` +
      `euro di reddito: è la percentuale che verrebbe trattenuta su un eventuale ` +
      `aumento. L'aliquota media effettiva (${effective}) è il rapporto tra IRPEF ` +
      `totale e imponibile, e resta sempre inferiore alla marginale.`,
    rows: toIncomeTaxRows(incomeTaxBands),
    value: `− ${formatCurrency(incomeTax)}`,
    valueTone: 'deducted',
    share: `${formatShare(incomeTax, grossSalary)} ${OF_GROSS}`,
  };
}

/** Builds step 4: the Lombardy regional surtax. */
function buildRegionalSurtaxStep(result: PayrollBreakdown): BreakdownStepView {
  const { grossSalary, regionalSurtax, regionalSurtaxBands, taxableIncome } = result;
  const effective = formatShare(regionalSurtax, taxableIncome);
  const article = articleFor(effective);

  return {
    id: '4',
    title: 'Addizionale regionale della Lombardia',
    tag: 'Tributo regionale',
    tone: 'local',
    formula: `Aliquote per scaglioni, prelievo pari ${article}${effective} dell'imponibile = ${formatCurrency(regionalSurtax)}`,
    info:
      `L'addizionale regionale è un'imposta che ogni Regione applica sullo stesso ` +
      `imponibile IRPEF. La Lombardia adotta aliquote crescenti per scaglioni, ` +
      `dall'1,23% all'1,73%. Il prelievo risultante equivale ${article}${effective} ` +
      `dell'imponibile complessivo.`,
    rows: toRegionalSurtaxRows(regionalSurtaxBands),
    value: `− ${formatCurrency(regionalSurtax)}`,
    valueTone: 'deducted',
    share: `${formatShare(regionalSurtax, grossSalary)} ${OF_GROSS}`,
  };
}

/** Builds step 5: the Milan municipal surtax, with its exemption. */
function buildMunicipalSurtaxStep(result: PayrollBreakdown): BreakdownStepView {
  const { grossSalary, municipalSurtax, taxableIncome } = result;
  const isExempt = municipalSurtax === 0;

  return {
    id: '5',
    title: 'Addizionale comunale del Comune di Milano',
    tag: 'Tributo comunale',
    tone: 'local',
    formula: isExempt
      ? 'Imponibile sotto la soglia di esenzione: nessun prelievo.'
      : `${formatCurrency(taxableIncome)} × 0,80% = ${formatCurrency(municipalSurtax)}`,
    info:
      `L'addizionale comunale è deliberata dal singolo Comune sullo stesso ` +
      `imponibile IRPEF. Milano applica un'unica aliquota dello 0,80%, senza ` +
      `scaglioni, ed esenta integralmente gli imponibili fino a € 23.000.`,
    rows: [],
    value: `− ${formatCurrency(municipalSurtax)}`,
    valueTone: isExempt ? 'muted' : 'deducted',
    share: `${formatShare(municipalSurtax, grossSalary)} ${OF_GROSS}`,
  };
}

/**
 * Builds the five steps of the breakdown, in display order.
 *
 * @param result - Output of `calculatePayroll`.
 * @returns The steps, ready to render.
 */
export function buildBreakdownSteps(result: PayrollBreakdown): BreakdownStepView[] {
  return [
    buildContributionsStep(result),
    buildTaxableIncomeStep(result),
    buildIncomeTaxStep(result),
    buildRegionalSurtaxStep(result),
    buildMunicipalSurtaxStep(result),
  ];
}

/**
 * Builds the sentence under the grand total, e.g.
 * `"€ 35.000 − € 11.614 di contributi e imposte"`.
 */
export function buildNetSalaryFormula(result: PayrollBreakdown): string {
  return `${formatCurrency(result.grossSalary)} − ${formatCurrency(result.totalDeductions)} di contributi e imposte`;
}
