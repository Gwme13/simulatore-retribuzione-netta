/**
 * Every fixed Italian string shown in the UI.
 *
 * The codebase is written in English; user-facing copy is not. Keeping it in one
 * place means a component never hard-codes a sentence, the wording can be
 * reviewed without reading JSX, and translating the app later would touch this
 * folder only.
 */

/** Supported numbers of pay periods per year. */
export const PAY_PERIOD_OPTIONS = [12, 13, 14] as const;

/** A number of yearly pay periods: 12 monthly salaries, plus optional extras. */
export type PayPeriods = (typeof PAY_PERIOD_OPTIONS)[number];

/** Gross salary shortcuts offered under the input field, in euros. */
export const SALARY_PRESETS = [20_000, 35_000, 55_000, 80_000, 150_000] as const;

/** Bounds of the gross salary slider, in euros. */
export const SLIDER_RANGE = { min: 8_000, max: 250_000, step: 500 } as const;

/** Bounds accepted by the text field, wider than the slider's. */
export const INPUT_RANGE = { min: 8_000, max: 1_000_000 } as const;

export const PAGE = {
  title: 'Simulatore retribuzione netta annuale',
  subtitle:
    'Dalla retribuzione annua lorda al netto in busta paga, passaggio per passaggio.',
  assumptionsAnchor: 'ipotesi',
} as const;

export const INPUT_PANEL = {
  grossSalaryLabel: 'Retribuzione annua lorda (RAL)',
  currencySymbol: '€',
  perYearSuffix: '/ anno',
  sliderMinLabel: '8.000',
  sliderMaxLabel: '250.000',
  sliderAccessibleLabel: 'Retribuzione annua lorda',
  payPeriodsLabel: 'Mensilità',
  regionLabel: 'Regione',
  regionValue: 'Lombardia',
  municipalityLabel: 'Comune',
  municipalityValue: 'Milano',
} as const;

/** Validation messages, in the order the original prototype checks them. */
export const VALIDATION_MESSAGES = {
  notANumber: 'Inserisci una RAL valida.',
  belowMinimum: 'RAL minima simulabile: € 8.000 (sotto la soglia di un full-time CCNL).',
  aboveMaximum: 'RAL massima simulabile: € 1.000.000.',
} as const;

export const SUMMARY_PANEL = {
  netSalaryEyebrow: 'Netto annuo',
  netPerPeriodEyebrow: 'Netto mensile',
  totalDeductionsEyebrow: 'Totale trattenute',
  ofGrossSuffix: 'della RAL',
  chartCaption: 'Composizione della RAL',
} as const;

/** Caption under the monthly KPI, which depends on the selected pay periods. */
export const PAY_PERIOD_NOTES: Record<PayPeriods, string> = {
  12: '12 rate uguali',
  13: '12 rate + tredicesima',
  14: '12 rate + 13ª e 14ª',
};

/** Caption inside the three pay-period cards at the bottom of the page. */
export const PAY_PERIOD_CARD_NOTES: Record<PayPeriods, string> = {
  12: 'netto medio mensile',
  13: 'con tredicesima',
  14: 'con tredicesima e quattordicesima',
};

/** Labels of the four segments of the composition bar. */
export const CHART_SEGMENT_LABELS = {
  net: 'Netto',
  contributions: 'Contributi INPS',
  incomeTax: 'IRPEF',
  surtaxes: 'Addizionali',
} as const;

export const BREAKDOWN_PANEL = {
  heading: 'Il calcolo, passo per passo',
  grossPrefix: 'RAL',
  totalTitle: 'Retribuzione netta annua',
  totalBadge: '=',
  infoIconLabel: 'Maggiori informazioni',
} as const;

/**
 * Builds the methodology footnote. The contribution rate is interpolated so the
 * note stays truthful when the rate is configured to something other than 9,19%.
 *
 * @param formattedContributionRate - Rate already formatted, e.g. `"9,19%"`.
 */
export function buildMethodologyNote(formattedContributionRate: string): string {
  return (
    `Anno d'imposta 2026. Lavoratore dipendente a tempo indeterminato residente a ` +
    `Milano, senza agevolazioni contributive né detrazioni: sono considerati solo ` +
    `contributi IVS (${formattedContributionRate} a carico del dipendente, +1% oltre ` +
    `€ 56.224), IRPEF (23% / 33% / 43%) e addizionali regionale Lombardia ` +
    `(1,23%–1,73%) e comunale Milano (0,80%, esente fino a € 23.000). Esclusi TFR, ` +
    `premi di risultato, welfare e fringe benefit. Fonti: art. 11 TUIR, circolare ` +
    `INPS n. 6/2026.`
  );
}
