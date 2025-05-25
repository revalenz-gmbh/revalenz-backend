/**
 * TicketService - Hauptklasse für die Ticket-Verwaltung
 * @class
 */
class TicketService {
  /**
   * Erstellt eine neue Instanz des TicketService
   * @constructor
   */
  constructor() {
    this.config = {
      licenseKey: null,
      merchantId: 'BCR2DN7TRDMMHADK',
      version: '1.0.0',
      ticketTypes: {},
      emailConfig: {
        senderName: 'Veranstalter',
        subjectPrefix: 'Ihr Ticket'
      }
    };
    this.initialized = false;
    this.storage = null;
  }

  /**
   * Initialisiert den TicketService mit der gegebenen Konfiguration
   * @param {Object} config - Die Konfiguration für den TicketService
   * @returns {TicketService} Die aktuelle Instanz für Method-Chaining
   */
  configure(config) {
    this.config = {
      ...this.config,
      ...config
    };
    this.storage = new TicketStorage({
      sheetName: config.sheetName || 'Tickets'
    });
    this.initialized = true;
    return this;
  }

  /**
   * Aktiviert die Lizenz für den TicketService
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @returns {Promise<Object>} Das Ergebnis der Aktivierung
   */
  async activateLicense(licenseKey) {
    try {
      // TODO: Implementierung der Lizenzaktivierung
      this.config.licenseKey = licenseKey;
      return { success: true };
    } catch (error) {
      console.error('Fehler bei der Lizenzaktivierung:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Prüft den Lizenzstatus
   * @returns {Object} Die Lizenzinformationen
   */
  getLicenseInfo() {
    return {
      active: !!this.config.licenseKey,
      licenseKey: this.config.licenseKey,
      version: this.config.version
    };
  }

  /**
   * Erstellt ein neues Ticket
   * @param {Object} ticketData - Die Daten für das neue Ticket
   * @returns {Promise<Ticket>} Das erstellte Ticket
   */
  async createTicket(ticketData) {
    if (!this.initialized) {
      throw new Error('TicketService muss zuerst konfiguriert werden');
    }
    if (!this.getLicenseInfo().active) {
      throw new Error('Keine aktive Lizenz gefunden');
    }

    try {
      // Validiere Ticket-Daten
      this._validateTicketData(ticketData);

      // Erstelle Ticket-Instanz
      const ticket = new Ticket(ticketData);

      // Speichere Ticket
      await this.storage.saveTicket(ticket);

      // Sende Bestätigungs-E-Mail
      if (ticketData.sendEmail !== false) {
        await this._sendConfirmationEmail(ticket);
      }

      return ticket;
    } catch (error) {
      console.error('Fehler bei der Ticket-Erstellung:', error);
      throw error;
    }
  }

  /**
   * Lädt ein Ticket anhand seiner ID
   * @param {string} ticketId - Die ID des Tickets
   * @returns {Promise<Ticket|null>} Das gefundene Ticket oder null
   */
  async getTicket(ticketId) {
    if (!this.initialized) {
      throw new Error('TicketService muss zuerst konfiguriert werden');
    }
    return this.storage.loadTicket(ticketId);
  }

  /**
   * Aktualisiert ein Ticket
   * @param {Ticket} ticket - Das zu aktualisierende Ticket
   * @returns {Promise<void>}
   */
  async updateTicket(ticket) {
    if (!this.initialized) {
      throw new Error('TicketService muss zuerst konfiguriert werden');
    }
    await this.storage.updateTicket(ticket);
  }

  /**
   * Validiert die Ticket-Daten
   * @private
   * @param {Object} ticketData - Die zu validierenden Ticket-Daten
   * @throws {Error} Wenn die Validierung fehlschlägt
   */
  _validateTicketData(ticketData) {
    if (!ticketData.type) {
      throw new Error('Ticket-Typ ist erforderlich');
    }
    if (!ticketData.owner) {
      throw new Error('Ticket-Besitzer ist erforderlich');
    }
    if (!this.config.ticketTypes[ticketData.type]) {
      throw new Error(`Ungültiger Ticket-Typ: ${ticketData.type}`);
    }
  }

  /**
   * Sendet eine Bestätigungs-E-Mail für ein Ticket
   * @private
   * @param {Ticket} ticket - Das Ticket
   * @returns {Promise<void>}
   */
  async _sendConfirmationEmail(ticket) {
    try {
      const ticketData = ticket.toJSON();
      const ticketType = this.config.ticketTypes[ticketData.type];
      
      const subject = `${this.config.emailConfig.subjectPrefix}: ${ticketType.name}`;
      const body = this._generateEmailBody(ticket);
      
      MailApp.sendEmail({
        to: ticketData.owner,
        subject: subject,
        body: body,
        name: this.config.emailConfig.senderName
      });
      
      Logger.log(`Bestätigungs-E-Mail für Ticket ${ticketData.id} gesendet`);
    } catch (error) {
      Logger.log(`Fehler beim Senden der Bestätigungs-E-Mail: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generiert den E-Mail-Text für ein Ticket
   * @private
   * @param {Ticket} ticket - Das Ticket
   * @returns {string} Der generierte E-Mail-Text
   */
  _generateEmailBody(ticket) {
    const ticketData = ticket.toJSON();
    const ticketType = this.config.ticketTypes[ticketData.type];
    
    let body = `Hallo,\n\n`;
    body += `vielen Dank für Ihre Ticketbestellung!\n\n`;
    body += `Ihre Ticket-Details:\n`;
    body += `- Ticket-ID: ${ticketData.id}\n`;
    body += `- Typ: ${ticketType.name}\n`;
    body += `- Menge: ${ticketData.quantity}\n`;
    body += `- Status: ${ticketData.status}\n\n`;
    body += `Mit freundlichen Grüßen,\n`;
    body += this.config.emailConfig.senderName;
    
    return body;
  }

  /**
   * Öffnet den Scanner
   * @returns {string} Die URL des Scanners
   */
  openScanner() {
    if (!this.getLicenseInfo().active) {
      throw new Error('Keine aktive Lizenz gefunden');
    }
    // TODO: Implementierung des Scanner-Öffnens
    return '';
  }

  /**
   * Statische Factory-Methode zum Erstellen einer neuen TicketService-Instanz
   * @returns {TicketService} Eine neue TicketService-Instanz
   */
  static createManager() {
    return new TicketService();
  }
}

// Exportiere die Klasse
if (typeof module !== 'undefined') {
  module.exports = TicketService;
} 