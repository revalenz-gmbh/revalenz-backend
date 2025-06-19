// TicketCreationService.js
// Service zur Erstellung individueller Tickets inkl. QR-Code

const LicenseValidationService = require('./LicenseValidationService');
const Ticket = require('./Ticket');
const TicketStorage = require('./TicketStorage');
const CryptoUtils = require('./CryptoUtils');

// QR-Code-Generierung (aus TicketUtils.gs, ggf. anpassen)
function generateQrCode(text) {
  // Hier ggf. eine eigene Implementierung oder einen Service nutzen
  // Platzhalter: Rückgabe eines Dummy-Objekts
  return { blob: `QRCode(${text})` };
}

class TicketCreationService {
  /**
   * Erstellt ein oder mehrere Tickets für einen Lizenznehmer.
   * @param {Object} options
   *   - {string} licenseKey
   *   - {string} email
   *   - {string} event
   *   - {string} ticketType
   *   - {number} quantity
   *   - {Object} [additionalData]
   * @returns {Promise<Array>} Array mit Ticket-Objekten (inkl. QR-Code-Blob)
   * @throws Error bei Validierungsfehlern
   */
  static async createTickets(options) {
    const { licenseKey, email, event, ticketType, quantity, additionalData } = options;
    if (!licenseKey || !email || !event || !ticketType || !quantity) {
      throw new Error('Fehlende Pflichtangaben für die Ticketerstellung.');
    }

    // 1. Lizenz prüfen
    const validator = new LicenseValidationService();
    const licenseResult = await validator.validateLicense(licenseKey);
    if (!licenseResult.success) {
      throw new Error('Lizenz ungültig oder abgelaufen: ' + (licenseResult.message || '')); 
    }

    // 2. Tickets erzeugen
    const tickets = [];
    const storage = new TicketStorage();
    const crypto = new CryptoUtils();
    for (let i = 0; i < quantity; i++) {
      const ticketId = crypto.generateLicenseKey({
        type: ticketType,
        features: [event],
        expiresAt: null
      });
      const qrCodeBlob = generateQrCode(ticketId);
      const ticketObj = new Ticket({
        id: ticketId,
        type: ticketType,
        owner: email,
        quantity: 1,
        status: 'offen',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          event,
          ...additionalData,
          qrCodeBlob
        }
      });
      await storage.saveTicket(ticketObj);
      tickets.push({
        ...ticketObj.toJSON(),
        qrCodeBlob
      });
    }
    return tickets;
  }
}

// Exportiere die Klasse
if (typeof module !== 'undefined') {
  module.exports = TicketCreationService;
} 