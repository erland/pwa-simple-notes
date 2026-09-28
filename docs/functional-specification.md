# Simple Notes – Funktionell specifikation

## 1. Syfte och mål

Simple Notes är en personlig anteckningsapp som ska fungera som ett digitalt alternativ till ett vanligt pappersanteckningsblock. Appens viktigaste egenskap är att användaren ska kunna öppna den och börja anteckna omedelbart, utan att först välja dokument, mapp eller anteckningsbok.

Anteckningar organiseras i ett löpande kronologiskt flöde. Användaren ska kunna skapa tillfälliga sektioner för ett ämne eller möte, markera anteckningar som åtgärder eller viktiga, hitta dessa markeringar i särskilda vyer samt säkerhetskopiera och återställa all lokal data.

### 1.1 Primära mål

- Göra det möjligt att börja skriva med så få steg som möjligt.
- Bevara känslan av ett löpande anteckningsblock snarare än separata dokument.
- Göra åtgärder och viktiga anteckningar lätta att hitta utan att flytta dem ur sitt ursprungliga sammanhang.
- Fungera fullt ut offline efter installation/laddning.
- Fungera väl på telefon, surfplatta och dator.
- Ge användaren kontroll över sin data genom lokal lagring, backup och återställning.

### 1.2 Framgångskriterier för första versionen

Första versionen betraktas som funktionellt lyckad när en användare kan:

1. öppna appen och omedelbart börja skriva,
2. skapa och avsluta sektioner,
3. skapa mötessektioner med titel, tid och deltagare,
4. markera en anteckning som åtgärd och senare avsluta den med en lösningsbeskrivning,
5. markera en anteckning som viktig och hitta den igen,
6. söka i sitt innehåll,
7. använda appen utan nätverksanslutning,
8. exportera fullständig backup till en fil och återställa från en sådan fil.

## 2. Scope

### 2.1 Must – första versionen

- Löpande kronologiskt anteckningsflöde.
- Direkt tillgängligt skrivläge när appen öppnas.
- Textbaserade anteckningsblock med skapandetid.
- Redigering av befintliga textanteckningar.
- Vanliga sektioner med titel.
- Mötessektioner med titel, tid och deltagare.
- Aktiv sektion som efterföljande anteckningar automatiskt kopplas till.
- Möjlighet att avsluta aktiv sektion så att efterföljande anteckningar blir fristående.
- Markering av anteckningsblock som åtgärd.
- Vy över öppna åtgärder.
- Möjlighet att slutföra en åtgärd och ange hur den löstes.
- Markering av anteckningsblock som viktigt.
- Vy över viktiga anteckningar.
- Sökning i anteckningstext, sektionstitlar, mötestitlar, deltagare och åtgärdslösningar.
- Lokal lagring på enheten.
- Offlinefunktion.
- Export av fullständig backup till fil.
- Återställning från fullständig backupfil.
- Responsivt gränssnitt för telefon, surfplatta och dator.
- Installerbar PWA.

### 2.2 Should

- Tydlig visuell markering av vilken sektion som är aktiv.
- Snabbvägar för att markera en anteckning som åtgärd eller viktig.
- Filtrering av åtgärder, exempelvis öppna/slutförda.
- Möjlighet att navigera från en träff i Åtgärder/Viktigt/Sök tillbaka till anteckningens ursprungliga plats i flödet.
- Bekräftelse och tydlig konsekvensbeskrivning före destruktiv återställning.
- Möjlighet att exportera backup även när appen är offline.

### 2.3 Could

- Färg eller enkel typmarkering för sektioner.
- Manuell sorterings-/filterinställning för särskilda vyer.
- Export av läsbart utdrag, exempelvis Markdown, utöver systembackup.
- Enkel statistik, exempelvis antal öppna åtgärder.

### 2.4 Out of scope för första versionen

- Bilder och andra bilagor.
- Molnsynkronisering mellan enheter.
- Backend/server.
- Fleranvändarstöd och delade anteckningar.
- Konton, inloggning och behörighetsroller.
- Rich text, handskrift och ritning.
- Kalenderintegration.
- Automatisk transkribering eller AI-funktioner.

Bilder/bilagor är en uttrycklig framtida utvecklingsriktning och ska beaktas i informationsmodell och backupdesign.

## 3. Aktörer

### 3.1 Användare

