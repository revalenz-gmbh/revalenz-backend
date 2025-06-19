const Logger = require('./Logger');

/**
 * TicketStorage - Klasse für die Ticket-Speicherung
 * @class
 */
class TicketStorage {
  /**
   * Erstellt eine neue Instanz des TicketStorage
   * @constructor
   * @param {Object} config - Die Konfiguration für den TicketStorage
   */
  constructor(config = {}) {
    this.config = {
      sheetName: 'Tickets',
      ...config
    };
  }

  /**
   * Speichert ein Ticket
   * @param {Ticket} ticket - Das zu speichernde Ticket
   * @returns {Promise<void>}
   */
  async saveTicket(ticket) {
    try {
      const sheet = this._getOrCreateSheet();
      const ticketData = ticket.toJSON();
      
      // Füge Ticket-Daten zur Tabelle hinzu
      sheet.appendRow([
        ticketData.id,
        ticketData.type,
        ticketData.owner,
        ticketData.quantity,
        ticketData.status,
        ticketData.createdAt,
        ticketData.updatedAt,
        JSON.stringify(ticketData.metadata)
      ]);

      Logger.log(`Ticket ${ticketData.id} erfolgreich gespeichert`);
    } catch (error) {
      Logger.log(`Fehler beim Speichern des Tickets: ${error.message}`);
      throw error;
    }
  }

  /**
   * Lädt ein Ticket anhand seiner ID
   * @param {string} ticketId - Die ID des Tickets
   * @returns {Promise<Ticket|null>} Das gefundene Ticket oder null
   */
  async loadTicket(ticketId) {
    try {
      const sheet = this._getOrCreateSheet();
      const data = sheet.getDataRange().getValues();
      
      // Überspringe Header-Zeile
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] === ticketId) {
          return new Ticket({
            id: row[0],
            type: row[1],
            owner: row[2],
            quantity: row[3],
            status: row[4],
            createdAt: row[5],
            updatedAt: row[6],
            metadata: JSON.parse(row[7] || '{}')
          });
        }
      }
      
      return null;
    } catch (error) {
      Logger.log(`Fehler beim Laden des Tickets: ${error.message}`);
      throw error;
    }
  }

  /**
   * Aktualisiert ein Ticket
   * @param {Ticket} ticket - Das zu aktualisierende Ticket
   * @returns {Promise<void>}
   */
  async updateTicket(ticket) {
    try {
      const sheet = this._getOrCreateSheet();
      const data = sheet.getDataRange().getValues();
      const ticketData = ticket.toJSON();
      
      // Überspringe Header-Zeile
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] === ticketData.id) {
          // Aktualisiere die Zeile
          sheet.getRange(i + 1, 1, 1, 8).setValues([[
            ticketData.id,
            ticketData.type,
            ticketData.owner,
            ticketData.quantity,
            ticketData.status,
            ticketData.createdAt,
            ticketData.updatedAt,
            JSON.stringify(ticketData.metadata)
          ]]);
          
          Logger.log(`Ticket ${ticketData.id} erfolgreich aktualisiert`);
          return;
        }
      }
      
      throw new Error(`Ticket ${ticketData.id} nicht gefunden`);
    } catch (error) {
      Logger.log(`Fehler beim Aktualisieren des Tickets: ${error.message}`);
      throw error;
    }
  }

  /**
   * Holt oder erstellt das Ticket-Sheet
   * @private
   * @returns {Sheet} Das Ticket-Sheet
   */
  _getOrCreateSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(this.config.sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(this.config.sheetName);
      // Erstelle Header
      sheet.getRange(1, 1, 1, 8).setValues([[
        'ID',
        'Typ',
        'Besitzer',
        'Menge',
        'Status',
        'Erstellt am',
        'Aktualisiert am',
        'Metadaten'
      ]]);
    }
    
    return sheet;
  }
}

// Exportiere die Klasse
if (typeof module !== 'undefined') {
  module.exports = TicketStorage;
} 