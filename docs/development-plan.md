# Simple Notes – Development Plan

## Goal and delivery scope

Målet är att leverera första release av Simple Notes som en installerbar, offline-first PWA för personlig textbaserad anteckning utan backend. Första releasen ska ge ett löpande kronologiskt anteckningsflöde, sektioner och möten, åtgärder, viktiga anteckningar, sökning samt fullständig backup och restore.

Planen är risk-first: lokal persistence, schemahantering, backup/restore och PWA/offline verifieras tidigt innan större mängd produktfunktionalitet byggs ovanpå dem.

## Planning assumptions

- Projektet är nytt och kan etableras från grunden.
- Frontend: React + TypeScript + Vite.
- PWA: manifest + service worker med kontrollerad app-shell caching.
- Primär lokal data: IndexedDB.
- Ingen backend, autentisering eller molnsynk i version 1.
- Statisk HTTPS-hosting är tillräcklig; GitHub Pages är lämplig standardprofil.
- Safari/iOS/iPadOS och Chromium-baserad desktopbrowser ingår i acceptansverifieringen.
- NoteBlock är minsta markörbara enhet i version 1; godtyckliga textspann ingår inte.
- Bilder/bilagor implementeras inte i version 1 men modellen ska kunna byggas ut för detta senare.
- Normalt slutförs högst ett DEV-steg per tillfälle; användaren har uttryckligen bett om kontinuerlig genomföring av resten av planen.

## Step overview

| ID | Titel | Huvudresultat |
|---|---|---|
| DEV-001 | Etablera projektgrund och kvalitetsbaseline | Körbart React/TS/Vite-projekt med lint, test och dokumenterad struktur |
| DEV-002 | Etablera domänmodell och applikationskontrakt | Testbar modell för NoteBlock, Section och centrala use cases |
| DEV-003 | Implementera IndexedDB och schemahantering | Versionshanterad lokal persistence med migrationstest |
| DEV-004 | Bevisa persistence round-trip | Skapa, läsa, uppdatera och återladda data över appstart |
| DEV-005 | Implementera backupformat och export | Versionsmärkt full backup som kan skapas offline |
| DEV-006 | Implementera säker restore | Validerad, atomisk restore med oförändrad data vid fel |
| DEV-007 | Etablera PWA och offline-appskal | Installerbar app som startar och fungerar offline |
| DEV-008 | Bygg grundlayout och direkt anteckningsläge | Responsiv huvudvy där användaren kan börja skriva direkt |
| DEV-009 | Implementera kronologiskt anteckningsflöde | Skapa, visa och redigera NoteBlock med tidsstämplar |
| DEV-010 | Implementera vanliga sektioner | Starta/avsluta sektion och automatisk koppling av nya anteckningar |
| DEV-011 | Implementera mötessektioner | Titel, tid, deltagare och möteskontext i flödet |
| DEV-012 | Implementera åtgärder | Markera, lista och slutföra åtgärder med lösning |
| DEV-013 | Implementera viktiga anteckningar | Markera och återfinna viktiga NoteBlock |
| DEV-014 | Implementera sökning | Sökning över anteckningar, sektioner, möten, deltagare och lösningar |
| DEV-015 | Navigera tillbaka till kontext | Från specialvyer/sökresultat till rätt plats i anteckningsflödet |
| DEV-016 | Optimera långt flöde och responsiv användning | Inkrementell laddning och stabil mobil/desktop-UX |
| DEV-017 | Lägg till dataskydd och lagringsstatus | Persistent-storage request där möjligt, tydliga fel och backup-påminnelseyta |
| DEV-018 | Slutför backup/restore-UX | Produktionsmässiga dialoger, konsekvensinformation och resultatfeedback |
| DEV-019 | Cross-browser och offline acceptance | Verifierad Safari/iOS/iPadOS + Chromium desktop |
| DEV-020 | Release- och deploymentförberedelser | Produktionsbuild, statisk deployment och release readiness |

## Development steps

## DEV-001 – Etablera projektgrund och kvalitetsbaseline

### Mål

Skapa en komplett projektgrund som alla senare steg kan byggas och verifieras på.

### Scope

