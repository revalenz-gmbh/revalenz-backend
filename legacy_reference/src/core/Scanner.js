/**
 * Scanner - Klasse für die QR-Code-Scanning-Funktionalität
 * @class
 */
class Scanner {
  /**
   * Erstellt eine neue Instanz des Scanners
   * @constructor
   * @param {Object} config - Die Scanner-Konfiguration
   */
  constructor(config = {}) {
    this.config = {
      autoStart: true,
      showVideo: true,
      fps: 10,
      qrbox: 250,
      ...config
    };
    this.scanner = null;
    this.isScanning = false;
  }

  /**
   * Initialisiert den Scanner
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      if (this.config.autoStart) {
        await this.start();
      }
    } catch (error) {
      console.error('Fehler bei der Scanner-Initialisierung:', error);
      throw error;
    }
  }

  /**
   * Startet den Scanner
   * @returns {Promise<void>}
   */
  async start() {
    try {
      if (this.isScanning) {
        return;
      }

      this.scanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: this.config.fps,
          qrbox: this.config.qrbox,
          showVideo: this.config.showVideo
        }
      );

      this.scanner.render(this._onScanSuccess.bind(this), this._onScanFailure.bind(this));
      this.isScanning = true;
    } catch (error) {
      console.error('Fehler beim Scanner-Start:', error);
      throw error;
    }
  }

  /**
   * Stoppt den Scanner
   * @returns {Promise<void>}
   */
  async stop() {
    try {
      if (!this.isScanning) {
        return;
      }

      if (this.scanner) {
        await this.scanner.clear();
        this.scanner = null;
      }
      this.isScanning = false;
    } catch (error) {
      console.error('Fehler beim Scanner-Stopp:', error);
      throw error;
    }
  }

  /**
   * Verarbeitet einen gescannten QR-Code
   * @param {string} code - Der gescannte QR-Code
   * @returns {Promise<Object>} Die Verarbeitungsergebnisse
   */
  async processCode(code) {
    try {
      // Validiere das Ticket
      const validationResult = await this._validateTicket(code);
      
      if (validationResult.success) {
        // Aktualisiere den Ticket-Status
        await this._updateTicketStatus(validationResult.ticketInfo.id, 'CHECKED_IN');
      }
      
      return validationResult;
    } catch (error) {
      console.error('Fehler bei der Code-Verarbeitung:', error);
      throw error;
    }
  }

  /**
   * Validiert ein Ticket
   * @private
   * @param {string} ticketData - Die Ticket-Daten
   * @returns {Promise<Object>} Das Validierungsergebnis
   */
  async _validateTicket(ticketData) {
    try {
      if (!ticketData || typeof ticketData !== 'string') {
        throw new Error('Ungültige Ticket-Daten');
      }

      // TODO: Implementiere die eigentliche Ticket-Validierung
      // Für jetzt nur eine einfache Validierung
      return {
        success: true,
        message: "Ticket ist gültig",
        ticketInfo: {
          id: ticketData,
          status: "AKTIV",
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
   * @private
   * @param {string} ticketId - Die Ticket-ID
   * @param {string} status - Der neue Status
   * @returns {Promise<Object>} Das Aktualisierungsergebnis
   */
  async _updateTicketStatus(ticketId, status) {
    try {
      // TODO: Implementiere die Ticket-Status-Aktualisierung
      return {
        success: true,
        message: "Ticket-Status wurde aktualisiert"
      };
    } catch (error) {
      console.error('Fehler bei der Status-Aktualisierung:', error);
      throw error;
    }
  }

  /**
   * Callback für erfolgreiche Scans
   * @private
   * @param {string} decodedText - Der decodierte Text
   * @param {Object} decodedResult - Das vollständige Scan-Ergebnis
   */
  async _onScanSuccess(decodedText, decodedResult) {
    try {
      // Stoppe den Scanner temporär
      await this.stop();

      // Verarbeite den Code
      const result = await this.processCode(decodedText);

      // Zeige das Ergebnis an
      this._showResult(result);

      // Starte den Scanner nach 3 Sekunden neu
      setTimeout(() => {
        this.start();
      }, 3000);
    } catch (error) {
      console.error('Fehler beim Verarbeiten des Scans:', error);
      this._showError(error.message);
    }
  }

  /**
   * Callback für fehlgeschlagene Scans
   * @private
   * @param {Error} error - Der aufgetretene Fehler
   */
  _onScanFailure(error) {
    // Ignoriere Fehler beim Scannen
    console.warn(`Scan-Fehler: ${error}`);
  }

  /**
   * Zeigt das Scan-Ergebnis an
   * @private
   * @param {Object} result - Das Scan-Ergebnis
   */
  _showResult(result) {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';

    if (result.success) {
      resultDiv.className = 'result success';
      resultDiv.innerHTML = `
        <h3>Ticket validiert</h3>
        <div class="ticket-info">
          <p><strong>Ticket-ID:</strong> ${result.ticketInfo.id}</p>
          <p><strong>Status:</strong> 
            <span class="status-badge status-${result.ticketInfo.status.toLowerCase()}">
              ${result.ticketInfo.status}
            </span>
          </p>
          <p><strong>Gescannt am:</strong> ${new Date(result.ticketInfo.scannedAt).toLocaleString('de-DE')}</p>
        </div>
      `;
    } else {
      resultDiv.className = 'result error';
      resultDiv.innerHTML = `
        <h3>Fehler</h3>
        <p>${result.message}</p>
      `;
    }
  }

  /**
   * Zeigt einen Fehler an
   * @private
   * @param {string} message - Die Fehlermeldung
   */
  _showError(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.className = 'result error';
    resultDiv.innerHTML = `
      <h3>Fehler</h3>
      <p>${message}</p>
    `;
  }
}

// Exportiere die Klasse
if (typeof module !== 'undefined') {
  module.exports = Scanner;
} 