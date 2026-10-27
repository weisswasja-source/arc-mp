# Raider Exchange

Eine Tauschbörse für **Arc Raiders**: Spieler melden sich an, stellen Items aus ihrem Lager ein, machen sich gegenseitig Tauschvorschläge und vereinbaren den Deal, bevor sie im Spiel übergeben.

> Fan-Projekt, nicht mit Embark Studios verbunden.

## Funktionen

- **Startseite** mit Ablauf und den neuesten Angeboten
- **Marktplatz** (`/markt`) mit Suche, Kategorie-, Seltenheits- und Plattformfilter
- **Angebotsdetail** (`/angebot/:id`) mit Spielerprofil und „Tausch vorschlagen“
- **Meine Tauschgeschäfte** (`/tausch`) – eingehende und gesendete Vorschläge annehmen, ablehnen, zurückziehen, Übergabe bestätigen
- **Angebot erstellen** – zweistufiger Dialog: Was biete ich? Was suche ich?
- Anmelde-/Registrierungsdialog

Aktuell arbeitet die App mit Beispieldaten (`src/data/fixtures.ts`); Änderungen leben im Browser-Speicher und sind nach einem Neuladen zurückgesetzt.

## Technik

- TanStack Start (React 19, TanStack Router) auf Netlify
- Tailwind CSS 4 + shadcn/ui-Komponenten, Icons von lucide-react
- Netlify Image CDN für das Hero-Bild
- Geplant: Netlify Identity (Konten) und Netlify Database (Angebote, Tausche)

## Lokal starten

```bash
pnpm install
netlify dev   # oder: pnpm dev (ohne Netlify-Features wie Image CDN)
```

## Roadmap

Nächste Schritte sind echte Konten mit Netlify Identity, das Datenmodell in Netlify Database und das Speichern von Angeboten und Tauschvorschlägen. Details in [PLAN.md](PLAN.md).
