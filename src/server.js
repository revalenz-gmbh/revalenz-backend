require('dotenv').config();
const express = require('express');
const cors = require('cors');

// --- Router-Importe ---
const ticketsRouter = require('./api/tickets/tickets.routes');
const tenantsRoutes = require('./api/tenants');
const authRoutes = require('./api/auth'); // Bündelt alle Auth-Routen

// --- App-Initialisierung ---
const app = express();

// --- Middleware ---
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://ask.revalenz.de',
    'https://www.revalenz.de'
  ],
  credentials: true
}));
app.use(express.json());

// --- API-Routen ---
app.use('/api/tickets', ticketsRouter); // Ticket-Service
app.use('/api/tenants', tenantsRoutes); // Mandantenverwaltung
app.use('/auth', authRoutes);            // Authentifizierung (Login, Register, Reset, Verify)

// --- Serverstart ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${PORT}`);
}); 