**Ingår**
- React + TypeScript + Vite.
- Grundläggande mappstruktur enligt målarkitekturen.
- ESLint.
- Vitest + React Testing Library.
- Grundläggande scripts för build, test, lint och typecheck.
- README med lokal utveckling och verifiering.
- Canonical projektdokument och System Builder-state i projektet.

**Ingår inte**
- Produktfunktioner utöver ett minimalt app-shell.
- IndexedDB.
- PWA/service worker.

### Förutsättningar

- Planning handoff är genomförd.

### Implementation

- Skapa frontendprojektet.
- Etablera `src`-struktur för UI, application/domain, persistence och infrastructure.
- Skapa enkel app-shell utan produktlogik.
- Lägg till testsetup och scripts.
- Lägg till canonical dokumentation och `.system-builder`-state.

### Verifiering

- Dependency installation.
- `npm run build`.
- `npm run test`.
- `npm run lint`.
- Typecheck om separat script används.

### Klart-kriterier

- [x] Projektet kan installeras och startas lokalt.
- [x] Build passerar.
- [x] Tester passerar.
- [x] Lint/typecheck passerar.
- [x] Projektstruktur och dokumentation finns i repositoryt.

### Beroenden

- Planning handoff ZIP.

## DEV-002 – Etablera domänmodell och applikationskontrakt

### Mål

Definiera och testa kärnmodellen utan beroende till React eller IndexedDB.

### Scope

**Ingår**
- `NoteBlock`.
- `Section` med `standard | meeting`.
- Action-state.
- Centrala command/query-kontrakt för use cases.
- Stabil ID- och timestampstrategi.

**Ingår inte**
- Persistenceimplementation.
- UI.

### Förutsättningar

- DEV-001 completed.

### Implementation

- Modellera domäntyper och valideringsregler.
- Definiera repository-/storage-kontrakt som application layer använder.
- Implementera rena domänfunktioner för statusövergångar där lämpligt.

### Verifiering

- Unit tests för domänregler.
- Typecheck.
- Lint.

### Klart-kriterier

- [x] Endast en aktiv sektion kan representeras av applikationsreglerna.
- [x] NoteBlock behåller `createdAt` vid ändring.
- [x] Action-state stöder none/open/completed och lösningsmetadata.
- [x] Domänlagret har inget React- eller IndexedDB-beroende.

### Beroenden

- DEV-001.

## DEV-003 – Implementera IndexedDB och schemahantering

### Mål

Etablera versionshanterad lokal persistence som kan migreras säkert.

### Scope

**Ingår**
- IndexedDB-databas.
- Stores/index enligt arkitekturen.
- Schema/version.
- Migrationmekanism.
- Repository-adapters.
- Teststöd för persistence.

**Ingår inte**
- Slutlig UI.
- Backupformat.

### Förutsättningar

- DEV-002 completed.

### Implementation

- Implementera DB-open/upgrade.
- Skapa stores för notes, sections och metadata/settings som behövs.
- Skapa index för kronologi, sectionkoppling, action och important.
- Implementera repository-adapters.
- Lägg till test som verifierar minst en faktisk schema-upgrade.

### Verifiering

- Persistence tests i browserlik testmiljö.
- Migrationstest från föregående schemafixture.
- Build, test, lint, typecheck.

### Klart-kriterier

- [x] Databas kan skapas från tomt state.
- [x] Schema versioneras explicit.
- [x] En schemaändring kan migreras utan dataförlust i test.
- [x] Repository-kontrakten från DEV-002 är implementerade.

### Beroenden

- DEV-002.

## DEV-004 – Bevisa persistence round-trip

### Mål

Verifiera tidigt att kärndata överlever reload och kan uppdateras korrekt innan fler funktioner byggs.

### Scope

**Ingår**
- Minimalt end-to-end-flöde för skapa/läsa/uppdatera NoteBlock och Section.
- Reload/reopen-verifiering.
- Felhantering vid write failure på application-nivå.

**Ingår inte**
- Full UI-design.

### Förutsättningar

- DEV-003 completed.

### Implementation

- Koppla application services till IndexedDB-adaptern.
- Lägg till integrationsverifiering av round-trip.
- Säkerställ att appen kan skilja på lyckad och misslyckad persistence.