Den enda aktören i första versionen är den person som använder den lokalt installerade appen. Användaren äger och hanterar sina lokala anteckningar, åtgärder, sektioner och backupfiler.

## 4. Centrala användningsfall

### UC-001 – Skriva en fristående anteckning

**Primär aktör:** Användare  
**Mål:** Fånga en tanke så snabbt som möjligt.

Huvudflöde:
1. Användaren öppnar appen.
2. Skrivfältet är direkt tillgängligt utan föregående navigering.
3. Användaren skriver text och sparar/skapar anteckningen.
4. Systemet registrerar automatiskt skapandetid.
5. Anteckningen visas i det löpande flödet.

Resultat: En ny fristående anteckning finns i kronologisk ordning.

### UC-002 – Starta och avsluta en vanlig sektion

**Primär aktör:** Användare  
**Mål:** Gruppera efterföljande anteckningar under ett ämne.

Huvudflöde:
1. Användaren väljer att skapa en ny sektion.
2. Användaren anger en titel.
3. Sektionen blir aktiv.
4. Nya anteckningar kopplas automatiskt till den aktiva sektionen.
5. Användaren väljer Avsluta sektion.
6. Därefter skapas nya anteckningar fristående tills en ny sektion startas.

### UC-003 – Starta en mötessektion

**Primär aktör:** Användare  
**Mål:** Samla anteckningar från ett möte utan att lämna det löpande flödet.

Huvudflöde:
1. Användaren skapar en ny sektion och väljer typen Möte.
2. Systemet föreslår aktuell tid som mötestid.
3. Användaren anger titel och kan justera tiden.
4. Användaren kan ange en eller flera deltagare.
5. Mötessektionen blir aktiv.
6. Efterföljande anteckningar kopplas till mötet tills sektionen avslutas.

### UC-004 – Skapa och slutföra en åtgärd

**Primär aktör:** Användare  
**Mål:** Göra en anteckning uppföljningsbar.

Huvudflöde:
1. Användaren markerar ett anteckningsblock som åtgärd.
2. Åtgärden visas både i sitt ursprungliga sammanhang och i vyn Åtgärder.
3. Användaren öppnar eller väljer åtgärden i valfri relevant vy.
4. Användaren markerar den som slutförd.
5. Användaren anger en lösningsbeskrivning.
6. Systemet registrerar slutförandetid.

Resultat: Åtgärden behåller sin ursprungliga anteckning men visas som slutförd tillsammans med lösningen.

### UC-005 – Markera och återfinna viktig information

**Primär aktör:** Användare  
**Mål:** Kunna hitta särskilt betydelsefull information senare.

Huvudflöde:
1. Användaren markerar ett anteckningsblock som viktigt.
2. Markeringen syns i det ordinarie flödet.
3. Anteckningen blir tillgänglig i vyn Viktigt.
4. Från Viktigt-vyn kan användaren navigera tillbaka till anteckningens ursprungliga sammanhang.

### UC-006 – Säkerhetskopiera data

**Primär aktör:** Användare  
**Mål:** Skapa en portabel fullständig kopia av appens data.

Huvudflöde:
1. Användaren väljer Skapa backup.
2. Systemet samlar all användardata som behövs för fullständig återställning.
3. Systemet skapar en backupfil med format-/versionsinformation.
4. Användaren sparar filen på valfri plats som operativsystemet/webbläsaren tillåter.

### UC-007 – Återställa data

**Primär aktör:** Användare  
**Mål:** Återställa appens innehåll från tidigare backup.

Huvudflöde:
1. Användaren väljer Återställ backup.
2. Användaren väljer en backupfil.
3. Systemet validerar filens format och version innan befintliga data påverkas.
4. Systemet visar att återställningen ersätter nuvarande lokala data och kräver uttrycklig bekräftelse.
5. Efter bekräftelse ersätts nuvarande data med backupens innehåll.
6. Systemet verifierar att återställd data kan läsas och presenterar resultatet.

Alternativt flöde:
- Om backupfilen är ogiltig eller inte stöds ska ingen befintlig data ändras.

## 5. Funktionella krav

### 5.1 Anteckningsflöde

**FR-001 – Direkt anteckningsläge (Must)**  
När appen öppnas ska användaren kunna börja skriva en ny anteckning utan att först skapa eller välja dokument, mapp, sektion eller annan struktur.

