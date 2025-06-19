/**
 * @fileoverview Öffentliche Schnittstelle für Kunden der TicketService-Bibliothek
 */

class CustomerInterface {
  /**
   * Erstellt eine neue Instanz der Kundenschnittstelle
   * @param {Object} config - Konfigurationsobjekt
   */
  constructor(config = {}) {
    this.ticketManager = new TicketManager().configure(config);
  }

  /**
   * Erstellt ein neues Ticket für einen Kunden
   * @param {Object} ticketData - Ticket-Informationen
   * @returns {Object} Das erstellte Ticket
   */
  createTicket(ticketData) {
    return this.ticketManager.createTicket(ticketData);
  }

  /**
   * Zeigt das Ticket-Erstellungsformular an
   * @returns {GoogleApps.HTML.HtmlOutput} Das HTML-Formular
   */
  showTicketForm() {
    return HtmlService
      .createTemplateFromFile('ui/Configuration/TicketForm')
      .evaluate()
      .setTitle('Ticket erstellen');
  }

  /**
   * Validiert ein Ticket
   * @param {string} ticketId - Die Ticket-ID
   * @returns {Object} Validierungsergebnis
   */
  validateTicket(ticketId) {
    return this.ticketManager.validateTicket(ticketId);
  }
}

// Exportiere die Klasse für die Bibliothek
global.CustomerInterface = CustomerInterface; 