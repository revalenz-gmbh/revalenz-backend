/**
 * LicenseManager - Klasse für die Verwaltung von Lizenzen
 * @class
 */
class LicenseManager {
  /**
   * Erstellt eine neue Instanz des LicenseManagers
   * @constructor
   * @param {Object} config - Die Konfiguration
   */
  constructor(config = {}) {
    this.config = {
      storageKey: 'ticket_service_license',
      validationEndpoint: null,
      ...config
    };
    this.license = null;
    this.crypto = new CryptoUtils(config.crypto);
    this.validationService = new LicenseValidationService({
      validationEndpoint: config.validationEndpoint,
      authToken: config.authToken
    });
  }

  /**
   * Initialisiert den LicenseManager
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      await this._loadLicense();
    } catch (error) {
      console.error('Fehler bei der LicenseManager-Initialisierung:', error);
      throw error;
    }
  }

  /**
   * Überprüft, ob eine gültige Lizenz vorhanden ist
   * @returns {Promise<boolean>} Ob eine gültige Lizenz vorhanden ist
   */
  async hasValidLicense() {
    try {
      if (!this.license) {
        return false;
      }

      // Überprüfe das Ablaufdatum
      if (this.license.expiresAt && new Date(this.license.expiresAt) < new Date()) {
        return false;
      }

      // Überprüfe die Lizenz online, falls ein Endpoint konfiguriert ist
      if (this.config.validationEndpoint) {
        return await this._validateLicenseOnline();
      }

      return true;
    } catch (error) {
      console.error('Fehler bei der Lizenzprüfung:', error);
      return false;
    }
  }

  /**
   * Aktiviert eine Lizenz
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @returns {Promise<Object>} Das Aktivierungsergebnis
   */
  async activateLicense(licenseKey) {
    try {
      // Validiere den Lizenzschlüssel
      const validationResult = await this._validateLicenseKey(licenseKey);
      
      if (!validationResult.success) {
        return validationResult;
      }

      // Speichere die Lizenz
      this.license = validationResult.license;
      await this._saveLicense();

      return {
        success: true,
        message: 'Lizenz wurde erfolgreich aktiviert',
        license: this.license
      };
    } catch (error) {
      console.error('Fehler bei der Lizenzaktivierung:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Deaktiviert die aktuelle Lizenz
   * @returns {Promise<Object>} Das Deaktivierungsergebnis
   */
  async deactivateLicense() {
    try {
      this.license = null;
      await this._saveLicense();

      return {
        success: true,
        message: 'Lizenz wurde erfolgreich deaktiviert'
      };
    } catch (error) {
      console.error('Fehler bei der Lizenzdeaktivierung:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Generiert einen neuen Lizenzschlüssel
   * @param {Object} licenseData - Die Lizenzdaten
   * @returns {string} Der generierte Lizenzschlüssel
   */
  generateLicenseKey(licenseData) {
    try {
      return this.crypto.generateLicenseKey(licenseData);
    } catch (error) {
      console.error('Fehler bei der Lizenzschlüssel-Generierung:', error);
      throw error;
    }
  }

  /**
   * Lädt die gespeicherte Lizenz
   * @private
   * @returns {Promise<void>}
   */
  async _loadLicense() {
    try {
      // Versuche die Lizenz aus dem lokalen Speicher zu laden
      const storedLicense = localStorage.getItem(this.config.storageKey);
      if (storedLicense) {
        this.license = JSON.parse(storedLicense);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Lizenz:', error);
      this.license = null;
    }
  }

  /**
   * Speichert die aktuelle Lizenz
   * @private
   * @returns {Promise<void>}
   */
  async _saveLicense() {
    try {
      if (this.license) {
        localStorage.setItem(this.config.storageKey, JSON.stringify(this.license));
      } else {
        localStorage.removeItem(this.config.storageKey);
      }
    } catch (error) {
      console.error('Fehler beim Speichern der Lizenz:', error);
      throw error;
    }
  }

  /**
   * Validiert einen Lizenzschlüssel
   * @private
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @returns {Promise<Object>} Das Validierungsergebnis
   */
  async _validateLicenseKey(licenseKey) {
    try {
      // Überprüfe das Format des Lizenzschlüssels
      if (!this._isValidLicenseKeyFormat(licenseKey)) {
        return {
          success: false,
          message: 'Ungültiges Lizenzschlüssel-Format'
        };
      }

      // Validiere den Lizenzschlüssel online, falls ein Endpoint konfiguriert ist
      if (this.config.validationEndpoint) {
        return await this._validateLicenseOnline(licenseKey);
      }

      // Für die Offline-Validierung: Dekodiere den Lizenzschlüssel
      const license = this.crypto.decodeLicenseKey(licenseKey);
      return {
        success: true,
        license: license
      };
    } catch (error) {
      console.error('Fehler bei der Lizenzschlüssel-Validierung:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Validiert eine Lizenz online
   * @private
   * @param {string} [licenseKey] - Optional: Der zu validierende Lizenzschlüssel
   * @returns {Promise<boolean>} Ob die Lizenz gültig ist
   */
  async _validateLicenseOnline(licenseKey) {
    try {
      const result = await this.validationService.validateLicense(licenseKey || this.license?.key);
      
      if (!result.success) {
        return false;
      }

      // Aktualisiere die Lizenzinformationen
      if (result.license) {
        this.license = {
          ...this.license,
          ...result.license,
          lastValidated: result.validatedAt
        };
        await this._saveLicense();
      }

      return true;
    } catch (error) {
      console.error('Fehler bei der Online-Lizenzvalidierung:', error);
      return false;
    }
  }

  /**
   * Überprüft das Format eines Lizenzschlüssels
   * @private
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @returns {boolean} Ob das Format gültig ist
   */
  _isValidLicenseKeyFormat(licenseKey) {
    // Beispiel: XXXXX-XXXXX-XXXXX-XXXXX
    const licenseKeyRegex = /^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
    return licenseKeyRegex.test(licenseKey);
  }
}

// Exportiere die Klasse
if (typeof module !== 'undefined') {
  module.exports = LicenseManager;
} 