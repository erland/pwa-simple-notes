# Releasebedömning – Simple Notes v1.0.0

**Käll- och byggpaket: READY_WITH_WARNINGS.** Funktionerna enligt Must-scope är implementerade, och automatiska kontroller passerar. GitHub Actions Validate run `36403587959` passerade för PR #1, inklusive Playwright i Chromium och WebKit (5 passerade, 1 avsiktligt överhoppat).

**DEV-020 och live deployment: NOT_READY / inte utförd.** Ingen publicerad URL eller fungerande Pages-installation kan rapporteras före merge av PR #1 till main. Workflow och installationsanvisning finns för nästa miljö.

## Kvarstående kända begränsningar

- Anteckningar lagras endast i aktuell webbläsarprofil/origin. Regelbunden nedladdad backup är nödvändig.
- Återställning ersätter data; sammanslagning stöds inte.
- Offline-start med service worker och lokal data har provats i Chromium på CI. Installationsprompt och faktisk installation på enhet återstår.
- WebKit har provat centrala flöden och mobil viewport på Linux; Safari på fysisk iPhone/iPad och manuella desktopprov återstår.
- Långt flöde laddas inkrementellt i normalvyn, medan specialvyer och navigation till en mycket gammal anteckning kan läsa hela historiken; test med 3 000 anteckningar passerar.

## Releasechecklista

- [x] Must-funktioner implementerade och lokalt testade.
- [x] Versionsmärkt backup och atomisk restore.
- [x] Produktionsbuild och manifest/service worker-struktur.
- [x] CI- och Pages-workflow samt installations- och driftdokumentation.
- [x] Komplett projekt-ZIP utan `node_modules`, `dist` eller hemligheter.
- [x] GitHub Actions Validate på PR #1.
- [ ] Publicerad Pages-URL och live HTTP-smoke efter merge.
- [x] Automatiska browserprov för offline i Chromium samt backup, återställning och mobilflöde i Chromium/WebKit.
- [ ] Fysisk installation och Safari på iPhone/iPad.
