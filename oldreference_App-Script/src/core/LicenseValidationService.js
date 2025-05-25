/**
 * LicenseValidationService - Service für die Online-Validierung von Lizenzen
 * @class
 */
class LicenseValidationService {
  /**
   * Erstellt eine neue Instanz des LicenseValidationService
   * @constructor
   * @param {Object} config - Die Konfiguration
   */
  constructor(config = {}) {
    this.config = {
      validationEndpoint: 'https://api.revalenz.com/v1/licenses/validate',
      cacheDuration: 24 * 60 * 60 * 1000, // 24 Stunden in Millisekunden
      ...config
    };
    this.cache = new Map();
  }

  /**
   * Validiert eine Lizenz online (MOCK für lokale Tests)
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @returns {Promise<Object>} Das Validierungsergebnis
   */
  async validateLicense(licenseKey) {
    // MOCK für lokale Tests:
    return { success: true, message: 'Testmodus: Lizenz immer gültig.' };
    // ---
    // Für Produktion bitte wieder die echte Implementierung aktivieren:
    // try {
    //   const cachedResult = this._getFromCache(licenseKey);
    //   if (cachedResult) {
    //     return cachedResult;
    //   }
    //   const result = await this._performOnlineValidation(licenseKey);
    //   this._addToCache(licenseKey, result);
    //   return result;
    // } catch (error) {
    //   console.error('Fehler bei der Online-Validierung:', error);
    //   return {
    //     success: false,
    //     message: error.message,
    //     error: error
    //   };
    // }
  }

  /**
   * Führt die Online-Validierung durch
   * @private
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @returns {Promise<Object>} Das Validierungsergebnis
   */
  async _performOnlineValidation(licenseKey) {
    try {
      const response = await fetch(this.config.validationEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this._getAuthToken()}`
        },
        body: JSON.stringify({
          licenseKey,
          deviceId: this._getDeviceId(),
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Validierungsfehler: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Erweitere das Ergebnis um zusätzliche Informationen
      return {
        ...result,
        validatedAt: new Date().toISOString(),
        deviceId: this._getDeviceId()
      };
    } catch (error) {
      throw new Error(`Online-Validierung fehlgeschlagen: ${error.message}`);
    }
  }

  /**
   * Holt ein Ergebnis aus dem Cache
   * @private
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @returns {Object|null} Das gecachte Ergebnis oder null
   */
  _getFromCache(licenseKey) {
    const cached = this.cache.get(licenseKey);
    if (!cached) return null;

    // Überprüfe, ob der Cache abgelaufen ist
    if (Date.now() - cached.timestamp > this.config.cacheDuration) {
      this.cache.delete(licenseKey);
      return null;
    }

    return cached.result;
  }

  /**
   * Fügt ein Ergebnis zum Cache hinzu
   * @private
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @param {Object} result - Das Validierungsergebnis
   */
  _addToCache(licenseKey, result) {
    this.cache.set(licenseKey, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * Generiert eine eindeutige Geräte-ID
   * @private
   * @returns {string} Die Geräte-ID
   */
  _getDeviceId() {
    if (typeof localStorage !== 'undefined') {
      let deviceId = localStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = this._generateDeviceId();
        localStorage.setItem('device_id', deviceId);
      }
      return deviceId;
    } else {
      // Node.js: Fallback auf Instanzvariable
      if (!this._nodeDeviceId) {
        this._nodeDeviceId = this._generateDeviceId();
      }
      return this._nodeDeviceId;
    }
  }

  /**
   * Generiert eine neue Geräte-ID
   * @private
   * @returns {string} Die generierte Geräte-ID
   */
  _generateDeviceId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${timestamp}-${random}`;
  }

  /**
   * Holt das Authentifizierungs-Token
   * @private
   * @returns {string} Das Auth-Token
   */
  _getAuthToken() {
    // In einer realen Implementierung würde hier das Token aus einem sicheren Speicher geladen
    return this.config.authToken || '';
  }
}

// Exportiere die Klasse
if (typeof module !== 'undefined') {
  module.exports = LicenseValidationService;
} 