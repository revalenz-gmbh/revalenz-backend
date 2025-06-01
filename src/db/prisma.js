const { PrismaClient } = require('@prisma/client');

let prisma;

try {
  prisma = new PrismaClient();
  console.log("PrismaClient erfolgreich initialisiert.");
} catch (error) {
  console.error("SCHWERER FEHLER: PrismaClient konnte nicht initialisiert werden:", error);
  // In Produktion könnte man hier den Prozess beenden oder eine Gesundheitsprüfung fehlschlagen lassen
}

module.exports = prisma; 