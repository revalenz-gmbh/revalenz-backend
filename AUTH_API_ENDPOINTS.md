# Authentifizierungs- und E-Mail-API-Endpunkte (Revalenz Backend)

Diese Übersicht beschreibt alle relevanten Endpunkte für die Authentifizierung und den E-Mail-Versand im Revalenz-Backend. Sie dient als Referenz für die Frontend-Entwicklung und zur Weitergabe an KI-Agenten.

---

## Registrierung
**POST** `/auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "geheim123",
  "name": "Max Mustermann",
  "tenant_id": 1,
  "role": "customer"
}
```
**Antwort:**
- Erfolg:
  ```json
  { "message": "Registrierung erfolgreich! Bitte E-Mail bestätigen." }
  ```
- Fehler (z.B. E-Mail existiert):
  ```json
  { "error": "E-Mail bereits registriert" }
  ```

---

## E-Mail-Bestätigung
**GET** `/auth/verify?token=DEIN_TOKEN`

**Antwort:**
- Erfolg: `E-Mail erfolgreich bestätigt! Du kannst dich jetzt einloggen.`
- Fehler: `Ungültiger oder abgelaufener Token`

---

## Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "geheim123"
}
```
**Antwort:**
- Erfolg:
  ```json
  { "token": "JWT_TOKEN" }
  ```
- Fehler:
  ```json
  { "error": "Ungültige E-Mail oder Passwort" }
  ```

---

## Passwort vergessen (Reset anfordern)
**POST** `/auth/request-reset`

**Body:**
```json
{
  "email": "user@example.com"
}
```
**Antwort:**
- Immer (aus Sicherheitsgründen):
  ```json
  { "message": "Falls die E-Mail existiert, wurde eine Nachricht verschickt." }
  ```

---

## Passwort zurücksetzen
**POST** `/auth/reset`

**Body:**
```json
{
  "token": "RESET_TOKEN_AUS_EMAIL",
  "newPassword": "neuesgeheim123"
}
```
**Antwort:**
- Erfolg: `Passwort erfolgreich geändert!`
- Fehler: `Token ungültig oder abgelaufen`

---

## Profil anzeigen/ändern (optional)
**GET** `/auth/profile` (mit Bearer-Token im Header)
**PUT** `/auth/profile` (mit Bearer-Token im Header und neuen Daten im Body)

---

## Hinweise für das Frontend
- **API-Basis-URL lokal:** `http://localhost:3000`
- **API-Basis-URL Produktion:** z.B. `https://api.revalenz.de`
- **Alle Endpunkte beginnen mit `/auth/...`**
- **E-Mail-Versand** (Verifizierung, Reset) wird automatisch vom Backend ausgelöst, wenn du die entsprechenden Endpunkte aufrufst.

---

## Beispiel für einen Fetch-Request (Frontend, TypeScript/React)

```tsx
const res = await fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, name, tenant_id, role })
});
const data = await res.json();
if (res.ok) {
  // Erfolgsmeldung anzeigen
} else {
  // Fehler anzeigen: data.error
}
``` 