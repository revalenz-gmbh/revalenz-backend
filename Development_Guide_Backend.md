# Development Guide Backend – Revalenz GmbH

## Zielsetzung

Dieses Dokument fasst die wichtigsten Architektur- und Technologieentscheidungen für das zentrale Backend der Revalenz GmbH zusammen. Es dient als Leitfaden für die Entwicklung und spätere Erweiterung (z.B. Ticketservice, Expertenplattform, Terminvermittlung, KI-Dienste).

---

## 1. Systemarchitektur – Überblick

- **Modulares, mandantenfähiges Backend**
- **Node.js (Express, optional NestJS)** als zentrale Backend-Plattform
- **PostgreSQL** als relationale, zukunftssichere Datenbank
- **REST-API** (später ggf. GraphQL)
- **Cloud Hosting:** Google Cloud Platform (GCP), später migrationsfähig zu Hetzner oder eigenem Server
- **Frontend:** React (Web), Google Apps Script (Sheets-Integration), weitere Clients möglich

---

## 2. Technologie-Entscheidungen

### Backend-Sprache
- **Node.js (JavaScript/TypeScript)**
  - Vorteil: Gleiche Sprache wie React-Frontend, große Community, viele Beispiele
  - Sehr gute Integration mit PostgreSQL und Google APIs

### Datenbank
- **PostgreSQL**
  - Robust, performant, mandantenfähig, einfach zu migrieren
  - Zukunftssicher und flexibel für neue Anforderungen

### Hosting
- **Google Cloud Platform (Cloud SQL, Cloud Run)**
  - Einfache Skalierung, automatische Backups, hohe Verfügbarkeit
  - Später einfach zu Hetzner oder auf eigenen Server migrierbar

### Authentifizierung & Autorisierung
- **JWT (JSON Web Token)** für API-Auth
- **Rollen- und Rechteverwaltung** (customer, expert, admin, superadmin)
- **Mandantenfähigkeit**: Alle Daten eindeutig einem Mandanten zugeordnet

### API-Design
- **REST-API** für alle Module (Tickets, Beratung, KI, ...)
- **CORS**: Nur autorisierte Mandanten-Domains zugelassen
- **API-Key oder OAuth2** für Mandanten-Authentifizierung

### Erweiterbarkeit
- **Modulare Projektstruktur** (siehe Architektur-Guide)
- Jedes Feature als eigenes Modul/Controller/API-Route
- Zentrale Nutzerverwaltung, Authentifizierung und Mandantenlogik

### Sicherheit
- **SSL/TLS** für alle Verbindungen ("Nur SSL-Verbindungen zulassen" in GCP)
- **IP-Whitelist** für Datenbankzugriffe
- **Backups** und Monitoring aktivieren

---

## 3. Entwicklung & Deployment

- **Lokale Entwicklung**: Node.js-Projekt lokal aufsetzen, Verbindung zu Cloud SQL
- **Deployment**: Zunächst auf GCP (Cloud Run empfohlen), später migrationsfähig
- **.env-Datei** für sensible Daten (nicht ins Repo!)
- **Tests**: Unit- und Integrationstests für alle Module

---

## 4. Migration & Zukunftssicherheit

- **PostgreSQL-Standard**: Migration zu Hetzner oder eigenem Server jederzeit möglich (pg_dump/pg_restore)
- **Keine Cloud-spezifischen Features** nutzen, die Migration erschweren
- **Projektstruktur und Datenbank von Anfang an auf Erweiterbarkeit ausgelegt**

---

## 5. Weitere Empfehlungen

- **Dokumentation**: Architektur, API, Datenbank und Prozesse immer aktuell halten
- **Regelmäßige Backups und Sicherheitsüberprüfungen**
- **Monitoring und Logging** aktivieren (z.B. GCP Stackdriver, später eigene Lösungen)
- **Community-Standards** und Best Practices nutzen (z.B. ESLint, Prettier, Commit-Konventionen)

---

**Mit dieser Architektur und Technologieauswahl ist das Backend der Revalenz GmbH bestens für aktuelle und zukünftige Anforderungen gerüstet!** 