require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

// --- Router-Importe mit Debug-Logging ---
console.log('Lade Router-Module...');

try {
  const ticketsRouter = require('./api/tickets/tickets.routes');
  console.log('✅ ticketsRouter geladen');
} catch (err) {
  console.error('❌ ticketsRouter Fehler:', err.message);
}

try {
  const tenantsRoutes = require('./api/tenants');
  console.log('✅ tenantsRoutes geladen');
} catch (err) {
  console.error('❌ tenantsRoutes Fehler:', err.message);
}

try {
  const authRoutes = require('./api/auth');
  console.log('✅ authRoutes geladen');
} catch (err) {
  console.error('❌ authRoutes Fehler:', err.message);
}

// Tatsächliche Importe (falls obige erfolgreich)
const ticketsRouter = require('./api/tickets/tickets.routes');
const tenantsRoutes = require('./api/tenants');
const authRoutes = require('./api/auth');

// --- App-Initialisierung ---
const app = express();

// Prisma Client Initialisierung mit Error Handling
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// Prisma Connection Test
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('Datenbankverbindung erfolgreich hergestellt');
    
    // Test-Query ausführen
    await prisma.$queryRaw`SELECT 1`;
    console.log('Datenbank-Query erfolgreich ausgeführt');
    return true;
  } catch (error) {
    console.error('Datenbankverbindungsfehler:', error);
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'ist gesetzt' : 'ist NICHT gesetzt');
    return false;
  }
}

// CORS-Konfiguration
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',')
  : [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://ask.revalenz.de',
      'https://www.revalenz.de'
    ];

// --- Middleware ---
app.use(cors({
  origin: (origin, callback) => {
    // Erlaube Requests ohne Origin (z.B. von Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Nicht erlaubt durch CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// --- API-Routen ---
app.use('/api/tickets', ticketsRouter); // Ticket-Service
app.use('/api/tenants', tenantsRoutes); // Mandantenverwaltung
app.use('/auth', authRoutes);            // Authentifizierung (Login, Register, Reset, Verify)

// Erweiterter Health-Check-Endpunkt
app.get('/health', async (req, res) => {
  try {
    // Datenbankverbindung prüfen
    const dbConnected = await testDatabaseConnection();
    
    res.json({
      status: dbConnected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: dbConnected ? 'connected' : 'disconnected',
        uptime: process.uptime()
      },
      env: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'ist gesetzt' : 'ist NICHT gesetzt'
      }
    });
  } catch (error) {
    console.error('Healthcheck fehlgeschlagen:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Datenbankverbindung fehlgeschlagen',
      details: error.message
    });
  }
});

// Globaler Error-Handler
app.use((err, req, res, next) => {
  console.error('Globaler Fehler:', err);
  
  // Prisma-spezifische Fehlerbehandlung
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Eindeutigkeitsverletzung',
      details: err.meta?.target
    });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Datensatz nicht gefunden'
    });
  }

  res.status(500).json({
    error: 'Interner Serverfehler',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM Signal empfangen. Führe Graceful Shutdown durch...');
  await prisma.$disconnect();
  process.exit(0);
});

// --- Serverstart ---
const PORT = process.env.PORT || 8080;

// Starte Server sofort
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${PORT}`);
  console.log('Umgebungsvariablen:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'ist gesetzt' : 'ist NICHT gesetzt',
    PRISMA_CLIENT_ENGINE_TYPE: process.env.PRISMA_CLIENT_ENGINE_TYPE
  });
  
  // Teste Datenbankverbindung im Hintergrund
  testDatabaseConnection()
    .then(connected => {
      if (!connected) {
        console.warn('Warnung: Datenbankverbindung konnte nicht hergestellt werden');
      }
    })
    .catch(error => {
      console.error('Fehler beim Testen der Datenbankverbindung:', error);
    });
}); 