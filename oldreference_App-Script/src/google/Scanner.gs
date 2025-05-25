/**
 * Scanner - Google Apps Script Version für das Ticket-Scanning
 * @class
 */
class Scanner {
  /**
   * Erstellt eine neue Instanz des Scanners
   * @constructor
   * @param {Object} config - Die Konfiguration
   */
  constructor(config = {}) {
    this.config = {
      sheetName: 'Tickets',
      ...config
    };
    this.sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(this.config.sheetName);
    this.licenseServer = new LicenseServer();
  }

  /**
   * Erstellt die HTML-Ausgabe für die Scanner-Web-App
   * @returns {HtmlOutput} Die HTML-Ausgabe
   */
  createHtmlOutput() {
    return HtmlService.createTemplateFromFile('ScannerPage')
      .evaluate()
      .setTitle('Ticket Scanner')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  /**
   * Validiert ein Ticket
   * @param {string} ticketData - Die Ticket-Daten
   * @returns {Object} Das Validierungsergebnis
   */
  validateTicket(ticketData) {
    try {
      // Überprüfe die Lizenz
      const deviceId = PropertiesService.getScriptProperties()
        .getProperty('DEVICE_ID');
      const licenseStatus = this.licenseServer.getLicenseStatus(deviceId);
      
      if (!licenseStatus.isValid) {
        return {
          success: false,
          message: 'Ungültige Lizenz: ' + licenseStatus.message
        };
      }

      // Parse die Ticket-Daten
      const ticket = this._parseTicketData(ticketData);
      if (!ticket) {
        return {
          success: false,
          message: 'Ungültiges Ticket-Format'
        };
      }

      // Überprüfe das Ticket
      const validationResult = this._validateTicket(ticket);
      if (!validationResult.success) {
        return validationResult;
      }

      // Aktualisiere den Ticket-Status
      this._updateTicketStatus(ticket.id, 'SCANNED');

      return {
        success: true,
        message: 'Ticket gültig',
        ticket: {
          id: ticket.id,
          event: ticket.event,
          holder: ticket.holder,
          status: 'SCANNED'
        }
      };
    } catch (error) {
      console.error('Fehler bei der Ticketvalidierung:', error);
      return {
        success: false,
        message: 'Interner Fehler bei der Validierung'
      };
    }
  }

  /**
   * Aktualisiert den Ticket-Status
   * @param {string} ticketId - Die Ticket-ID
   * @param {string} status - Der neue Status
   * @returns {Object} Das Aktualisierungsergebnis
   */
  updateTicketStatus(ticketId, status) {
    try {
      const data = this.sheet.getDataRange().getValues();
      const headerRow = data[0];
      const idIndex = headerRow.indexOf('id');
      const statusIndex = headerRow.indexOf('status');
      
      if (idIndex === -1 || statusIndex === -1) {
        return {
          success: false,
          message: 'Ungültiges Sheet-Format'
        };
      }

      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === ticketId) {
          this.sheet.getRange(i + 1, statusIndex + 1).setValue(status);
          return {
            success: true,
            message: 'Status aktualisiert'
          };
        }
      }

      return {
        success: false,
        message: 'Ticket nicht gefunden'
      };
    } catch (error) {
      console.error('Fehler beim Status-Update:', error);
      return {
        success: false,
        message: 'Interner Fehler beim Update'
      };
    }
  }

  /**
   * Parst die Ticket-Daten
   * @private
   * @param {string} ticketData - Die Ticket-Daten
   * @returns {Object|null} Die geparsten Ticket-Daten oder null
   */
  _parseTicketData(ticketData) {
    try {
      const data = JSON.parse(ticketData);
      if (!data.id || !data.event || !data.holder) {
        return null;
      }
      return data;
    } catch (error) {
      console.error('Fehler beim Parsen der Ticket-Daten:', error);
      return null;
    }
  }

  /**
   * Validiert ein Ticket
   * @private
   * @param {Object} ticket - Die Ticket-Daten
   * @returns {Object} Das Validierungsergebnis
   */
  _validateTicket(ticket) {
    try {
      const data = this.sheet.getDataRange().getValues();
      const headerRow = data[0];
      const idIndex = headerRow.indexOf('id');
      const statusIndex = headerRow.indexOf('status');
      
      if (idIndex === -1 || statusIndex === -1) {
        return {
          success: false,
          message: 'Ungültiges Sheet-Format'
        };
      }

      for (let i = 1; i < data.length; i++) {
        if (data[i][idIndex] === ticket.id) {
          const status = data[i][statusIndex];
          if (status === 'USED') {
            return {
              success: false,
              message: 'Ticket bereits verwendet'
            };
          }
          if (status === 'INVALID') {
            return {
              success: false,
              message: 'Ticket ungültig'
            };
          }
          return {
            success: true,
            message: 'Ticket gültig'
          };
        }
      }

      return {
        success: false,
        message: 'Ticket nicht gefunden'
      };
    } catch (error) {
      console.error('Fehler bei der Ticketvalidierung:', error);
      return {
        success: false,
        message: 'Interner Fehler bei der Validierung'
      };
    }
  }
}

// Exportiere die Klasse für Google Apps Script
if (typeof global !== 'undefined') {
  global.Scanner = Scanner;
} 