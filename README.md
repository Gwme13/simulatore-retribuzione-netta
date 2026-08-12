# Simulatore retribuzione netta annuale

Applicazione web che stima la retribuzione netta annuale di un lavoratore
dipendente italiano a partire dalla RAL, mostrando ogni passaggio del calcolo:
contributi previdenziali, reddito imponibile, IRPEF per scaglioni, addizionale
regionale e addizionale comunale.

Demo: https://gwme13.github.io/simulatore-retribuzione-netta/

## Perimetro del prototipo

Questo è un prototipo. Il calcolo non è generale: modella un profilo specifico,
scelto per poterlo implementare in modo completo anziché approssimare molti casi.

Il simulatore copre:

- lavoratore dipendente a tempo indeterminato;
- residente a Milano, quindi Lombardia per l'addizionale regionale;
- anno d'imposta 2026;
- nessuna detrazione e nessuna agevolazione contributiva.

Restano fuori dal perimetro: le altre regioni e gli altri comuni, le detrazioni
per lavoro dipendente e per carichi di famiglia, i contratti a termine e il
part time, il lavoro autonomo e le partite IVA, il TFR, i premi di risultato,
il welfare aziendale e i fringe benefit.

I risultati sono quindi una stima a scopo illustrativo e non sostituiscono una
busta paga. Al di fuori delle condizioni elencate sopra il valore restituito non
è attendibile.

## Funzionamento

La RAL si inserisce in tre modi: digitandola nel campo, trascinando lo slider
oppure scegliendo uno dei valori preimpostati. I risultati si aggiornano mentre
si digita, senza un pulsante di conferma: il calcolo è locale e istantaneo, e
vedere i valori cambiare in tempo reale è parte dello scopo dello strumento.

Se il valore inserito non è valido, l'applicazione mostra un messaggio di errore
ma mantiene a schermo i risultati dell'ultima RAL valida, in modo che la pagina
non si svuoti mentre si sta ancora scrivendo.

Il selettore delle mensilità (12, 13 o 14) modifica soltanto la ripartizione del
netto nell'arco dell'anno. Il netto annuo resta invariato: la tredicesima non è
una somma aggiuntiva, ma lo stesso importo distribuito su più rate.

Ogni passaggio del calcolo ha un'icona informativa che spiega la regola
applicata. Il tooltip si apre al passaggio del mouse, al tocco su dispositivi
touch e quando l'icona riceve il focus da tastiera.

## Avvio in locale

Requisito: Node 18 o superiore.

```bash
npm install
npm run dev
```

L'applicazione risponde su http://localhost:5173/simulatore-retribuzione-netta/

Altri comandi disponibili:

```bash
npm test         # esegue la suite di test
npm run build    # controllo dei tipi e build di produzione in dist/
npm run preview  # serve la build, utile per verificarla prima della pubblicazione
```

## Struttura del progetto

```
src/
  App.tsx                 stato della pagina e composizione dei componenti
  components/             componenti presentazionali, privi di logica di calcolo
  lib/
    payroll.ts            calcolo fiscale, puro e indipendente da React
    format.ts             formattazione italiana di importi, aliquote e percentuali
    validation.ts         validazione dell'importo inserito
  content/
    labels.ts             testi dell'interfaccia
    breakdown.ts          costruisce i cinque passaggi a partire dal calcolo
  styles/
    tokens.ts             colori, tipografia e stili ricorrenti
    global.css            reset, slider, stati di hover e focus
```

I file di test affiancano i moduli che verificano, con il suffisso `.test.ts`.

## Scelte tecniche

**Logica fiscale separata dall'interfaccia.** Il modulo `lib/payroll.ts` non
importa React e non conosce il formato con cui i valori saranno presentati:
riceve una RAL e restituisce tutti i valori intermedi. È la parte che deve essere
corretta, ed è quella coperta dai test in modo esaustivo, inclusi i casi limite
come la soglia contributiva dei 56.224 euro e l'esenzione comunale sotto i
23.000 euro di imponibile.

**Nessun arrotondamento intermedio.** Il calcolo procede in virgola mobile e
l'arrotondamento avviene soltanto in fase di visualizzazione. Arrotondare a ogni
passaggio comporterebbe che le singole voci non sommino più esattamente alla RAL;
un test verifica proprio questa invariante su un intervallo di valori.

**Codice in inglese, interfaccia in italiano.** I testi visibili all'utente sono
raccolti in `src/content/`, non distribuiti nei componenti: possono essere riletti
tutti insieme senza aprire un file JSX, e un'eventuale traduzione toccherebbe una
sola cartella.

**Marcatura semantica e accessibilità.** I cinque passaggi sono una lista
ordinata, il dettaglio degli scaglioni una lista di definizioni, i valori
calcolati elementi `output`. Il selettore delle mensilità è un radiogroup con
roving tabindex e navigazione a frecce. Tutti i controlli sono raggiungibili da
tastiera con indicatore di focus visibile.

**Nessuna media query.** Il layout si adatta tramite `flex-wrap`, `clamp()` e
`repeat(auto-fit, minmax(...))`. Le colonne si impilano e le griglie si
ridistribuiscono autonomamente, senza breakpoint da mantenere allineati.

**Nessuna libreria esterna oltre allo stretto necessario:** React, TypeScript,
Vite e Vitest.

## Verifiche eseguite

La suite unitaria conta 67 test su calcolo, formattazione, validazione e
generazione dei testi. A questi si aggiunge una verifica funzionale sul browser
che copre lo stato iniziale, i tre casi di errore di validazione, il
comportamento sopra la soglia contributiva, gli scaglioni superiori, l'esenzione
comunale, il tooltip, il cambio di mensilità, i valori preimpostati, il limite
dello slider, il layout a 390 pixel di larghezza e la navigazione da tastiera.

## Riferimenti normativi

- Scaglioni IRPEF 2026 (23%, 33%, 43%): art. 11 TUIR.
- Aliquota IVS a carico del dipendente e prima fascia di retribuzione
  pensionabile, pari a 56.224 euro, oltre la quale si applica un punto
  percentuale aggiuntivo: circolare INPS n. 6/2026.
- Addizionale regionale Lombardia: aliquote per scaglioni dall'1,23% all'1,73%.
- Addizionale comunale Milano: 0,80%, con esenzione totale fino a 23.000 euro di
  imponibile.

L'aliquota contributiva è esposta come parametro del componente radice
(`inpsRate`, valore predefinito 9,19). Modificandola si aggiornano sia il calcolo
sia i testi che la citano.

## Sviluppi possibili

L'estensione più utile sono le detrazioni per lavoro dipendente, che incidono in
modo significativo sulle RAL più basse. A seguire, la scelta di regione e comune:
i due campi sono oggi bloccati proprio per rendere esplicito il perimetro, ma la
struttura del calcolo per scaglioni è già generica e servirebbe soltanto una
tabella di aliquote.
