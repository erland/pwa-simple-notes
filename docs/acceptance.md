# Acceptance och verifiering v1.0.0

Browserprov har nu körts i GitHub Actions på PR #1. DEV-020 återstår eftersom GitHub Pages ännu inte har publicerats från main. Följande tabell skiljer automatiskt verifierade delar från manuella kontroller som återstår.

| Krav | Evidens | Status |
|---|---|---|
| UC-001 / AC-001–002 anteckning och redigering | UI-test, domän- och persistence-test | PASS automatiskt |
| UC-002 / AC-003 sektion och avslut | domän- och reopen-test | PASS automatiskt |
| UC-003 / AC-004 möte | domän- och persistence-test samt Playwright i Chromium och WebKit | PASS automatiskt |
| UC-004 / AC-005–006 åtgärd | UI-test samt reopen-test | PASS automatiskt |
| UC-005 / AC-007 viktigt och kontext | UI-test och persistence-test; navigation implementerad | PASS automatiskt för markering och äldre kontextnavigation; ej manuellt |
| UC-006–007 / AC-009–010 backup och restore | format- och databastest samt Playwright i Chromium och WebKit för nedladdning, avbrytande, bekräftelse och beständighet | PASS automatiskt |
| AC-008 / NFR-002 offline och installerbar PWA | manifest, ikon, service worker och precache kontrolleras i build; Playwright provar offline-start och lokal data i Chromium | PASS för offline; installationsprompt och fysisk enhet ej provade |
| AC-011 / NFR-003 mobil, surfplatta, desktop | responsiv CSS; Playwright provar 390 px viewport utan horisontell sidscroll i Chromium och WebKit | PASS för mobil viewport; surfplatta och fysisk enhet ej provade |
| NFR-006 stort flöde | 3 000 poster och deterministisk sidindelning i test | PASS automatiskt |
| NFR-008 integritet | inga nätverksanrop eller externa tjänster i appkod; data i IndexedDB | PASS kodgranskning |

GitHub Actions Validate run `36403587959` passerade på PR #1: `npm ci`, build, 18 tester, lint, typecheck och statisk PWA-kontroll. Playwright: 5 passerade, 1 avsiktligt överhoppat (offline i WebKit). Den lokala Pages-pathen har HTTP-smoketestats för index, manifest, service worker och ikon. Pages-workflowen och live-smoke återstår efter merge till main.
