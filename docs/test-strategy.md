# Simple Notes – Teststrategi

## Syfte

Teststrategin säkerställer att Simple Notes kan utvecklas stegvis utan att riskera användarens lokala data och att kärnflödena fungerar offline i stödda webbläsare.

## Testnivåer

- **Unit tests:** domänregler, validering, backupformat och migreringsfunktioner.
- **Integration tests:** IndexedDB repositories, schema upgrades, persistence round-trip och restore-transaktioner.
- **UI tests:** anteckningsflöde, sektioner, möten, åtgärder, viktigt, sökning och felmeddelanden.
- **E2E/acceptance:** installering/start offline, backup → wipe → restore, navigering tillbaka till kontext och långa flöden.
- **Manuell cross-browser acceptance:** Safari på iOS/iPadOS samt aktuell Chromium-baserad desktopbrowser.

## Riskstyrda obligatoriska verifieringar

1. Data skapad före reload ska finnas kvar efter reopen av IndexedDB.
2. Schema-migrering ska bevara befintlig data.
3. Ogiltig backup får inte ändra befintlig data.
4. Backup → töm lokal data → restore ska ge semantiskt samma innehåll.
5. Appen ska kunna starta och kärnflöden ska fungera utan nätverk efter att appskalet cachats.
6. `createdAt` ska bevaras vid redigering och `updatedAt` uppdateras.
7. Högst en sektion får vara aktiv åt gången.

## Kvalitetsgrind per utvecklingssteg

När projektgrunden finns ska varje normalt DEV-steg verifieras med relevanta tester plus build, lint och typecheck. Ett steg markeras inte completed när obligatorisk verifiering misslyckas. Miljöbegränsad verifiering dokumenteras som deferred/blockerad enligt System Builder-state.

## Release acceptance

Före första release ska DEV-019 och DEV-020 verifiera:

- Safari/iOS/iPadOS,
- Chromium desktop,
- offline-start och offline-användning,
- full backup/restore,
- responsiv användning på telefon och desktop,
- produktionsbuild och statisk HTTPS-deployment.
