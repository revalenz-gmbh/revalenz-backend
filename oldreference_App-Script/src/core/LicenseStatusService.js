/**
 * LicenseStatusService - Service für die Überwachung des Lizenzstatus
 * @class
 */
class LicenseStatusService {
  /**
   * Erstellt eine neue Instanz des LicenseStatusService
   * @constructor
   * @param {Object} config - Die Konfiguration
   */
  constructor(config = {}) {
    this.config = {
      statusEndpoint: 'https://api.revalenz.com/v1/licenses/status',
      checkInterval: 5 * 60 * 1000, // 5 Minuten
      ...config
    };
    this.status = {
      isValid: false,
      lastCheck: null,
      features: [],
      message: 'Nicht initialisiert'
    };
    this.listeners = new Set();
  }

  /**
   * Initialisiert den Status-Service
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      await this.checkStatus();
      this._startPeriodicCheck();
    } catch (error) {
      console.error('Fehler bei der Status-Service-Initialisierung:', error);
      this.status = {
        isValid: false,
        lastCheck: new Date().toISOString(),
        features: [],
        message: 'Initialisierungsfehler'
      };
    }
  }

  /**
   * Überprüft den aktuellen Status
   * @returns {Promise<Object>} Der aktuelle Status
   */
  async checkStatus() {
    try {
      const response = await fetch(this.config.statusEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Statusabfrage fehlgeschlagen: ${response.statusText}`);
      }

      const result = await response.json();
      
      this.status = {
        isValid: result.isValid,
        lastCheck: new Date().toISOString(),
        features: result.features || [],
        message: result.message || 'OK'
      };

      this._notifyListeners();
      return this.status;
    } catch (error) {
      console.error('Fehler bei der Statusüberprüfung:', error);
      this.status = {
        isValid: false,
        lastCheck: new Date().toISOString(),
        features: [],
        message: error.message
      };
      this._notifyListeners();
      return this.status;
    }
  }

  /**
   * Gibt den aktuellen Status zurück
   * @returns {Object} Der aktuelle Status
   */
  getStatus() {
    return { ...this.status };
  }

  /**
   * Fügt einen Status-Listener hinzu
   * @param {Function} listener - Die Callback-Funktion
   */
  addStatusListener(listener) {
    this.listeners.add(listener);
  }

  /**
   * Entfernt einen Status-Listener
   * @param {Function} listener - Die Callback-Funktion
   */
  removeStatusListener(listener) {
    this.listeners.delete(listener);
  }

  /**
   * Startet die periodische Statusüberprüfung
   * @private
   */
  _startPeriodicCheck() {
    setInterval(() => {
      this.checkStatus().catch(error => {
        console.error('Fehler bei der periodischen Statusüberprüfung:', error);
      });
    }, this.config.checkInterval);
  }

  /**
   * Benachrichtigt alle Listener über Statusänderungen
   * @private
   */
  _notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.status);
      } catch (error) {
        console.error('Fehler beim Benachrichtigen eines Status-Listeners:', error);
      }
    });
  }

  /**
   * Holt das Authentifizierungs-Token
   * @private
   * @returns {string} Das Auth-Token
   */
  _getAuthToken() {
    return this.config.authToken || '';
  }
}

// Exportiere die Klasse
if (typeof module !== 'undefined') {
  module.exports = LicenseStatusService;
} 