# 🎰 Ruota della Fortuna — Casino Slot Edition

Un'applicazione web moderna, spettacolare e reattiva realizzata in **Angular**, progettata per sostituire i tradizionali sorteggi online e generatori casuali con un'esperienza coinvolgente in pieno stile **Las Vegas Casino & Slot Machine**.

---

## ✨ Funzionalità Principali

### 1. 🎯 Definizione Personalizzata delle Voci
- **Aggiunta e rimozione rapida**: Aggiungi nuove voci con colorazione automatica vibrante ispirata ai tavoli da casinò.
- **Attivazione / Disattivazione selettiva**: Puoi disattivare temporaneamente una voce dalla ruota tramite checkbox senza doverla eliminare.
- **Modifica in blocco (Bulk Edit)**: Incolla o modifica decine di voci contemporaneamente da una textarea.
- **Mischia Voci (Shuffle)**: Riorganizza casualmente l'ordine delle voci sulla ruota.
- **Preset Immediati**:
  - 🎰 *Casinò VIP Jackpot* (Premi slot machine)
  - 🍕 *Cosa Mangiamo Stasera?* (Pizza, Sushi, Burger, ecc.)
  - 🔢 *Numeri 1-12* (Sorteggio numerico)
  - 🎉 *Party & Penitenze* (Giochi divertenti per serate e feste)
  - 🔮 *Oracolo delle Decisioni* (Sì, No, Forse...)

### 2. 🔗 Salvataggio e Condivisione tramite Link
- **Stato codificato nell'URL**: Ogni personalizzazione (titolo, voci, voci attive/escluse, forza di lancio, opzione di esclusione) viene sincronizzata nell'URL hash (`#ruota=...`).
- **Pulsante "Salva / Condividi Link"**: Copia con un clic negli appunti l'URL condivisibile per salvare la ruota nei preferiti o inviarla ad amici e colleghi.
- Chiunque apra il link troverà esattamente la ruota configurata, pronta all'uso!

### 3. ❌ Esclusione delle Voci Estratte
- **Opzione "Esclusione Automatica"**: Attivabile tramite interruttore a levetta neon; esclude automaticamente il vincitore dai giri successivi.
- **Finestra Vincitore Interattiva**: Quando la ruota si ferma su una voce, puoi scegliere immediatamente tra:
  - ❌ *Escludi questa voce* (la voce viene barrata e rimossa dalle prossime estrazioni).
  - 🎲 *Gira ancora* (mantiene la voce ed effettua un nuovo giro).
  - *Chiudi*.
- **Registro Estrazioni (Cronologia)**: Consulta tutte le vincite precedenti con timestamp e indicazione dello stato.
- **Pulsante "Ripristina Tutte"**: Consente di reintegrare istantaneamente tutte le voci escluse con un solo clic.

### 4. 🎰 Leva Slot Machine con Forza Dinamica a Trascinamento (Drag-to-Spin)
- **Tiro Continuo e Flessibile**: I bottoni statici sono stati rimossi in favore di una vera **Leva Meccanica Interattiva da Casinò**.
- **Fisica basata sulla corsa della leva**:
  - Clicca o tocca il pomello rosso della leva e **trascinalo verso il basso**: l'angolo della leva si inclina fisicamente e in tempo reale.
  - **Indicatore LED Verticale (Power Gauge)**: 10 segmenti LED ad alta intensità si illuminano progressivamente da Verde (Delicato) a Giallo (Medio), Arancione (Forte) fino a Rosso/Viola lampeggiante (**JACKPOT TURBO MAX**).
  - **Feedback sonoro di tensione**: Mentre tiri la leva, senti i cricchetti meccanici della molla che aumentano di tono.
  - **Rilascio e Scatto**: Rilasciando la leva, questa scatta indietro con effetto rimbalzo a molla e suono di impatto metallico, trasmettendo alla ruota l'impulso corrispondente alla profondità del tiro (giri completi, velocità angolare e durata di rotazione proporzionali alla forza impressa).
  - Un semplice clic rapido sulla leva o sul pulsante "LANCIO CASINÒ!" avvia una tirata automatica fluida e potente.

### 5. 💎 Grafica & Sonoro stile Casinò / Slot
- **Cornice Marquee con Lampadine Animate**: 24 lampadine LED stile insegna di Las Vegas che lampeggiano a ritmo alternato e accelerano durante la rotazione.
- **Indicatore Meccanico Dinamico (Flipper)**: La freccia superiore rimbalza fisicamente a ogni piolo superato.
- **Effetti Audio Dinamici con Web Audio API**:
  - Ticchettio realistico dei pioli (la frequenza e l'altezza del suono scalano con la velocità della ruota).
  - Rilascio meccanico della leva da slot machine.
  - Fanfara di trionfo e tintinnio di monete d'oro al raggiungimento del Jackpot.
  - Pulsante Mute/Unmute per silenziare l'audio quando necessario.
- **Pioggia di Coriandoli e Monete d'Oro 3D**: Sistema particellare Canvas fullscreen con monete dorate ruotanti, stelle scintillanti e nastri colorati.
- **Interfaccia Responsiva**: Funziona su PC desktop, tablet e smartphone con supporto per la modalità Schermo Intero (Fullscreen).

---

## 🚀 Come Avviare l'Applicazione

### Prerequisiti
- Node.js (v18+)
- npm

### Avvio in Sviluppo
```bash
npm start
```
L'applicazione sarà disponibile su `http://localhost:4200` (o la porta indicata dal server).

### Compilazione per Produzione
```bash
npm run build
```
I file ottimizzati per la pubblicazione su qualsiasi hosting statico (GitHub Pages, Vercel, Netlify, Cloudflare Pages, S3/Firebase Hosting) vengono generati nella cartella:
```
dist/ruota-della-fortuna/browser
```
