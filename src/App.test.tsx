import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { App } from './App';

/**
 * Renders the page to static markup and strips the tags, leaving the text a
 * reader would see. Enough to assert that the figures and the copy reach the
 * screen, without pulling a DOM implementation into the test setup.
 */
function renderPageText(): string {
  return renderToStaticMarkup(<App />)
    .replace(/<[^>]+>/g, '\n')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

describe('App', () => {
  const text = renderPageText();

  it('opens on the default simulation of a 35.000 € gross salary', () => {
    expect(text).toContain('Simulatore retribuzione netta annuale');
    expect(text).toContain('RAL € 35.000');
  });

  it('shows the headline figures', () => {
    expect(text).toContain('Netto annuo');
    expect(text).toContain('€ 23.386');
    expect(text).toContain('Totale trattenute');
    expect(text).toContain('€ 11.614');
  });

  it('splits the yearly net over the selected 13 pay periods', () => {
    expect(text).toContain('Netto mensile × 13');
    expect(text).toContain('€ 1.799');
    expect(text).toContain('12 rate + tredicesima');
  });

  it('renders all five steps of the breakdown with their formulas', () => {
    expect(text).toContain('€ 35.000 × 9,19% = € 3.217');
    expect(text).toContain('€ 35.000 − € 3.217 di contributi = € 31.784');
    expect(text).toContain('Aliquota marginale 33%, media effettiva 24,2% = € 7.689');
    expect(text).toContain("prelievo pari all'1,4% dell'imponibile = € 455");
    expect(text).toContain('€ 31.784 × 0,80% = € 254');
    expect(text).toContain('€ 35.000 − € 11.614 di contributi e imposte');
  });

  it('states the assumptions, quoting the contribution rate actually used', () => {
    expect(text).toContain("Anno d'imposta 2026");
    expect(text).toContain('contributi IVS (9,19% a carico del dipendente');
  });

  it('interpolates a custom contribution rate into the copy and the figures', () => {
    const customRateText = renderToStaticMarkup(<App inpsRate={10} />).replace(/&#x27;/g, "'");

    expect(customRateText).toContain('€ 35.000 × 10,00% = € 3.500');
    expect(customRateText).toContain('contributi IVS (10,00% a carico del dipendente');
  });
});
