# Kundensystem (src/client)

Dieses Verzeichnis enthält alle Google Apps Script-Dateien, die beim Kunden im jeweiligen Google Apps Script-Projekt verwendet werden.

## Zweck
- Verwaltung von Tickets und Devices (Scannern)
- Bereitstellung der Web-Oberfläche für das Scannen und die Ticketverwaltung
- Keine Lizenzdaten oder zentrale Verwaltungsfunktionen enthalten

## Typische Dateien
- `Setup.gs`: Initialisiert die benötigten Sheets (Tickets, Devices) und füllt sie mit Beispieldaten.
- `Scanner.gs`: Logik für das Scannen und Verwalten von Tickets.
- `ScannerPage.html`: Benutzeroberfläche für den Scanner.
- `appsscript.json`: Konfiguration für das Apps Script-Projekt.

## Setup
1. Lege ein neues Google Apps Script-Projekt an.
2. Kopiere die Dateien aus diesem Verzeichnis in das Projekt.
3. Führe die Funktion `setup()` aus, um die benötigten Sheets anzulegen.
4. Öffne die Web-App über die bereitgestellte Oberfläche.

Weitere Details siehe Haupt-README im Projektroot. 