### Verifiering

- Integrationstest create → close DB → reopen → read.
- Update med bevarad `createdAt`.
- Build/test/lint/typecheck.

### Klart-kriterier

- [x] NoteBlock överlever reload/reopen.
- [x] Section och relation till NoteBlock överlever reload/reopen.
- [x] Uppdatering ändrar `updatedAt` men inte `createdAt`.
- [x] Persistencefel propagateras kontrollerat.

### Beroenden

- DEV-003.

## DEV-005 – Implementera backupformat och export

### Mål

Skapa ett stabilt och versionsmärkt fullbackupformat oberoende av IndexedDBs interna struktur.

### Scope

**Ingår**
- Exportmodell.
- Backupformatversion.
- Full snapshot av återställningsbar data.
- Serialisering till fil.
- Filnamn med datum.
- Automatiserat round-trip-test på formatnivå.

**Ingår inte**
- Restore till databasen.
- Bilagor.

### Förutsättningar

- DEV-004 completed.

### Implementation

- Definiera schema för backup.
- Mappa domain/persistence till exportmodell.
- Skapa `.snotes`-fil som textbaserat JSON-format i version 1.
- Separera formatversion från appversion.

### Verifiering

- Schema-/formatvalidering.
- Export av fixture med notes/sections/actions/important.
- Serialisera → parse → jämför semantiskt innehåll.
- Offline-test utan nätverksberoende.

### Klart-kriterier

- [x] Full återställningsbar data ingår i backup.
- [x] Formatet har explicit version.
- [x] Backup är oberoende av rå IndexedDB-struktur.
- [x] Export kan skapas utan nätverk.

### Beroenden

- DEV-004.

## DEV-006 – Implementera säker restore

### Mål

Återställa backup utan att riskera befintlig data vid ogiltig eller inkompatibel fil.

### Scope

**Ingår**
- Parse och schema validation.
- Versionskontroll.
- In-memory migration hook för äldre format.
- Preview/sammanfattning till UI-kontrakt.
- Atomisk replace av lokal data efter explicit bekräftelse.
- Post-restore verification.

**Ingår inte**
- Slutlig visuell restore-dialog.

### Förutsättningar

- DEV-005 completed.

### Implementation

- Implementera restore pipeline enligt arkitekturen.
- Validera all data före destructive transaction.
- Implementera transaction för full replace.
- Implementera verifiering att importerad data kan läsas efter commit.

### Verifiering

- Giltig backup återställs korrekt.
- Ogiltig JSON ändrar ingen befintlig data.
- Ogiltigt schema ändrar ingen befintlig data.
- Unsupported formatversion ändrar ingen befintlig data.
- Backup → wipe → restore ger semantiskt samma data.

### Klart-kriterier

- [x] Befintlig data ändras aldrig före godkänd validering och bekräftelse.
- [x] Full round-trip är automatiskt verifierad.
- [x] Felrapportering är begriplig för UI-lagret.

### Beroenden

- DEV-005.

## DEV-007 – Etablera PWA och offline-appskal

### Mål

Göra Simple Notes installerbar och säkerställa att appskal och kärnkod kan starta offline.

### Scope

**Ingår**
- Web app manifest.
- Service worker.
- App-shell/static asset caching.
- Update-strategi som inte riskerar användardata.
- Installationsbarhet.

**Ingår inte**
- Cache av användardata.

### Förutsättningar

- DEV-006 completed.

### Implementation

- Lägg till PWA-konfiguration.
- Cache endast statiska resurser/appskal.
- Hantera service-worker update kontrollerat.
- Säkerställ att användardata fortsatt ägs av IndexedDB.

### Verifiering

- Produktionsbuild.
- Installability check.
- Starta laddad/installerad app offline.
- Verifiera att NoteBlock-data finns kvar efter service-worker update-test.

### Klart-kriterier

- [ ] Appen är installerbar i stödd browser.
- [ ] Appen startar offline efter första laddning.
- [ ] Ingen användardata lagras i Cache Storage.
- [ ] Updateflöde påverkar inte IndexedDB-data.

