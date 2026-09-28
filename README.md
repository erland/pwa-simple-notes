# Simple Notes

Simple Notes är en personlig, textbaserad antecknings-PWA utan backend. Den har ett kronologiskt flöde där du kan skriva direkt, gruppera i sektioner och möten, följa upp åtgärder, markera viktigt och söka. Data lagras lokalt i IndexedDB och kan exporteras till eller återställas från en `.snotes`-fil.

## Kom igång lokalt

Kräver Node.js 22 eller senare. Kör `npm ci` och `npm run dev`; öppna adressen som Vite visar. För ett lokalt produktionsbygge: `npm run build` följt av `npm run preview`.

## Verifiera

Kör `npm run build`, `npm run verify:pwa`, `npm run test`, `npm run lint` och `npm run typecheck`.

## Säkerhetskopiering

Anteckningar finns bara i aktuell webbläsarprofil och origin. Gå till **Data** och ladda ned en backup regelbundet; spara filen utanför enheten. Återställning ersätter alla nuvarande anteckningar efter validering och uttrycklig bekräftelse. Filen innehåller okrypterad text.

## Projekt och publicering

`src/domain` innehåller regler, `src/application` användningsfall och backup, `src/persistence` IndexedDB, `src/ui` gränssnittet och `src/infrastructure` browserfunktioner. De styrande dokumenten och utvecklingsplanen finns i `docs/`; exekveringsstatus finns i `.system-builder/`.

Publicering med GitHub Pages beskrivs i `docs/installation.md`. Konfiguration och drift finns i `docs/configuration.md` och `docs/operations.md`. Releasebedömningen finns i `docs/release-readiness.md`. Ingen live deployment har utförts. Browserbaserad offline- och plattformsacceptans avstods på användarens begäran.
