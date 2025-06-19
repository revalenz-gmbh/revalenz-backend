/**
 * ScannerApp - Klasse für die Integration des Scanners in Google Apps Script
 * @class
 */
class ScannerApp {
  /**
   * Erstellt eine neue Instanz der ScannerApp
   * @constructor
   * @param {Object} config - Die Konfiguration
   */
  constructor(config = {}) {
    this.config = {
      title: 'Ticket Scanner',
      ...config
    };
    this.licenseManager = new LicenseManager(config.license);
  }

  /**
   * Initialisiert die ScannerApp
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      await this.licenseManager.initialize();
    } catch (error) {
      console.error('Fehler bei der ScannerApp-Initialisierung:', error);
      throw error;
    }
  }

  /**
   * Erstellt die HTML-Ausgabe für die Web-App
   * @returns {HtmlOutput} Die HTML-Ausgabe
   */
  createHtmlOutput() {
    const template = HtmlService.createTemplateFromFile('ScannerPage');
    template.config = this.config;
    
    return template.evaluate()
      .setTitle(this.config.title)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  /**
   * Validiert ein Ticket
   * @param {string} ticketData - Die Ticket-Daten
   * @returns {Object} Das Validierungsergebnis
   */
  async validateTicket(ticketData) {
    try {
      // Überprüfe die Lizenz
      if (!await this.licenseManager.hasValidLicense()) {
        return {
          success: false,
          message: 'Ungültige Lizenz'
        };
      }

      // Validiere das Ticket
      const ticket = this._parseTicketData(ticketData);
      if (!ticket) {
        return {
          success: false,
          message: 'Ungültiges Ticket-Format'
        };
      }

      // Überprüfe den Ticket-Status
      if (!this._isTicketValid(ticket)) {
        return {
          success: false,
          message: 'Ticket ist nicht gültig'
        };
      }

      return {
        success: true,
        message: 'Ticket ist gültig',
        ticketInfo: {
          id: ticket.id,
          status: ticket.status,
          scannedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Fehler bei der Ticket-Validierung:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Aktualisiert den Status eines Tickets
   * @param {string} ticketId - Die Ticket-ID
   * @param {string} status - Der neue Status
   * @returns {Object} Das Aktualisierungsergebnis
   */
  async updateTicketStatus(ticketId, status) {
    try {
      // Überprüfe die Lizenz
      if (!await this.licenseManager.hasValidLicense()) {
        return {
          success: false,
          message: 'Ungültige Lizenz'
        };
      }

      // TODO: Implementiere die Ticket-Status-Aktualisierung
      return {
        success: true,
        message: 'Ticket-Status wurde aktualisiert'
      };
    } catch (error) {
      console.error('Fehler bei der Status-Aktualisierung:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Aktiviert eine Lizenz
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @returns {Object} Das Aktivierungsergebnis
   */
  async activateLicense(licenseKey) {
    return await this.licenseManager.activateLicense(licenseKey);
  }

  /**
   * Deaktiviert die aktuelle Lizenz
   * @returns {Object} Das Deaktivierungsergebnis
   */
  async deactivateLicense() {
    return await this.licenseManager.deactivateLicense();
  }

  /**
   * Parst die Ticket-Daten
   * @private
   * @param {string} ticketData - Die Ticket-Daten
   * @returns {Object|null} Die geparsten Ticket-Daten oder null
   */
  _parseTicketData(ticketData) {
    try {
      // Versuche die Daten als JSON zu parsen
      const data = JSON.parse(ticketData);
      
      // Überprüfe die erforderlichen Felder
      if (!data.id || !data.status) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Fehler beim Parsen der Ticket-Daten:', error);
      return null;
    }
  }

  /**
   * Überprüft, ob ein Ticket gültig ist
   * @private
   * @param {Object} ticket - Das Ticket
   * @returns {boolean} Ob das Ticket gültig ist
   */
  _isTicketValid(ticket) {
    // Überprüfe den Status
    if (ticket.status !== 'AKTIV') {
      return false;
    }

    // TODO: Implementiere weitere Validierungen
    // z.B. Ablaufdatum, bereits gescannt, etc.

    return true;
  }
}

// Exportiere die Klasse
if (typeof module !== 'undefined') {
  module.exports = ScannerApp;
} 