# Backend-Implementierungsplan für Revalenz

## Aktueller Frontend-Status

### Implementierte Features
- Responsive Hauptwebsite mit mehrsprachiger Unterstützung (DE/EN)
- Kontaktformular mit GCP-Integration
- Support Portal mit getrennten Bereichen für Kunden und interne Nutzer
- Authentifizierungssystem (vorbereitet für Backend-Integration)
- Ticket-System (Grundstruktur implementiert)

### Benutzerführung
- Klare Navigation mit intuitiver Struktur
- Support Portal in separatem Fenster für bessere Benutzerführung
- Konsistente URL-Struktur unter `/support-portal`
- Responsive Design für alle Geräte

## Backend-Anforderungen

### 1. Authentifizierung & Autorisierung
- Implementierung eines sicheren JWT-basierten Authentifizierungssystems
- Rollenbasierte Zugriffskontrolle (RBAC):
  - ADMIN: Vollzugriff auf alle Funktionen
  - MANAGER: Verwaltung von Tickets und Benutzern
  - EXPERT: Bearbeitung von Tickets und Kundenbetreuung
  - CLIENT: Zugriff auf eigene Tickets und Support
- Sichere Passwort-Hashing und Token-Management
- Session-Management mit Refresh-Token-Strategie

### 2. Tenant-Management
- Multi-Tenant-Architektur für verschiedene Kundenorganisationen
- Tenant-spezifische Einstellungen und Konfigurationen
- Lizenz-Management und Feature-Flags pro Tenant
- Tenant-Isolation für Daten und Ressourcen

### 3. Ticket-System
- CRUD-Operationen für Tickets
- Ticket-Status-Management
- Priorisierung und Kategorisierung
- Dateianhänge und Kommentare
- E-Mail-Benachrichtigungen
- Ticket-Historie und Audit-Log

### 4. Benutzerverwaltung
- Benutzer-Registrierung und -Verwaltung
- Profil-Management
- Expertise- und Qualifikationsverwaltung
- Stundensatz-Management für Experten
- Aktivitäts-Tracking

### 5. API-Endpoints

#### Authentifizierung
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout
GET /api/auth/status
```

#### Tickets
```
GET /api/tickets
POST /api/tickets
GET /api/tickets/:id
PUT /api/tickets/:id
DELETE /api/tickets/:id
GET /api/tickets/:id/comments
POST /api/tickets/:id/comments
```

#### Benutzer
```
GET /api/users
POST /api/users
GET /api/users/:id
PUT /api/users/:id
DELETE /api/users/:id
GET /api/users/:id/expertise
PUT /api/users/:id/expertise
```

#### Tenant
```
GET /api/tenants
POST /api/tenants
GET /api/tenants/:id
PUT /api/tenants/:id
GET /api/tenants/:id/settings
PUT /api/tenants/:id/settings
```

### 6. Datenbank-Schema

#### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    tenant_id UUID REFERENCES tenants(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### Tenants
```sql
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    domain VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    license_type VARCHAR(50),
    max_users INTEGER,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### Tickets
```sql
CREATE TABLE tickets (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    created_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    tenant_id UUID REFERENCES tenants(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### Ticket_Comments
```sql
CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id),
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### 7. Sicherheitsanforderungen
- HTTPS für alle API-Endpoints
- Rate Limiting für API-Anfragen
- Input-Validierung und Sanitization
- CSRF-Schutz
- XSS-Prävention
- SQL-Injection-Schutz
- Regelmäßige Sicherheitsaudits

### 8. Performance-Anforderungen
- API-Response-Zeit < 200ms
- Caching-Strategie für häufig abgerufene Daten
- Optimierte Datenbankabfragen
- Asynchrone Verarbeitung für zeitaufwändige Operationen
- Monitoring und Logging

## Nächste Schritte

1. **Datenbank-Migration**
   - Erstellung der Datenbank-Schemas
   - Migration der bestehenden Daten
   - Einrichtung von Indizes und Constraints

2. **API-Implementierung**
   - Grundlegende CRUD-Operationen
   - Authentifizierung und Autorisierung
   - Ticket-System-Logik
   - Tenant-Management

3. **Integration**
   - Frontend-Backend-Integration
   - E-Mail-Service-Integration
   - Datei-Upload-System
   - Monitoring und Logging

4. **Testing**
   - Unit Tests
   - Integration Tests
   - End-to-End Tests
   - Performance Tests
   - Sicherheitstests

5. **Deployment**
   - CI/CD-Pipeline
   - Staging-Umgebung
   - Produktions-Deployment
   - Backup-Strategie

## Technologie-Stack

- **Backend**: Node.js mit Express oder NestJS
- **Datenbank**: PostgreSQL
- **Caching**: Redis
- **Message Queue**: RabbitMQ
- **File Storage**: Google Cloud Storage
- **Email Service**: SendGrid oder GCP
- **Monitoring**: Prometheus & Grafana
- **Logging**: ELK Stack 