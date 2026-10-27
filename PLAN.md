# Raider Exchange – Roadmap

Raider Exchange ist ein Marktplatz, auf dem sich Arc-Raiders-Spieler anmelden, Items anbieten und Tauschgeschäfte vereinbaren. Die Roadmap ist in kleine, abgeschlossene Meilensteine aufgeteilt.

## 1. Produktoberfläche ✅

- Startseite mit Hero, Ablauf und neuesten Angeboten
- Marktplatz mit Suche, Kategorie-, Seltenheits- und Plattformfilter sowie Sortierung
- Angebots-Detailseite mit Spielerprofil und „Tausch vorschlagen“-Dialog
- „Meine Tauschgeschäfte“ (eingehend, gesendet, Verlauf) mit Annehmen, Ablehnen, Zurückziehen und Übergabe bestätigen
- Dialog „Angebot erstellen“ (Items aus dem Lager wählen, Wunsch-Items, Notiz)
- Anmelde- und Registrierungsdialog
- Alle Daten kommen aus `src/data/fixtures.ts`, der Zustand liegt im Speicher (`src/lib/session.tsx`)

## 2. Konten mit Netlify Identity

- Registrierung, Login, Logout und Passwort-Reset über `@netlify/identity`
- `AuthDialog` und `SessionProvider` an echte Identity-Nutzer anbinden
- Raider-Name, Plattform und Region beim ersten Login als Profil abfragen
- Geschützte Server-Funktionen: nur angemeldete Spieler dürfen schreiben

## 3. Datenmodell in Netlify Database

- Drizzle-Schema in `db/schema.ts`: `items` (Katalog), `players` (Profil, verknüpft mit Identity-ID), `inventory`, `listings` + `listing_items`, `trade_offers` + `trade_offer_items`
- Item-Katalog aus den Fixtures als Seed übernehmen
- Lese-Endpunkte für Marktplatz (inkl. Filter/Suche serverseitig) und Angebotsdetail; Screens auf Route-Loader umstellen

## 4. Angebote und Tauschvorschläge speichern

- Server-Funktionen: Angebot erstellen/schließen, Vorschlag senden, annehmen, ablehnen, zurückziehen, Übergabe bestätigen
- Statusübergänge serverseitig prüfen (nur Empfänger darf annehmen, beide bestätigen die Übergabe)
- Angebot automatisch schließen, wenn ein Tausch abgeschlossen wurde

## 5. Lager und Profile

- Eigenes Lager pflegen (Items hinzufügen/entfernen) statt fester Fixture-Liste
- Öffentliche Profilseite `/raider/$name` mit aktiven Angeboten und Bewertungen

## 6. Vertrauen und Kommunikation

- Bewertung nach abgeschlossenem Tausch (1–5 Sterne + Kommentar), Durchschnitt im Profil
- Kurzer Nachrichtenverlauf pro Tauschvorschlag (Treffpunkt, Uhrzeit)
- Melden von Nutzern/Angeboten, einfache Moderationsansicht

## 7. Feinschliff

- Benachrichtigungen (Badge + optional E-Mail) bei neuen Vorschlägen
- Paginierung bzw. unendliches Scrollen im Marktplatz
- Item-Grafiken im Katalog, Teilen-Vorschau (Open Graph) pro Angebot
