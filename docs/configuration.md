# Konfiguration

Simple Notes är en statisk PWA utan backend, konton eller runtime-hemligheter. Användardata lagras i IndexedDB under webbplatsens origin och path påverkar service workerns scope.

| Inställning | Ägare | Beskrivning |
|---|---|---|
| `GITHUB_REPOSITORY` | GitHub Actions | Byggsökväg för projektets Pages-site, `/<repo>/`; ett `<owner>.github.io`-repo använder `/`. |
| `GITHUB_ACTIONS` | GitHub Actions | Aktiverar Pages-base i Vite. Lokala byggen använder `/`. |
| `package.json` version | Projektet | Kanonisk appversion för leverans. |
| `DATABASE_VERSION` | `src/persistence/database.ts` | IndexedDB-schema; uppgraderas utan att tömma data. |
| `BACKUP_FORMAT_VERSION` | `src/application/backup.ts` | Fristående backupformat; ökas vid inkompatibel formatändring. |

Manifestets `start_url` och `scope` är relativa till publiceringsplatsen. Ingen databas- eller API-URL krävs.
