# Installation och publicering

## Lokalt

Installera Node.js 22 eller senare. Kör `npm ci`, `npm run dev` för utveckling eller `npm run build` följt av `npm run preview` för produktionsbuild. Öppna adressen som kommandot visar. HTTPS krävs för service worker på andra adresser än localhost.

## GitHub Pages

1. Lägg projektet i ett GitHub-repository.
2. I repositoryinställningarna, välj **Pages → Build and deployment → Source: GitHub Actions**.
3. Push till default branch startar `.github/workflows/pages.yml`. CI-valideringen körs vid PR och push.
4. Projektets Pages-path härleds från repositorynamnet. Öppna URL:en som deploy-jobbet visar. För ett projekt-repo blir den normalt `https://<owner>.github.io/<repo>/`.
5. Ladda sidan online första gången innan du använder den offline. Installera via webbläsarens vanliga meny där det stöds.

Publicering ändrar appens origin om man byter URL/domän. IndexedDB följer inte automatiskt med. Exportera en `.snotes`-backup från den gamla platsen och återställ den på den nya.

Inga GitHub-credentials eller backendnycklar ska placeras i frontend-koden. Pages-workflowen begär bara de rättigheter som behövs för publicering.