**FR-002 – Kronologiskt flöde (Must)**  
Systemet ska presentera anteckningar och sektioner som ett sammanhängande kronologiskt flöde.

**FR-003 – Skapandetid (Must)**  
Varje anteckningsblock ska få en automatiskt registrerad skapandetid som bevaras även om innehållet senare redigeras.

**FR-004 – Ändringstid (Must)**  
När en anteckning redigeras ska systemet kunna registrera senaste ändringstid utan att skriva över ursprunglig skapandetid.

**FR-005 – Redigera anteckning (Must)**  
Användaren ska kunna redigera texten i ett befintligt anteckningsblock.

### 5.2 Sektioner och möten

**FR-010 – Skapa sektion (Must)**  
Användaren ska kunna skapa en sektion med titel för att gruppera efterföljande anteckningar.

**FR-011 – Aktiv sektion (Must)**  
Högst en sektion får vara aktiv åt gången. Nya anteckningar ska automatiskt kopplas till den aktiva sektionen.

**FR-012 – Avsluta sektion (Must)**  
Användaren ska kunna avsluta den aktiva sektionen. Efter avslut ska nya anteckningar vara fristående tills en ny sektion startas.

**FR-013 – Mötessektion (Must)**  
Användaren ska kunna skapa en sektion av typen Möte med titel, mötestid och deltagare.

**FR-014 – Föreslagen mötestid (Must)**  
Vid skapande av en mötessektion ska systemet föreslå aktuell lokal tid, som användaren kan justera före eller efter skapandet.

**FR-015 – Mötesdeltagare (Must)**  
Användaren ska kunna registrera noll eller flera deltagare för en mötessektion.

### 5.3 Åtgärder

**FR-020 – Markera som åtgärd (Must)**  
Användaren ska kunna markera ett befintligt anteckningsblock som en åtgärd utan att anteckningen flyttas från sitt ursprungliga sammanhang.

**FR-021 – Visa öppna åtgärder (Must)**  
Systemet ska tillhandahålla en vy som samlar alla öppna åtgärder.

**FR-022 – Slutföra åtgärd (Must)**  
Användaren ska kunna markera en öppen åtgärd som slutförd.

**FR-023 – Lösningsbeskrivning (Must)**  
När en åtgärd slutförs ska användaren kunna ange hur den löstes. Lösningsbeskrivningen ska sparas tillsammans med åtgärden.

**FR-024 – Slutförandetid (Must)**  
Systemet ska registrera när en åtgärd slutfördes.

**FR-025 – Bevara kontext (Must)**  
En åtgärd ska alltid kunna visas tillsammans med information om sin ursprungliga anteckning och, när relevant, sektion/möte.

### 5.4 Viktiga anteckningar

**FR-030 – Markera som viktig (Must)**  
Användaren ska kunna markera ett anteckningsblock som viktigt och ta bort markeringen igen.

**FR-031 – Viktigt-vy (Must)**  
Systemet ska tillhandahålla en vy som samlar alla anteckningar som för närvarande är markerade som viktiga.

**FR-032 – Bevara viktig antecknings kontext (Must)**  
Från Viktigt-vyn ska användaren kunna identifiera och nå anteckningens ursprungliga sammanhang i flödet.

### 5.5 Sökning

**FR-040 – Sökning (Must)**  
Användaren ska kunna söka i anteckningstext, sektionstitlar, mötestitlar, deltagare och åtgärders lösningsbeskrivningar.

**FR-041 – Navigera från sökträff (Should)**  
Användaren bör kunna navigera från en sökträff till motsvarande plats i det kronologiska flödet.

### 5.6 Backup och återställning

**FR-050 – Fullständig backup (Must)**  
Systemet ska kunna exportera all information som krävs för att återställa appens aktuella innehåll till en enda backupfil.

**FR-051 – Versionsinformation i backup (Must)**  
Backupfilen ska innehålla information som gör att systemet kan identifiera backupformatets version.

**FR-052 – Offline-backup (Must)**  
Backup ska kunna skapas utan nätverksanslutning.

**FR-053 – Validera före återställning (Must)**  
Systemet ska validera vald backupfil innan befintlig lokal data ändras.

**FR-054 – Bekräfta ersättande återställning (Must)**  
Första versionens återställning ska ersätta befintligt lokalt innehåll. Användaren ska uttryckligen bekräfta detta innan återställningen utförs.

