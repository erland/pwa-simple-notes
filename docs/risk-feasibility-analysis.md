# Simple Notes – Risk- och genomförbarhetsanalys

## 1. Syfte

Detta dokument bedömer om den planerade första versionen av Simple Notes kan byggas som en offline-first PWA utan backend, och vilka risker som behöver hanteras innan arkitekturen låses.

Bedömningen utgår från den funktionella specifikationen och fokuserar på lokal lagring, offlinebeteende, dataskydd mot oavsiktlig förlust, backup/restore, uppgraderingar, mobil/desktop-stöd och framtida bilagor.

## 2. Sammanfattande bedömning

**Bedömning: genomförbar.**

För version 1 finns inga identifierade blockerande tekniska hinder. En PWA med IndexedDB som primär datalagring kan uppfylla kärnbehoven: löpande anteckningsflöde, sektioner, mötesmetadata, åtgärder, viktiga markeringar, sökning, offlineanvändning samt backup/restore.

Det viktigaste designvillkoret är att lokal webbläsarlagring inte får behandlas som ensam säkerhetskopia. Data i IndexedDB är normalt best-effort-lagring om inte persistent storage beviljas, och webbläsaren eller användaren kan i vissa situationer rensa data. Därför ska Simple Notes kombinera lokal lagring med tydlig backupfunktion, lagringsstatus och återställningsbart, versionsmärkt backupformat.

Ingen separat PoC krävs före arkitektursteget, men några riskreducerande kontroller ska planeras tidigt i implementationen.

## 3. Centrala feasibility-frågor

### FQ-001 – Kan appen fungera helt offline utan backend?

**Svar:** Ja.

- Applikationsskalet kan cachas med service worker/PWA-mekanismer.
- Anteckningsdata kan lagras lokalt i IndexedDB.
- IndexedDB är asynkront och lämpar sig för större mängder strukturerad data och blobs.
- Sökning, filtrering, åtgärdslistor och viktiga markeringar kan byggas helt lokalt.

**Beslut:** Offline-first utan backend är tekniskt rimligt för version 1.

### FQ-002 – Är IndexedDB tillräckligt för anteckningsdata?

**Svar:** Ja.

IndexedDB är avsett för betydande mängder strukturerad klientdata och stöder transaktioner, index och blobs. Det passar bättre än localStorage för Simple Notes datamodell och den framtida möjligheten att lagra bilagor.

**Beslut:** IndexedDB rekommenderas som primär datalagring.

### FQ-003 – Kan lokal data garanteras att aldrig försvinna?

**Svar:** Nej.

Webbläsarlagring är normalt best-effort och kan påverkas av lagringsbrist, browserdata-rensning eller användaråtgärder. Persistent storage kan begäras via Storage API där stöd finns, men får inte vara den enda skyddsmekanismen.

**Beslut:** Backup/restore är en kärnfunktion, inte ett tillval. Appen ska aldrig beskriva lokal lagring som en säker backup.

### FQ-004 – Kan backup och restore fungera på både telefon och dator?

**Svar:** Ja, med ett portabelt filbaserat upplägg.

Version 1 behöver inte vara beroende av avancerad direktåtkomst till filsystemet. Export kan skapa en nedladdningsbar backupfil och import kan använda användarens vanliga filväljare. Detta ger bättre kompatibilitet än att göra File System Access API till ett krav.

**Beslut:** Backup/restore ska byggas på standardiserad fil-export/import. Avancerad direkt filsystemsaccess är inte ett krav.

### FQ-005 – Kan datamodellen uppgraderas utan att användarens anteckningar går förlorade?

**Svar:** Ja, om schema- och backupversionering designas från början.

**Beslut:** Databasen och backupformatet ska versionsmärkas. Alla schemauppgraderingar ska ha explicit migration och verifiering.

### FQ-006 – Kan bilder stödjas senare utan större ombyggnad?

**Svar:** Ja.

IndexedDB kan lagra blobs. Version 1 bör därför hålla anteckningsinnehåll och eventuella framtida bilagor separerade genom stabila ID:n, även om bilagefunktionen inte implementeras ännu.

**Beslut:** Datamodellen ska förberedas för attachments, men inga bildfunktioner ingår i version 1.

## 4. Riskregister

