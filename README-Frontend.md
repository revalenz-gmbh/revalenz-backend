# Revalenz Website

## Projektstruktur

### Routing-Architektur

Die Anwendung verwendet eine klare Routing-Struktur, die in drei Hauptbereiche unterteilt ist:

#### 1. Öffentliche Routen (`/public-routes`)
- Home (`/`)
- Leistungen (`/leistungen`)
- Über Uns (`/ueber-uns`)
- Kontakt (`/kontakt`)
- Karriere (`/karriere`)
- Beratungstermin (`/beratungstermin`)
- Impressum (`/impressum`)
- Datenschutz (`/datenschutz`)

#### 2. Authentifizierungsrouten (`/auth-routes`)
- Login (`/auth/login`)
- Register (`/auth/register`)
- Password Reset (`/auth/reset`)

#### 3. Geschützte Routen (`/protected-routes`)
- Dashboard (`/dashboard`)
- Support Portal (`/support`)
- Ticketservice (`/ticketservice-info`)

### Layout-Struktur

Die Anwendung verwendet drei verschiedene Layout-Komponenten:

1. **PublicLayout**
   - Enthält Header und Footer
   - Für alle öffentlichen Seiten
   - Responsive Design für Desktop und Mobile

2. **AuthLayout**
   - Minimalistisches Layout für Authentifizierungsseiten
   - Zentrierte Formulare
   - Keine Navigation

3. **ProtectedLayout**
   - Dashboard-Layout für geschützte Bereiche
   - Seitenleiste mit Navigation
   - Benutzer-spezifische Informationen

### Technologie-Stack

- **Frontend**: React mit TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context
- **API-Client**: TanStack Query
- **UI-Komponenten**: Shadcn/ui
- **Formulare**: React Hook Form
- **Validierung**: Zod
- **Authentifizierung**: JWT

### Entwicklung

1. **Installation**
   ```bash
   npm install
   ```

2. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

3. **Build erstellen**
   ```bash
   npm run build
   ```

### Deployment

Die Anwendung wird auf Vercel gehostet und automatisch bei jedem Push in den `main`-Branch deployed.

### Code-Konventionen

- **Komponenten**: PascalCase
- **Dateien**: PascalCase für Komponenten, camelCase für Utilities
- **Styling**: Tailwind CSS Klassen
- **TypeScript**: Strikte Typisierung
- **Imports**: Absolute Imports mit `@/` Prefix

### Projektstruktur

```
src/
├── components/         # Wiederverwendbare Komponenten
├── contexts/          # React Context Provider
├── hooks/             # Custom React Hooks
├── layouts/           # Layout-Komponenten
├── lib/               # Utility-Funktionen
├── pages/             # Seiten-Komponenten
├── styles/            # Globale Styles
└── types/             # TypeScript Definitionen
```

### Authentifizierung

Die Authentifizierung basiert auf JWT-Tokens und wird über den `AuthContext` verwaltet. Geschützte Routen werden durch die `ProtectedRoute`-Komponente abgesichert.

### Internationalisierung

Die Anwendung unterstützt Deutsch und Englisch über den `LanguageContext`. Übersetzungen werden in JSON-Dateien im `locales`-Verzeichnis verwaltet.

### Performance-Optimierungen

- Code-Splitting durch React Router
- Lazy Loading von Komponenten
- Optimierte Bilder
- Caching-Strategien

### Testing

- Unit Tests mit Vitest
- Komponenten-Tests mit React Testing Library
- E2E Tests mit Playwright

### CI/CD

- Automatische Tests bei jedem Push
- Automatisches Deployment auf Vercel
- Code-Qualitäts-Checks mit ESLint und Prettier

### Sicherheit

- CSRF-Schutz
- XSS-Prävention
- Sichere Cookie-Konfiguration
- Rate Limiting
- Input-Validierung

### Monitoring

- Error Tracking mit Sentry
- Performance Monitoring
- User Analytics

### Wartung

- Regelmäßige Dependency-Updates
- Code-Reviews
- Dokumentation
- Performance-Monitoring

### Kontakt

Bei Fragen oder Problemen wenden Sie sich bitte an das Entwicklungsteam.

### Lizenz

Proprietär - Alle Rechte vorbehalten