/**
 * Konstanten für die TicketService-Bibliothek
 */
const Constants = {
  // Ticket-Typen
  TICKET_TYPES: {
    STANDARD: 'STANDARD',
    VIP: 'VIP',
    SPONSOR: 'SPONSOR'
  },

  // Dokument-Templates
  TEMPLATES: {
    TICKET: 'TICKET_TEMPLATE',
    INVOICE: 'INVOICE_TEMPLATE'
  },

  // Berechtigungen
  PERMISSIONS: {
    VIEWER: 'VIEWER',
    EDITOR: 'EDITOR',
    OWNER: 'OWNER'
  },

  // Fehlermeldungen
  ERRORS: {
    NOT_INITIALIZED: 'TicketService muss zuerst konfiguriert werden',
    INVALID_FOLDER: 'Ungültiger Ordner',
    INVALID_TICKET_TYPE: 'Ungültiger Ticket-Typ',
    PERMISSION_DENIED: 'Keine Berechtigung für diese Aktion'
  }
};

// Exportiere die Konstanten
if (typeof module !== 'undefined') {
  module.exports = Constants;
} 