### Beroenden

- DEV-006.

## DEV-008 – Bygg grundlayout och direkt anteckningsläge

### Mål

Skapa produktens viktigaste UX: användaren öppnar appen och kan börja skriva direkt.

### Scope

**Ingår**
- Responsiv app-layout.
- Primär flödesvy.
- Skrivfält med fokus på låg friktion.
- Grundnavigation till Flöde, Åtgärder, Viktigt och Sök.
- Mobil och desktoplayout.

**Ingår inte**
- Full funktionalitet i specialvyerna.

### Förutsättningar

- DEV-007 completed.

### Implementation

- Skapa app-shell/navigering.
- Placera snabb input som primärt fokus.
- Undvik dialog/metadata före vanlig anteckning.

### Verifiering

- Component tests.
- Manuell mobile/desktop acceptance.
- Keyboard/focus sanity check.
- Build/test/lint/typecheck.

### Klart-kriterier

- [ ] Vanlig anteckning kan initieras direkt från startvyn.
- [ ] Ingen mapp/dokument/sektion behöver väljas först.
- [ ] Layout fungerar på liten telefonbredd och desktop.

### Beroenden

- DEV-007.

## DEV-009 – Implementera kronologiskt anteckningsflöde

### Mål

Leverera det första fullt användbara anteckningsflödet.

### Scope

**Ingår**
- Skapa NoteBlock.
- Kronologisk visning.
- Skapandetid.
- Redigera text.
- Senaste ändringstid internt/visuellt där lämpligt.
- Persistence via etablerade services.

**Ingår inte**
- Sektioner, actions, important.

### Förutsättningar

- DEV-008 completed.

### Implementation

- Koppla direktinput till create-note use case.
- Rendera flöde från lokal data.
- Implementera redigering med säker persistence.

### Verifiering

- Component/integration tests.
- Reload efter skapande/redigering.
- Kronologisk ordning med flera timestamps.

### Klart-kriterier

- [ ] Anteckning kan skapas, sparas, visas och redigeras.
- [ ] `createdAt` bevaras.
- [ ] Data överlever reload.
- [ ] Flödet visas i definierad kronologisk ordning.

### Beroenden

- DEV-008.

## DEV-010 – Implementera vanliga sektioner

### Mål

Låta användaren tillfälligt gruppera efterföljande anteckningar under ett ämne utan att lämna flödet.

### Scope

**Ingår**
- Skapa sektion med titel.
- Aktiv sektion.
- Automatisk `sectionId` på nya NoteBlock.
- Avsluta sektion.
- Inline-presentation i flödet.

**Ingår inte**
- Mötesmetadata.

### Förutsättningar

- DEV-009 completed.

### Implementation

- UI för start/close section.
- Application rule för högst en aktiv sektion.
- Presentation av sektionens början/slut i flödet.

### Verifiering

- Test att notes inom aktiv period kopplas rätt.
- Test att note efter close är fristående.
- Reload med aktiv sektion.

### Klart-kriterier

- [ ] Sektion kan startas och avslutas.
- [ ] Nya notes kopplas automatiskt när sektion är aktiv.
- [ ] Nästa note efter avslut saknar sectionId.
- [ ] Aktiv sektion är tydlig i UI.

### Beroenden

- DEV-009.

## DEV-011 – Implementera mötessektioner

### Mål

Stödja mötesanteckningar som en specialisering av sektion utan att skapa separat dokumentflöde.

### Scope

**Ingår**
- Mötestitel.
- Förvald aktuell lokal tid.
- Justerbar tid.
- Noll eller flera deltagare.
- Inline mötespresentation.

**Ingår inte**
- Kalenderintegration.
- Kontaktregister.

### Förutsättningar

- DEV-010 completed.

### Implementation

- Utöka create-section flow med typ Meeting.
- Form för metadata med aktuellt tidsförslag.
- Deltagare som enkla strängar.

### Verifiering

- Unit/component tests.
- Kontroll av defaulttid och ändrad tid.
- Persistence/reload av deltagare och mötestid.

### Klart-kriterier

