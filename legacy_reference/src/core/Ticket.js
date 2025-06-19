/**
 * Ticket - Klasse für die Ticket-Verwaltung
 * @class
 */
class Ticket {
  /**
   * Erstellt eine neue Instanz eines Tickets
   * @constructor
   * @param {Object} data - Die Ticket-Daten
   */
  constructor(data) {
    this.id = data.id || this._generateId();
    this.type = data.type;
    this.owner = data.owner;
    this.quantity = data.quantity || 1;
    this.status = data.status || 'PENDING';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.metadata = data.metadata || {};
  }

  /**
   * Generiert eine eindeutige Ticket-ID
   * @private
   * @returns {string} Die generierte ID
   */
  _generateId() {
    return 'TICKET-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  /**
   * Aktualisiert den Ticket-Status
   * @param {string} newStatus - Der neue Status
   * @returns {Ticket} Die aktualisierte Ticket-Instanz
   */
  updateStatus(newStatus) {
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Fügt Metadaten zum Ticket hinzu
   * @param {Object} metadata - Die hinzuzufügenden Metadaten
   * @returns {Ticket} Die aktualisierte Ticket-Instanz
   */
  addMetadata(metadata) {
    this.metadata = {
      ...this.metadata,
      ...metadata
    };
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Konvertiert das Ticket in ein JSON-Objekt
   * @returns {Object} Die JSON-Repräsentation des Tickets
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      owner: this.owner,
      quantity: this.quantity,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: this.metadata
    };
  }
}

// Exportiere die Klasse
if (typeof module !== 'undefined') {
  module.exports = Ticket;
} 