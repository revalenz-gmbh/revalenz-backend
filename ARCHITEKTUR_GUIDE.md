# Architektur-Guide: Modulares Backend für die Revalenz GmbH

## Beispiel-Projektstruktur (Node.js/Express, erweiterbar für NestJS)

```
revalenz-backend/
├── src/
│   ├── api/
│   │   ├── tickets/           # Ticketservice-Module (Controller, Routen, Logik)
│   │   ├── events/            # Eventverwaltung
│   │   ├── orders/            # Bestellungen
│   │   ├── users/             # Nutzerverwaltung (Kunden, Experten, Admins)
│   │   ├── auth/              # Authentifizierung (JWT, OAuth)
│   │   ├── payments/          # Zahlungsabwicklung
│   │   ├── consulting/        # Expertenplattform & Terminvermittlung
│   │   ├── ai/                # KI/LLM-Dienste (z.B. Sprachmodelle)
│   │   └── ...                # Weitere Module
│   ├── db/
│   │   ├── migrations/        # SQL-Migrationsskripte
│   │   ├── models/            # Datenbankmodelle (ORM/SQL)
│   │   └── index.js           # DB-Verbindung
│   ├── middleware/            # Zentrale Middleware (z.B. Auth, Logging)
│   ├── utils/                 # Hilfsfunktionen
│   ├── config/                # Konfiguration (z.B. Umgebungsvariablen)
│   └── server.js              # Einstiegspunkt (Express-App)
├── tests/                     # Tests für alle Module
├── package.json
├── README.md
└── ...
```

---

## Vorschlag: Nutzer- und Rollenverwaltung

### **Tabellenstruktur (vereinfachtes Beispiel)**

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT, -- z.B. 'customer', 'expert', 'admin', 'superadmin'
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rollen können auch in einer eigenen Tabelle gepflegt werden, falls du komplexe Rechte brauchst
```

### **Typische Rollen**
- **customer**: Endkunde, kann Tickets kaufen, Beratung buchen, etc.
- **expert**: Berater/Experte, kann Termine anbieten, Profile verwalten
- **admin**: Mandanten-Admin, verwaltet Events, Nutzer, Auswertungen für seinen Mandanten
- **superadmin**: Plattform-Admin (Revalenz GmbH), sieht und verwaltet alles

### **Rechteverwaltung (Beispiel, Pseudocode)**
```js
function checkPermission(user, action, resource) {
  if (user.role === 'superadmin') return true;
  if (user.role === 'admin' && resource.tenant_id === user.tenant_id) return true;
  if (user.role === 'expert' && action === 'consulting' && resource.expert_id === user.id) return true;
  if (user.role === 'customer' && action === 'order' && resource.user_id === user.id) return true;
  return false;
}
```

### **Authentifizierung**
- JWT-Token für API-Zugriffe (Login gibt Token zurück, Token wird bei jedem Request geprüft)
- Optional: OAuth2 (z.B. Google Login) für Experten/Kunden
- Passwort-Hashing (z.B. bcrypt)

### **Mandantenfähigkeit**
- Jeder Nutzer ist über `tenant_id` eindeutig einem Mandanten zugeordnet
- Admins und Experten sehen nur "ihre" Daten
- Superadmins sehen alles

---

## **Vorteile dieser Struktur**
- Sehr gut erweiterbar für neue Services (Tickets, Beratung, KI, ...)
- Zentrale Nutzerverwaltung mit klaren Rollen und Rechten
- Mandantenfähigkeit von Anfang an integriert
- Einfache Integration mit React, Google Apps Script, Mobile Apps etc.

---

**Wenn du möchtest, kann ich dir ein Starter-Template für das Backend oder Beispielcode für Authentifizierung und Rechteprüfung liefern!** 