- [ ] Mötessektion kan skapas med titel, tid och deltagare.
- [ ] Aktuell lokal tid föreslås automatiskt.
- [ ] Mötessektionen fungerar i övrigt som vanlig aktiv sektion.

### Beroenden

- DEV-010.

## DEV-012 – Implementera åtgärder

### Mål

Göra valfri NoteBlock uppföljningsbar utan att den lämnar sitt ursprungliga sammanhang.

### Scope

**Ingår**
- Markera/avmarkera som öppen åtgärd där regler tillåter.
- Åtgärder-vy.
- Slutföra åtgärd.
- Lösningsbeskrivning.
- `completedAt`.
- Öppen/slutförd filtrering.

**Ingår inte**
- Påminnelser/notifieringar.

### Förutsättningar

- DEV-011 completed.

### Implementation

- Action controls i NoteBlock.
- Query för open/completed actions.
- Complete-action dialog/form.

### Verifiering

- State transition tests.
- Note visas både i flöde och actionvy utan dataduplicering.
- Reload verifierar status, resolution och completedAt.

### Klart-kriterier

- [ ] NoteBlock kan bli öppen åtgärd.
- [ ] Alla öppna åtgärder kan listas.
- [ ] Åtgärd kan slutföras med lösning och tid.
- [ ] Originalkontext bevaras.

### Beroenden

- DEV-011.

## DEV-013 – Implementera viktiga anteckningar

### Mål

Göra viktig information lätt att återfinna utan att duplicera anteckningen.

### Scope

**Ingår**
- Markera/avmarkera NoteBlock som viktigt.
- Viktigt-vy.
- Visuell markering i ordinarie flöde.

**Ingår inte**
- Markering av godtyckliga textspann.

### Förutsättningar

- DEV-012 completed.

### Implementation

- Toggle important.
- Indexed query/projection för Important.
- Gemensam NoteBlock-rendering där lämpligt.

### Verifiering

- Unit/integration/component tests.
- Reload verifierar markeringen.

### Klart-kriterier

- [ ] Important-markering bevaras lokalt.
- [ ] Viktigt-vyn visar rätt underliggande NoteBlock.
- [ ] Ingen duplicerad note-data skapas.

### Beroenden

- DEV-012.

## DEV-014 – Implementera sökning

### Mål

Göra det möjligt att återfinna innehåll över alla centrala textfält.

### Scope

**Ingår**
- Anteckningstext.
- Sektionstitel.
- Mötestitel.
- Deltagare.
- Action resolution.
- Case-insensitive sökning.

**Ingår inte**
- Fulltextmotor/backendindex.
- Semantisk/AI-sökning.

### Förutsättningar

- DEV-013 completed.

### Implementation

- Application-level search över lokal data med tillräcklig effektivitet för version 1.
- Sökvy med tydlig kontext.

### Verifiering

- Testfixture som matchar varje fälttyp.
- No-result state.
- Specialtecken/whitespace sanity tests.

### Klart-kriterier

- [ ] Alla Must-sökfält ingår.
- [ ] Resultat identifierar original NoteBlock/Section.
- [ ] Sökning fungerar offline.

### Beroenden

- DEV-013.

## DEV-015 – Navigera tillbaka till kontext

### Mål

Låta användaren gå från Åtgärder, Viktigt och Sök direkt till originalanteckningens plats i flödet.

### Scope

**Ingår**
- Stabil deep-link/state navigation till NoteBlock.
- Scroll/focus/highlight till mål.
- Kontext kring sektion/möte.

**Ingår inte**
- Externa delningslänkar.

### Förutsättningar

- DEV-014 completed.

### Implementation

- Definiera intern locator via stabil note-ID.
- Säkerställ att flödeshämtning kan inkludera mål även vid inkrementell laddning.

### Verifiering

- Navigation från alla tre specialvyer.
- Mål i äldre del av flödet.
- Reload/deep internal navigation där routing stöder det.

### Klart-kriterier

- [ ] Användaren kan från varje specialvy nå original NoteBlock.
- [ ] Rätt sektion/möteskontext syns kring målposten.

### Beroenden

- DEV-014.

## DEV-016 – Optimera långt flöde och responsiv användning

### Mål

