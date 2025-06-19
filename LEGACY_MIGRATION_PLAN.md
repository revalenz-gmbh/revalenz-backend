# Legacy Migration Plan - Revalenz Backend

## 🎯 Überblick

Dieses Dokument beschreibt die schrittweise Migration der Business Logic aus dem `legacy_reference/` Verzeichnis (ehemals `oldreference_App-Script`) in die moderne Backend-Architektur.

**Status:** Vorbereitet für Migration nach Monorepo-Integration  
**Erstellt:** Januar 2025  
**Letzte Aktualisierung:** Januar 2025

---

## 📁 Legacy-Struktur und Migration-Mapping

### Core Business Logic (HOHE PRIORITÄT)

#### 🎫 Ticket-Management
```
legacy_reference/src/core/TicketService.js
-> src/api/tickets/tickets.service.js (erweitern)
-> src/services/TicketService.js (neu)
```

**Zu migrierende Funktionalität:**
- ✅ Bereits vorhanden: Basis-Ticket-CRUD
- ❌ Fehlend: E-Mail-Versand bei Ticket-Erstellung
- ❌ Fehlend: Lizenz-basierte Validierung
- ❌ Fehlend: Ticket-Status-Management
- ❌ Fehlend: QR-Code-Generierung

#### 🔐 Lizenz-Management  
```
legacy_reference/src/core/LicenseManager.js
-> src/services/LicenseService.js (neu)
-> src/api/licenses/ (neues API-Modul)
```

**Zu migrierende Funktionalität:**
- ❌ Komplett fehlend: Lizenz-Aktivierung/Deaktivierung
- ❌ Fehlend: Online/Offline-Validierung
- ❌ Fehlend: Lizenzschlüssel-Generierung
- ❌ Fehlend: Crypto-Utils für Lizenzen

#### 🔒 Crypto & Security
```
legacy_reference/src/core/CryptoUtils.js
-> src/utils/cryptoUtils.js (neu)
-> src/services/SecurityService.js (neu)
```

**Zu migrierende Funktionalität:**
- ❌ Fehlend: Lizenzschlüssel-Verschlüsselung
- ❌ Fehlend: Ticket-ID-Generierung mit Crypto
- ❌ Fehlend: Sichere Token-Generierung

---

## 🏗️ Migrations-Roadmap

### Phase 1: Grundlagen (Post-Monorepo)
- [ ] Prisma Schema erweitern für Lizenzen
- [ ] Crypto-Utils migrieren  
- [ ] Basis-Lizenz-Service implementieren
- [ ] Business-Konstanten übernehmen

### Phase 2: Lizenz-Management
- [ ] LicenseManager API implementieren
- [ ] Lizenz-Aktivierung/-Validierung
- [ ] JWT-Integration für Lizenz-Auth
- [ ] Test-Endpoints erstellen

### Phase 3: Enhanced Ticket-System
- [ ] E-Mail-Integration bei Ticket-Erstellung
- [ ] QR-Code-Generierung
- [ ] Ticket-Status-Management
- [ ] Lizenz-basierte Ticket-Validierung

### Phase 4: Scanner Integration
- [ ] Scanner-API entwickeln
- [ ] QR-Code-Validierung
- [ ] Real-time Scanner-Events
- [ ] Scanner-Web-Interface

---

## 📊 Wichtige Legacy-Komponenten

### Kritische Algorithmen zu übernehmen:
1. **Lizenzschlüssel-Generierung** (CryptoUtils.js)
2. **Ticket-Validierung** (TicketService.js)
3. **E-Mail-Template-System** (TicketService.js)
4. **Scanner-Integration** (Scanner.js, ScannerApp.js)

### API-Endpunkte zu implementieren:
- Lizenz-Management: `/api/v1/licenses/*`
- Scanner: `/api/v1/scanner/*`
- Enhanced Tickets: `/api/v1/tickets/*` (erweitert)

---

## 📝 Nächste Schritte

Nach der Monorepo-Migration:
1. Legacy-Code detailliert analysieren
2. Migrations-Tickets erstellen
3. Business-Prioritäten festlegen
4. Test-Strategie entwickeln

---

*Dieses Dokument wird kontinuierlich aktualisiert während der Migrations-Phase.*