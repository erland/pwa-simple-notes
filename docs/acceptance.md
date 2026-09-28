# Acceptance och verifiering v1.0.0

Användaren har uttryckligen valt att hoppa över browserprovet. DEV-020 återstår eftersom GitHub Pages ännu inte har publicerats från main; PR #1 i `erland/pwa-simple-notes` är fortfarande öppen. Följande tabell skiljer automatiskt verifierade delar från de manuella kontrollpunkter som därmed inte har körts.

| Krav | Evidens | Status |
|---|---|---|
| UC-001 / AC-001–002 anteckning och redigering | UI-test, domän- och persistence-test | PASS automatiskt |
| UC-002 / AC-003 sektion och avslut | domän- och reopen-test | PASS automatiskt |
| UC-003 / AC-004 möte | domän- och persistence-test; formulär i UI | PASS automatiskt för modell, UI ej manuellt |
| UC-004 / AC-005–006 åtgärd | UI-test samt reopen-test | PASS automatiskt |
| UC-005 / AC-007 viktigt och kontext | UI-test och persistence-test; navigation implementerad | PASS automatiskt för markering och äldre kontextnavigation; ej manuellt |
| UC-006–007 / AC-009–010 backup och restore | format- och databastest samt UI-test för invalid/cancel/confirm | PASS automatiskt |
| AC-008 / NFR-002 offline och installerbar PWA | manifest, ikon, service worker och precache kontrolleras i build | Browserprov avstått på begäran |
| AC-011 / NFR-003 mobil, surfplatta, desktop | responsiv CSS med brytpunkter 850/520 px | Visuellt browserprov avstått på begäran |
| NFR-006 stort flöde | 3 000 poster och deterministisk sidindelning i test | PASS automatiskt |
| NFR-008 integritet | inga nätverksanrop eller externa tjänster i appkod; data i IndexedDB | PASS kodgranskning |

Körda lokala kommandon: `npm ci`, `npm run build`, `npm run verify:pwa`, `npm run test`, `npm run lint`, `npm run typecheck`. Den lokala Pages-pathen har HTTP-smoketestats för index, manifest, service worker och ikon. GitHub Actions Validate för PR #1 passerade på implementation SHA `5ed231f` (run `36384383505`). Pages-workflowen och live-smoke återstår efter merge till main.