| ID | Kategori | Risk | Sannolikhet | Konsekvens | Nivå | Hantering | Status |
|---|---|---|---|---|---|---|---|
| RISK-001 | Data | Lokal IndexedDB-data kan rensas av användare, webbläsare eller lagringstryck. | medium | high | high | Backup/restore som Must-funktion, begär persistent storage där möjligt, visa lagrings-/backupstatus och dokumentera begränsningen. | open |
| RISK-002 | Data | Databasuppgradering kan skada eller tappa äldre anteckningar. | low | high | medium | Versionsmärkt schema, explicita migrationer, migrationstester och backup före destruktiva förändringar. | open |
| RISK-003 | Data | Restore kan skriva över fungerande lokal data med fel eller gammal backup. | medium | high | high | Validera format/version före import, visa sammanfattning, kräva explicit bekräftelse och skapa säkerhetsbackup av aktuell data före restore när praktiskt möjligt. | open |
| RISK-004 | UX | Funktioner runt sektioner, åtgärder och viktigt gör att appen tappar känslan av direkt anteckningsblock. | medium | high | high | "Öppna → skriv" blir styrande UX-princip. Primärt skrivfält ska vara direkt tillgängligt utan obligatoriska dialoger eller metadata. | open |
| RISK-005 | Offline | Ny eller uppdaterad PWA-version kan få cache-/versionskonflikt och sluta fungera korrekt offline. | medium | medium | medium | Kontrollerad service-worker-strategi, versionshantering, offline-test och säker uppdateringsmekanism. | open |
| RISK-006 | Performance | Ett mycket långt kronologiskt flöde kan bli långsamt om alla poster renderas samtidigt. | medium | medium | medium | Indexerad hämtning, pagination/incremental loading eller virtualisering när datamängden motiverar det. Test med realistiskt stor historik. | open |
| RISK-007 | Compatibility | Browser/PWA-beteende skiljer sig mellan iOS/iPadOS, Safari och Chromium-baserade desktopbrowser. | medium | medium | medium | Stöd en konservativ webbplattform: IndexedDB, vanlig filimport/export och service worker. Verifiera minst Safari/iOS och Chromium/desktop. | open |
| RISK-008 | Storage | Framtida foton kan snabbt öka lagringsbehovet och göra backupfilen stor. | medium | medium | medium | Bilder utanför v1. Separat attachments-modell, lagringsestimat, storleksgränser/komprimering och ZIP-baserat backupformat utvärderas när funktionen införs. | accepted for v1 |
| RISK-009 | Search | Sökning över växande lokal historik kan bli långsam om full scan används för varje tangenttryckning. | low | medium | low/medium | Börja enkelt, mät med realistisk testdata och inför lokal sökindexering först vid behov. | accepted |
| RISK-010 | Security/privacy | Anteckningar lagras okrypterat i webbläsarens origin-lagring och skyddas huvudsakligen av enhetens/browserns säkerhet. | medium | medium | medium | Ingen känslig backendexponering i v1; dokumentera lokal lagring. Kryptering/PIN behandlas som framtida produktbeslut om behov uppstår. | accepted for v1 |
| RISK-011 | Backup compatibility | Framtida appversion kan inte läsa äldre backupfil. | medium | high | high | Backupformat med formatVersion, migrationskedja och fixture-baserade kompatibilitetstester. | open |
| RISK-012 | Concurrency | Samma app öppen i flera flikar/fönster kan ge stale state eller konkurrerande redigeringar. | low | medium | low/medium | IndexedDB-transaktioner, tydlig state-refresh och test av två samtidiga appinstanser. BroadcastChannel kan användas om behov finns. | open |

## 5. Viktigaste riskreducerande designkrav

Följande krav bör behandlas som arkitekturella constraints:

1. **IndexedDB är system of record lokalt.** `localStorage` får inte användas för primär anteckningsdata.
2. **Alla dataobjekt får stabila ID:n** och tidsstämplar för skapande/ändring.
3. **Databasversion och backupformat versioneras separat.**
4. **Migrationer får inte vara implicita eller destruktiva utan test.**
5. **Backup exporterar hela användarens återställningsbara datamängd.**
6. **Restore måste validera filen innan befintlig data påverkas.**
7. **Appen ska försöka använda persistent browser storage när API/stöd tillåter det**, men alltid fungera utan det.
8. **Appen ska kunna visa uppskattad lokal lagringsanvändning när Storage API stödjer det.**
9. **PWA-cachen och användardatan ska hanteras som två olika saker.** Uppdatering av appkod får inte radera IndexedDB-data.
10. **Offline är normalläge**, inte ett fel- eller fallbackläge.
11. **Ingen nätverksanslutning ska krävas för kärnflödet efter att appen installerats/laddats in.**
12. **Filimport/export ska inte kräva File System Access API.** Standard download/upload ska räcka.
13. **UI-arkitekturen ska skydda principen "öppna → skriv".** Sektioner och metadata ska vara frivilliga lager runt anteckningsflödet.
14. **Framtida attachments refereras med ID** så att bilder kan införas utan att ändra grundbegreppet NoteBlock.

## 6. Tidiga verifieringar som bör in i utvecklingsplanen

### VF-001 – IndexedDB persistence

