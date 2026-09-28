# Drift och datahantering

Simple Notes körs som statiska filer. GitHub Pages har ingen applikationsserver, databasdrift eller serverlogg för anteckningsinnehåll.

## Hälsa och felsökning

- Öppna appen online och kontrollera att skrivytan visas. Använd produktionsbyggets `npm run verify:pwa` för statisk manifest- och service worker-kontroll.
- Om lokal databas inte kan öppnas visas ett fel. Kontrollera lagringsutrymme och webbläsarens webbplatsdata. Rensa inte webbplatsdata innan backup har säkrats.
- Om en anteckning inte går att spara visas ett fel och osparad text står kvar i skrivytan eller redigeringsformuläret.
- Vid uppdateringsmeddelande: spara aktuell text och ladda om när det passar. Appskalets cache innehåller statiska filer; anteckningar finns i IndexedDB.

## Backup och återställning

Ladda ned backup under **Data** regelbundet och förvara minst en kopia utanför enheten. Filen är vanlig JSON med ändelsen `.snotes`, utan kryptering. Hantera den som privat information. Återställning visar innehållssammanfattning och kräver uttryckligt val innan all lokal data ersätts. Ogiltig fil påverkar inte befintlig data.

## Uppgradering och rollback

Nytt appskal kan publiceras på samma URL. IndexedDB-schema migreras vid öppning och får inte nollställas av deployment. En rollback av statiska filer efter databasmigrering kan ge en äldre klient som inte känner till ett nyare schema. Exportera en backup före större versionsbyten och verifiera migrationsväg före release. Vid flytt av origin används export/import, inte manuell kopiering av browserfiler.
