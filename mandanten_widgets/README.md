# Revalenz Ticket-Service Mandanten-Template

Dieses Repository dient als Vorlage für Mandanten, die den Revalenz Ticket-Service auf ihrer eigenen Webseite nutzen möchten. Es enthält alle wichtigen Konfigurationsdateien und ein wiederverwendbares Widget für die Ticket-Reservierung.

---

## Verzeichnisstruktur

```
mandanten_widgets/
│
├── TicketReservationWidget.tsx   # Das wiederverwendbare Widget für die Ticket-Reservierung
├── config/
│   ├── eventConfig.ts            # Event-spezifische Informationen (Titel, Ort, Datum, Beschreibung)
│   ├── ticketTypes.ts            # Ticket-Typen, Preise und Beschreibungen
│   ├── branding.ts               # Farben, Logos, Texte für das Branding
│   ├── faq.ts                    # Häufig gestellte Fragen (optional)
│   └── contacts.ts               # Kontaktinformationen für Support
└── README.md                     # Diese Anleitung
```

---

## 1. Konfigurationsdateien

### `config/eventConfig.ts`
Hier werden alle Event-spezifischen Informationen gepflegt:
```ts
export const NEXT_EVENT_DETAILS = {
  eventTitle: "Benefizshow 2025",
  fullLocation: "Stadthalle Dülmen",
  formattedWeekdayDate: "Samstag, 21. Februar 2026",
  fullTimeInfo: "18:00 Uhr (Einlass ab 17:30 Uhr)",
  description: "Ein unterhaltsamer Abend mit Quiz, Big Band Musik der 'Golden Wings' und Show-Elementen. Der gesamte Erlös kommt regionalen gemeinnützigen Projekten zugute."
};
```

### `config/ticketTypes.ts`
Hier werden die verfügbaren Ticket-Typen und Preise definiert:
```ts
export const TICKET_TYPES = [
  {
    id: "standard",
    name: "Standard Ticket",
    description: "Einzelplatz mit freier Platzwahl",
    price: 15.00,
  },
  {
    id: "ermaessigt",
    name: "Ermäßigt (Schüler/Azubis/Studenten)",
    description: "Einzelplatz, Nachweis am Einlass erforderlich",
    price: 11.00,
  }
];
```

### `config/branding.ts`
Hier können Farben, Logos und weitere Branding-Elemente gepflegt werden:
```ts
export const BRAND_COLORS = {
  primary: "#2563eb",
  secondary: "#fbbf24",
};
```

### `config/faq.ts` (optional)
Hier können häufig gestellte Fragen für die Eventseite gepflegt werden:
```ts
export const FAQ = [
  { question: "Wie erhalte ich mein Ticket?", answer: "Sie erhalten Ihr Ticket per E-Mail nach der Bezahlung." },
  { question: "Kann ich mein Ticket stornieren?", answer: "Bitte kontaktieren Sie den Veranstalter für Stornierungen." }
];
```

### `config/contacts.ts`
Hier werden die Kontaktinformationen für Support und Rückfragen gepflegt:
```ts
export const CONTACTS = {
  email: "info@benefizshow.de",
  phone: "+49 123 4567890",
  address: "Stadthalle Dülmen, Musterstraße 1, 48249 Dülmen"
};
```

---

## 2. Einbindung des Widgets

Das Widget kann in jede React-Seite eingebunden werden:

```tsx
import TicketReservationWidget from './TicketReservationWidget';
import { NEXT_EVENT_DETAILS } from './config/eventConfig';
import { TICKET_TYPES } from './config/ticketTypes';

// Beispiel für die Einbindung:
<TicketReservationWidget tenant_id={5} event_id={123} />
```

Das Widget verwendet die Konfigurationsdateien automatisch, um die Event-Infos und Ticket-Typen anzuzeigen.

---

## 3. Anpassung durch den Mandanten

- **Event-Infos:** Einfach in `eventConfig.ts` anpassen.
- **Ticket-Typen und Preise:** In `ticketTypes.ts` ändern oder erweitern.
- **Branding:** Farben, Logos etc. in `branding.ts` anpassen.
- **FAQ und Kontakte:** In den jeweiligen Dateien pflegen.

---

## 4. Best Practices

- Halte die Konfigurationsdateien aktuell und prüfe sie vor jedem Event.
- Nutze sprechende IDs für Ticket-Typen, damit die Zuordnung im Backend eindeutig ist.
- Pflege sensible Daten (z.B. API-Keys) niemals im Frontend, sondern immer serverseitig.
- Bei mehreren Events: Lege für jedes Event eine eigene Konfigurationsdatei an.

---

## 5. Weiterentwicklung

- Die Konfigurationsdateien können als Template-Repo auf GitHub bereitgestellt werden.
- Optional: Veröffentlichung als npm-Paket für noch einfachere Integration.
- Die Widget-Logik kann jederzeit erweitert werden (z.B. für Zusatzfelder, Zahlungsintegration, etc.).

---

**Fragen oder Wünsche?**
Melde dich gerne bei Revalenz für Support oder individuelle Anpassungen! 