**FR-055 – Atomisk återställning ur användarperspektiv (Must)**  
Om backupen inte kan valideras eller återställningen misslyckas före slutförd import ska systemet så långt möjligt lämna den tidigare användardatan oförändrad och informera användaren om felet.

### 5.7 PWA och offline

**FR-060 – Installerbar PWA (Must)**  
Appen ska kunna installeras som PWA på plattformar som stödjer detta.

**FR-061 – Offlineanvändning (Must)**  
Efter att nödvändiga appresurser har laddats minst en gång ska centrala funktioner för anteckningar, sektioner, åtgärder, viktigt, sökning, backup och återställning fungera utan nätverksanslutning.

## 6. Affärsregler

**BR-001 – Ett löpande flöde**  
Allt primärt anteckningsinnehåll tillhör samma kronologiska anteckningsflöde. Sektioner får inte kräva att användaren arbetar i separata dokument.

**BR-002 – Högst en aktiv sektion**  
Det får finnas högst en aktiv sektion åt gången.

**BR-003 – Sektionstillhörighet vid skapande**  
En anteckning kopplas vid skapandet till den sektion som då är aktiv. Att sektionen senare avslutas tar inte bort denna koppling.

**BR-004 – Markering ändrar inte placering**  
Att markera en anteckning som åtgärd eller viktig får inte flytta eller duplicera dess primära innehåll i anteckningsflödet.

**BR-005 – Skapandetid är beständig**  
Ursprunglig skapandetid får inte förändras av vanlig redigering.

**BR-006 – Åtgärdsstatus**  
En åtgärd är antingen öppen eller slutförd. En slutförd åtgärd ska behålla slutförandetid och eventuell lösningsbeskrivning.

**BR-007 – Restore ersätter i version 1**  
Återställning i första versionen är en fullständig ersättande återställning och inte en sammanslagning med befintliga lokala data.

## 7. Informationsbehov

### 7.1 Anteckningsblock

Systemet behöver minst hantera:
- stabil identitet,
- textinnehåll,
- skapandetid,
- senaste ändringstid,
- eventuell koppling till sektion,
- markering som viktig,
- eventuell åtgärdsstatus,
- åtgärdens slutförandetid,
- eventuell lösningsbeskrivning.

### 7.2 Sektion

Systemet behöver minst hantera:
- stabil identitet,
- typ: vanlig eller möte,
- titel,
- skapandetid,
- starttid,
- eventuell avslutningstid,
- aktiv/avslutad status.

### 7.3 Mötesinformation

För mötessektioner behövs dessutom:
- mötestid,
- deltagare.

### 7.4 Backupmetadata

Backup behöver minst innehålla:
- backupformatets version,
- när backupen skapades,
- information som krävs för att återställa samtliga objekt och relationer.

Informationsmodellen ska kunna utökas med bilagor i senare version utan att anteckningarnas stabila identiteter behöver ersättas.

## 8. Integrationer

Första versionen har inga obligatoriska externa tjänsteintegrationer.

Operativsystemets/webbläsarens standardfunktioner används för:
- installation av PWA,
- val av backupfil vid återställning,
- nedladdning/sparande av backupfil.

## 9. Behörighet och dataägande

- Första versionen har ingen inloggning och inga roller.
- All data tillhör den lokala användaren på den aktuella webbläsarprofilen/enheten.
- Appen ska inte kräva extern tjänst för att läsa eller skriva användarens anteckningar.
- Backupfilen betraktas som användarägd data och ska kunna lagras på valfri plats som enheten tillåter.

## 10. Fel- och undantagsfall

- Om lokal lagring inte är tillgänglig ska användaren informeras tydligt och appen ska inte låtsas att anteckningar är säkert sparade.
- Om lagringsutrymmet tar slut ska användaren informeras och osparad data ska så långt möjligt bevaras i aktuell vy tills användaren kan agera.
- Om en backupfil är ogiltig ska återställning avbrytas utan att befintlig data skrivs över.
- Om backupformatets version inte stöds ska användaren informeras och data inte ändras.
- Om PWA-resurser inte ännu har cachats och nätverket saknas får appen tydligt förklara att första laddningen kräver nätverk.
- Om en aktiv sektion redan finns när användaren vill starta en ny ska systemet kräva att den föregående avslutas eller avsluta den som en explicit del av användarens val; systemet får inte skapa två parallellt aktiva sektioner.

## 11. Icke-funktionella krav

