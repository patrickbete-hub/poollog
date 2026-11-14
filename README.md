# PoolLog 0.1 – Entwicklungs-MVP

Next.js / TypeScript / Supabase. **Nicht produktionsreif, nicht für rechtsverbindliche Hygieneprotokolle freigegeben.** Keine Schnittstelle zu dinotec oder zum Hotelnetzwerk.

## Lokal starten

1. Node.js 20 oder neuer installieren.
2. `npm install`
3. Neues Supabase-Projekt anlegen; SQL aus `supabase/schema.sql` im SQL-Editor ausführen.
4. `.env.example` nach `.env.local` kopieren und Projekt-URL sowie **öffentlichen** Supabase-Anon-/Publishable-Key eintragen. Niemals Service-Role-Key im Browser verwenden.
5. In Supabase Authentication einen Benutzer anlegen (E-Mail und Passwort). E-Mail-Bestätigung je nach Projekteinstellung durchführen.
6. Im SQL-Editor einen Hotel-Datensatz anlegen und ein Benutzerprofil zuordnen:

```sql
insert into public.hotels(name) values ('Mein Hotel') returning id;
-- UUID aus dem vorherigen Ergebnis verwenden.
-- Benutzer-ID aus Supabase Authentication > Users verwenden.
insert into public.profiles(id,hotel_id,role)
values ('AUTH-USER-UUID','HOTEL-UUID','staff');
```

7. Für die Freigabe einen **zweiten** Auth-Benutzer mit Profilrolle `manager` im selben Hotel anlegen. Eine Person darf ihr eigenes Protokoll nicht freigeben.
8. `npm run dev` und `http://localhost:3000` öffnen.

## Enthalten

- Login per Supabase Auth (nur zuvor angelegte Benutzer)
- Ein Tagesprotokoll pro Hotel und Tag; verantwortlicher Mitarbeiter
- Morgen- und Abendrunde; 8 manuelle Beckenproben und 7 dinotec-Ablesestellen je Runde
- Vier Filterkreisläufe: Innen/Außen; Plansch/Rutsche/Warm; Whirlpool; Kaltbecken Innen/Außen
- Gemeinsame dinotec-Ablesung Kaltbecken, getrennte Photometerproben
- Tagesdaten, Betriebskontrollen, Desinfektion, Bodensaugung
- Datenbankspeicherung, Hoteltrennung per RLS, Änderungsprotokoll
- Einreichen, Rückgabe, Freigabe serverseitig per Datenbankfunktion

## Grenzen / nächste Entwicklungsschritte

- **Keine Grenzwertprüfung** und keine rechtliche Validierung. Messintervalle und Pflichtfelder sind mit Betriebsleitung und Hygienevorgaben abzustimmen.
- Gesamtchlor als vorläufiges Eingabefeld gemäß Papierbogen; noch fachlich bestätigen.
- `Füllwasser` ist wegen unklarer Bedeutung noch nicht implementiert.
- Keine digitale Unterschrift, keine Nachtragskorrektur nach Freigabe, keine Benutzeradministration in der UI.
- Audit-Tabelle protokolliert Datensatzänderungen; nicht als manipulationssicherer Langzeitnachweis zu betrachten.
- Protokollstatus ist in dieser Version ein einfacher Workflow; vor Produktion serverseitige Tests, Monitoring, Backups, Aufbewahrung, Datenschutz, Sicherheitsprüfung, Revisions- und Löschkonzept ergänzen.
- Ein Protokoll wird beim Einreichen derzeit nur auf 16 gespeicherte Messstellen-Einträge geprüft, **nicht** auf alle betrieblichen Pflichtangaben.
- Ein einzelner Mitarbeiter verantwortet den Tag; andere Mitarbeiter dürfen sein Tagesprotokoll nicht bearbeiten.
- Supabase-Tabellen und Hotel-/Benutzerprofile sind zunächst administrativ einzurichten. Keine automatische Hotelregistrierung.

## Datensicherheit

Die Datenbank-RLS isoliert Hotelmandanten. Die clientseitige Rollenanzeige ist **nicht** die Sicherheitsgrenze; SQL-Policies und `transition_day_log` prüfen Zugriffe. Für einen Produktivbetrieb müssen die SQL-Policies und die RPC-Funktion unabhängig auditiert und mit Mehrmandanten-Tests geprüft werden.

## Neu in Version 0.2: PDF-Betriebstagebuch

- Für freigegebene (`approved`) Tagesprotokolle erscheint unter **Abschluss** die Schaltfläche **PDF-Betriebstagebuch herunterladen**.
- Die Anwendung lädt beim Export die Daten frisch aus Supabase und erzeugt das PDF lokal im Browser; kein zusätzlicher Serverdienst und keine Datenübertragung an einen PDF-Anbieter.
- Enthalten sind alle Morgen-/Abendmessungen, manuell erfasste dinotec-/Photometerwerte, Tagesdaten, Kontrollkästchen, Bemerkungen, Datum und Benutzer-ID.
- **Wichtig:** Das PDF ist eine Momentaufnahme, keine signierte oder manipulationssicher archivierte Urkunde. Die Freigabe wird durch den Datenbankstatus angezeigt, nicht kryptografisch nachgewiesen.
- Nach dem Hochladen der neuen Dateien auf GitHub baut Vercel die Version neu. Es sind **keine neuen Supabase-Tabellen oder Schlüssel** nötig.
- `npm install` installiert zusätzlich `jspdf`.
- Prüfe den Export mit einem freigegebenen Testtag und vergleiche alle Werte mit PoolLog.
