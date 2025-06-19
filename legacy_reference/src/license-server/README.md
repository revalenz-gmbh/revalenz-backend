# Zentrale Lizenzverwaltung (src/license-server)

Dieses Verzeichnis enthält alle Google Apps Script-Dateien, die von der Revalenz GmbH zur Verwaltung und Prüfung von Lizenzen verwendet werden.

## Zweck
- Verwaltung und Prüfung von Lizenzen für alle Kunden und Services
- Zentrale Speicherung der Lizenzdaten in einem separaten Google Spreadsheet
- Keine Kundendaten oder Ticketverwaltung enthalten

## Typische Dateien
- `LicenseServer.gs`: Mandanten- und servicefähige Lizenzlogik, Gerätebindung
- `Setup.gs`: Initialisierung des Lizenzverwaltungs-Spreadsheets, interaktives Setup
- `LicenseAdminPage.html`: (optional) Oberfläche für die Lizenzverwaltung
- `appsscript.json`: Konfiguration für das Apps Script-Projekt

## Setup & Hinweise

**Wichtig:** Die Initialisierung des Lizenzverwaltungs-Systems erfolgt nicht durch direkten Funktionsaufruf im Editor, sondern über das Menü im Spreadsheet:

1. Nach dem Hochladen der Skripte findest du im Spreadsheet-Menü den Eintrag **„Lizenzverwaltung“**.
2. Wähle dort **„Setup ausführen“**.
3. Es öffnet sich ein Dialog, in dem du die Spreadsheet-ID für die Lizenzverwaltung eingibst.
4. Nach Klick auf „Initialisieren“ wird die Tabelle **„Licenses“** mit der neuen Struktur angelegt und mit Beispieldaten gefüllt.

**Hinweis:**
- Ein direkter Aufruf von `setupLicenseManagement()` im Editor ohne Parameter führt zu einem Fehler, da die Sheet-ID fehlt.
- Alternativ kannst du im Editor `setupLicenseManagement('DEINE_SHEET_ID')` aufrufen.

## Struktur der Tabelle „Licenses“

| Lizenzschlüssel | Kunde       | Service        | Lizenztyp | Status   | Aktivierungsdatum | Ablaufdatum   | Bemerkungen           |
|----------------|-------------|---------------|-----------|----------|------------------|--------------|-----------------------|
| ABC-123-XYZ    | Musterfirma | Ticketservice | Standard  | aktiv    | 2024-05-01       | 2025-05-01   |                       |
| DEF-456-UVW    | Musterfirma | Newsletter    | Trial     | abgelaufen| 2024-01-01      | 2024-02-01   | Testphase abgelaufen  |

- Jede Lizenz ist eindeutig für einen Kunden und einen Service.
- Die Lizenzprüfung (`validateLicense`) erwartet Lizenzschlüssel, Service und optional DeviceId.
- Die Gerätebindung wird über die Tabelle **„DeviceMappings“** verwaltet, die bei Bedarf automatisch angelegt wird.

## Mandanten- und Servicefähigkeit
- Die Lizenzverwaltung ist so aufgebaut, dass beliebig viele Services (z.B. Ticketservice, Newsletter, weitere Produkte) und beliebig viele Kunden verwaltet werden können.
- Neue Services können einfach durch Hinzufügen weiterer Zeilen in der Tabelle „Licenses“ integriert werden.

## Lizenzprüfung
- Die Lizenzprüfung erfolgt über die Funktion `validateLicense(licenseKey, deviceId)`
- Es wird auf ein zentrales Spreadsheet zugegriffen (Spreadsheet-ID in der Datei anpassen!)
- Weitere Verwaltungsfunktionen können ergänzt werden

Weitere Details siehe Haupt-README im Projektroot. 