**NFR-001 – Snabb start (Must)**  
Den primära anteckningsytan ska prioriteras vid start. Normal användning ska inte kräva navigering genom en startsida eller dokumentväljare.

**NFR-002 – Offline first (Must)**  
Centrala användarflöden ska vara designade för lokal/offline användning och får inte vara beroende av nätverksanrop.

**NFR-003 – Responsivitet (Must)**  
Appen ska vara praktiskt användbar på mobiltelefon, surfplatta och desktop, inklusive touch- och tangentbordsinteraktion.

**NFR-004 – Databeständighet (Must)**  
Vanlig omladdning, stängning och återöppning av appen eller installation av ny appversion får inte avsiktligt radera användarens lokala anteckningsdata.

**NFR-005 – Portabilitet via backup (Must)**  
Backupformatet ska vara versionsmärkt och utformat så att framtida appversioner kan migrera äldre backupdata när det är rimligt.

**NFR-006 – Prestanda i växande flöde (Must)**  
Appen ska utformas så att ett växande antal anteckningar inte kräver att hela datamängden renderas samtidigt för normal användning.

**NFR-007 – Tillgänglighet (Should)**  
Grundläggande funktioner ska kunna användas med tangentbord och semantiska kontroller ska ha begripliga etiketter för hjälpmedel.

**NFR-008 – Integritet (Must)**  
Första versionen ska inte överföra anteckningsinnehåll till extern tjänst som en del av normal användning.

## 12. Acceptance criteria

**AC-001 – Direkt anteckning**  
Givet att appen är startad ska användaren kunna skriva och skapa en ny fristående anteckning direkt från huvudvyn utan att först välja en behållare eller skapa ett dokument.

**AC-002 – Tidsstämpling**  
När en anteckning skapas ska dess skapandetid sparas och förbli oförändrad efter senare redigering.

**AC-003 – Sektion**  
När en sektion är aktiv ska nya anteckningar kopplas till den; efter Avsluta sektion ska nästa nya anteckning sakna sektionskoppling.

**AC-004 – Möte**  
När användaren skapar en mötessektion ska aktuell lokal tid föreslås och användaren ska kunna ändra den samt registrera deltagare.

**AC-005 – Åtgärd**  
När en anteckning markeras som åtgärd ska den synas i Öppna åtgärder utan att försvinna från sitt ursprungliga flöde.

**AC-006 – Slutförd åtgärd**  
När en åtgärd slutförs ska status, slutförandetid och angiven lösning kunna återfinnas efter omladdning av appen.

**AC-007 – Viktigt**  
När en anteckning markeras som viktig ska den synas i Viktigt-vyn och kunna kopplas tillbaka till sitt ursprungliga sammanhang.

**AC-008 – Offline**  
Efter en tidigare lyckad laddning ska användaren utan nätverk kunna skapa, redigera och läsa anteckningar samt hantera sektioner, åtgärder och viktigt-markeringar.

**AC-009 – Backup/restore**  
En backup skapad från en datamängd ska efter fullständig återställning återskapa motsvarande anteckningar, sektioner, mötesinformation, åtgärdsstatus, lösningsbeskrivningar och viktigt-markeringar.

**AC-010 – Ogiltig backup**  
Om användaren väljer en ogiltig backupfil ska befintlig användardata inte ersättas.

**AC-011 – Responsiv användning**  
Huvudflöde, skrivyta, sektioner och specialvyer ska kunna användas utan horisontell sidscrollning på en normal mobilskärm och fungera även på desktop.

## 13. Out of scope – uttryckligen uppskjutet

Följande ska inte smygas in i första versionen:
- synk mellan flera enheter,
- användarkonton,
- delning/samarbete,
- serverlagring,
- foto/bildbilagor,
- filbilagor,
- rich text,
- kalenderkoppling,
- notifieringar/påminnelser,
- AI-sammanfattningar eller AI-sökning.

## 14. Öppna frågor

Inga öppna frågor blockerar nästa planeringssteg.

Följande är medvetna produktval för version 1 och kan omprövas senare:
- återställning ersätter all lokal data i stället för att slå samman,
- markering som åtgärd/viktigt görs på ett anteckningsblock, inte på godtyckligt textspann inne i ett block,
- sektioner är inline-gruppering i ett enda flöde och inte separata dokument,
- första versionen är en lokal single-user-app utan backend eller synk.