Undvika att ett växande anteckningsblock gör appen seg eller svåranvänd.

### Scope

**Ingår**
- Inkrementell/paginerad hämtning av äldre notes.
- Scrollbeteende.
- Responsiv finjustering.
- Rimlig renderingsprestanda med större fixture.

**Ingår inte**
- Backendpagination.
- Avancerad virtualisering om den inte behövs.

### Förutsättningar

- DEV-015 completed.

### Implementation

- Hämta flödessegment via IndexedDB-index/cursor.
- Behåll snabb åtkomst till nyaste skrivytan.
- Inför virtualisering endast om mätning motiverar det.

### Verifiering

- Testdata med minst flera tusen NoteBlock.
- Manuell scroll- och inputrespons.
- Regressionskontroll av context navigation.

### Klart-kriterier

- [ ] Appen laddar inte hela historiken obligatoriskt för första render.
- [ ] Ny anteckning förblir snabb med stor lokal datamängd.
- [ ] Context navigation fungerar även till ej initialt laddad post.

### Beroenden

- DEV-015.

## DEV-017 – Lägg till dataskydd och lagringsstatus

### Mål

Minska risken för oavsiktlig lokal dataförlust och göra lagringsbegränsningar begripliga.

### Scope

**Ingår**
- `navigator.storage.persist()` där stöd finns.
- Graceful fallback.
- Storage/persistence-status där det ger användarvärde.
- Tydlig information om att backup är användarens permanenta säkerhetskopia.
- Hantering av quota/write failures.

**Ingår inte**
- Molnbackup.

### Förutsättningar

- DEV-016 completed.

### Implementation

- Storage capability service.
- Request persistent storage på lämpligt icke-störande sätt.
- Presentera skrivfel så att användaren inte tror att data sparats.

### Verifiering

- Browser capability tests/mocks.
- Simulerat quota/write failure.
- Graceful unsupported-path.

### Klart-kriterier

- [ ] Persistent storage begärs opportunistiskt och appen fungerar utan stöd.
- [ ] Write failure döljs inte.
- [ ] Backupens roll som säkerhetskopia framgår i UI/dokumentation.

### Beroenden

- DEV-016.

## DEV-018 – Slutför backup/restore-UX

### Mål

Göra de redan verifierade backupfunktionerna säkra och begripliga för slutanvändaren.

### Scope

**Ingår**
- Backup i inställnings-/datahanteringsvy.
- Restore-filval.
- Valideringsresultat/sammanfattning.
- Tydlig destructive warning.
- Explicit confirmation.
- Success/failure feedback.

**Ingår inte**
- Merge av två datamängder.

### Förutsättningar

- DEV-017 completed.

### Implementation

- Koppla UI till DEV-005/006 services.
- Visa relevant backupversion och innehållssammanfattning före restore.

### Verifiering

- Component/integration tests för confirm/cancel/error/success.
- Manuell backup → erase test fixture → restore.

### Klart-kriterier

- [ ] Backup kan laddas ned från UI offline.
- [ ] Restore kräver uttrycklig bekräftelse efter validering.
- [ ] Cancel och invalid input lämnar data orörd.
- [ ] Resultat kommuniceras tydligt.

### Beroenden

- DEV-017 samt tidigare DEV-005/006.

## DEV-019 – Cross-browser och offline acceptance

### Mål

Verifiera hela Must-scope på målplattformarna och reparera endast problem som krävs för acceptance.

### Scope

**Ingår**
- Safari på iPhone/iPad där tillgängligt.
- Chromium-baserad desktopbrowser.
- Installerad PWA/offline.
- Kärnflöden från funktionell specifikation.
- Mobil och desktop.

**Ingår inte**
- Nya produktfeatures.

### Förutsättningar

- DEV-018 completed.

### Implementation

- Kör definierad acceptance checklist.
- Fixa browser-/layout-/offlinefel inom stegets acceptance scope.
- Dokumentera kända icke-blockerande skillnader.

### Verifiering

- UC-001–UC-007.
- FR/NFR Must acceptance.
- Offline efter reload/start.
- Backup/restore på minst en mobil- och en desktopplattform.

### Klart-kriterier

