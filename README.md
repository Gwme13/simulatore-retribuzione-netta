# Simulatore retribuzione netta annuale

Calcola la retribuzione netta annua di un lavoratore dipendente italiano a
partire dalla RAL, mostrando ogni passaggio del calcolo.

Demo: https://gwme13.github.io/simulatore-retribuzione-netta/

## Scenario coperto

- lavoratore dipendente a tempo indeterminato;
- residenza a Milano (Lombardia, ai fini dell'addizionale regionale);
- anno d'imposta 2026;
- nessuna detrazione e nessuna agevolazione contributiva;
- esclusi: altre regioni e comuni, detrazioni per lavoro dipendente e per
  carichi di famiglia, contratti a termine e part time, lavoro autonomo e
  partite IVA, TFR, premi di risultato, welfare aziendale, fringe benefit.

## Avvio in locale

Requisito: Node 18 o superiore.

```bash
npm install
npm run dev
```

L'applicazione risponde su http://localhost:5173/simulatore-retribuzione-netta/

```bash
npm test         # suite di test
npm run build    # controllo dei tipi e build di produzione in dist/
```

## Riferimenti normativi

- Scaglioni IRPEF 2026 (23%, 33%, 43%): art. 11 TUIR.
- Aliquota IVS a carico del dipendente e prima fascia di retribuzione
  pensionabile (56.224 euro), oltre la quale si applica un punto percentuale
  aggiuntivo: circolare INPS n. 6/2026.
- Addizionale regionale Lombardia: aliquote per scaglioni dall'1,23%
  all'1,73%.
- Addizionale comunale Milano: 0,80%, con esenzione totale fino a 23.000
  euro di imponibile.

## Licenza

MIT