Verifiera på Safari/iOS och Chromium/desktop att:

- anteckningar finns kvar efter reload,
- appen stängs och öppnas igen,
- en ny appversion laddas,
- offline-läge används efter första installation/laddning.

### VF-002 – Storage API

Verifiera beteendet för:

- `navigator.storage.persisted()`,
- `navigator.storage.persist()`,
- `navigator.storage.estimate()`.

Appen ska hantera avsaknad eller nekad persistence utan att kärnfunktioner fallerar.

### VF-003 – Backup round-trip

Skapa testdata med:

- fristående anteckningar,
- sektion,
- möte,
- deltagare,
- åtgärd öppen,
- åtgärd avslutad med lösning,
- viktigt-markeringar.

Exportera backup, rensa databasen, importera backup och verifiera strukturell och innehållsmässig likhet.

### VF-004 – Schema migration

Skapa minst en automatiserad migrationsfixture från föregående schema till nästa redan när första riktiga schemauppgraderingen införs.

### VF-005 – Long-feed test

Generera en realistisk större historik, exempelvis 10 000 anteckningsblock, och verifiera att appstart, scroll och filtrering är acceptabla. Exakt prestandamål fastställs i arkitektur/plan om mätningen visar behov.

### VF-006 – PWA update/offline

Verifiera:

- installation,
- offline-start,
- cache av appskal,
- uppdatering till ny version,
- att data överlever appuppdateringen.

## 7. Behövs spike eller PoC?

**Ingen blockerande spike krävs före arkitektursteget.**

De centrala teknikerna är mogna och stöder grundbehovet. Däremot ska utvecklingsplanen lägga tidiga verifieringssteg för persistence, backup round-trip och PWA-update/offline innan större mängder funktionalitet byggs ovanpå lagringslagret.

Om implementationen visar oväntade begränsningar på Safari/iOS ska ett separat spike-steg skapas då, snarare än att förutsätta att avancerade webbläsarspecifika API:er behövs från början.

## 8. Säkerhetsbedömning

Version 1 har liten extern attackyta eftersom den saknar backend, konto och serverintegration. De viktigaste säkerhetsfrågorna är därför lokala:

- importerad backup ska betraktas som opålitlig input och valideras,
- filformatet får inte kunna injicera körbart innehåll,
- återställd text ska renderas säkert och inte som osanerad HTML,
- service worker och app ska levereras över HTTPS i normal distribution,
- inga hemligheter ska lagras i klientkoden.

När foton senare införs krävs ytterligare regler för filtyp, storlek, metadata och resursförbrukning.

## 9. Deployment/operations-bedömning

Första versionen kan distribueras som statiska filer på valfri HTTPS-hosting som stödjer korrekt fallback/cachekontroll för PWA:n. Ingen stateful serverdrift behövs.

Det gör lösningen enkel att driftsätta men innebär också att användardata inte finns på servern och därför inte kan återställas av driftorganisationen. Det måste vara tydligt för användaren.

## 10. Beslut efter analysen

Följande kan låsas inför arkitektursteget:

- React + TypeScript-baserad PWA är fortsatt lämplig riktning.
- Backend behövs inte för version 1.
- IndexedDB används för primär lokal data.
- Service worker/PWA-cache används för offline-appskal.
- Backup/restore är obligatoriskt i version 1.
- Backupformatet ska vara explicit versionsmärkt.
- Standard filimport/export är baslinjen för backup.
- Persistent Storage API används opportunistiskt men är inget hårt krav.
- Bilder/bilagor är utanför version 1 men datamodellen ska möjliggöra dem senare.
- Safari/iOS och Chromium/desktop ska ingå i plattformsverifieringen.

## 11. Öppna risker inför arkitektur

Det finns inga blockerande risker. Följande ska dock föras vidare som arkitekturella kvalitetskrav:

- RISK-001 lokal dataförlust,
- RISK-002 schema/migration,
- RISK-003 restore overwrite,
- RISK-004 enkel antecknings-UX,
- RISK-005 PWA cache/update,
- RISK-006 långt flöde,
- RISK-007 browserkompatibilitet,
- RISK-011 backupkompatibilitet.

## 12. Källor

- MDN, Storage quotas and eviction criteria: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- MDN, IndexedDB API: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- MDN, Storage API: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API
- WebKit, Updates to Storage Policy: https://webkit.org/blog/14403/updates-to-storage-policy/

## 13. Nästa rekommenderade steg

**Ta fram målarkitektur för Simple Notes.**

Arkitekturen ska omsätta funktionell specifikation och ovanstående riskconstraints till komponenter, datamodell, state/data-flöde, IndexedDB-struktur, offline/PWA-strategi, backupformat, säkerhetsgränser och deploymentmodell.
