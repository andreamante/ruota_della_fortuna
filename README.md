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

### 4. ⚡ Regolazione della Forza di Lancio
- **5 Livelli di Potenza**:
  1. 🍃 **Delicato**: ~3.5s, 4 giri completi
  2. 🎯 **Normale**: ~5.5s, 7 giri completi
  3. ⚡ **Energico**: ~8.0s, 11 giri completi
  4. 🎰 **Jackpot**: ~11.0s, 16 giri completi
  5. 🔥 **Turbo Max**: ~14.0s, 22 giri completi
- **Fisica di decelerazione realistica**: Curva quartica di frenata con suspense crescente negli ultimi spicchi prima dell'arresto.
- **Leva Meccanica della Slot Machine**: Include una leva 3D interattiva con pomello rosso lucido che si abbassa con effetto molla al tocco o al clic.

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