- [ ] Must-scope passerar på målplattformarna.
- [ ] Inga blockerande PWA/offline/browserproblem återstår.
- [ ] Eventuella begränsningar är dokumenterade.

### Beroenden

- DEV-018.

## DEV-020 – Release- och deploymentförberedelser

### Mål

Göra version 1 reproducerbart byggbar, deploybar och redo för releasebedömning.

### Scope

**Ingår**
- Produktionsbuild.
- GitHub Actions för build/test/lint där repository ligger på GitHub.
- Statisk hostingprofil, initialt GitHub Pages om inget annat beslut krävs.
- PWA base path/fallback/caching för vald hosting.
- Slutlig README för installation/användning/backup.
- Versionsmetadata.

**Ingår inte**
- Backend/infrastruktur utanför statisk hosting.

### Förutsättningar

- DEV-019 completed.

### Implementation

- Etablera CI.
- Etablera deploymentworkflow/profil.
- Säkerställ HTTPS och korrekta PWA paths.
- Förbered release notes/checklist.

### Verifiering

- Clean CI run.
- Produktionsbuild från ren checkout.
- Deployad PWA smoke test online + offline.
- Release-readiness kontroll mot canonical dokumentation.

### Klart-kriterier

- [ ] CI passerar från ren checkout.
- [ ] Appen kan deployas reproducerbart.
- [ ] Deployad version är installerbar och fungerar offline.
- [ ] Canonical docs motsvarar implementerat system.
- [ ] Projektet kan gå vidare till final release readiness/release.

### Beroenden

- DEV-019.

## Cross-cutting verification

Följande gäller genom hela implementationen:

- Varje DEV-steg ska köra minst den verification som anges i steget plus relevant regression.
- `build`, `test`, `lint` och typecheck ska hållas gröna efter att de etablerats.
- Persistence- och backupändringar kräver migrations-/round-trip-regression.
- Ändringar av service worker/PWA kräver offline-regression.
- Ändringar av domänregler kräver unit tests.
- UX-steg som påverkar huvudflödet ska manuellt verifieras på smal mobil viewport och desktopviewport.
- Importerad backup ska alltid behandlas som opålitlig data och aldrig renderas som osanerad HTML.
- Ett steg markeras inte `completed` vid blockerad eller failed required verification.

## Plan-change rules

Planen är styrande för avsedd ordning men får ändras när faktisk evidens kräver det.

- Nya blockerande risker går före nästa numeriska DEV-ID.
- Ett steg får splittras om det visar sig innehålla flera oberoende/riskfyllda leveranser.
- Ett nytt steg får infogas med nytt, aldrig tidigare använt DEV-ID; existerande ID:n behåller sin betydelse.
- Scope som inte behövs för första release ska i första hand defereras i stället för att växa in i ett aktivt steg.
- `.system-builder/work-status.yaml` är canonical källa för faktisk exekveringsstatus när implementationen har startat.
- Normal implementation ska sluta efter exakt ett completed development step.

## Planning completion

När denna plan tillsammans med funktionell specifikation, riskanalys och arkitektur är validerad är PLAN-fasen klar.

Nästa CREATE-transition är **Planning handoff ZIP**:

1. skapa/validera canonical project state,
2. skapa `.system-builder/project.yaml` och `.system-builder/work-status.yaml`,
3. paketera komplett projektcheckpoint med dokumentation och startstruktur,
4. verifiera att ZIP-filen kan återupptas utan konversationsminne,
5. sätt `next.recommended = DEV-001`,
6. stoppa utan att implementera DEV-001.

## Genomförandeavvikelse 2026-09-28

Användaren bad uttryckligen att browserprovet skulle hoppas över och att planen skulle fortsätta till slutet. Därför ersätts de manuella browser- och live-deploymentkontrollerna i DEV-007, DEV-008, DEV-016, DEV-019 och DEV-020 med statisk PWA-validering, lokala enhets-/integrations-/komponenttester och dokumenterad avvikelse. Detta är inte ett påstående om faktiskt provad Safari, Chromium, offline-start eller publicerad URL. ZIP-leveransen kan färdigställas; live deployment bedöms separat i `docs/release-readiness.md`.
