/**
 * LicenseGenerator - Klasse für die Generierung von Lizenzen
 * @class
 */
class LicenseGenerator {
  /**
   * Erstellt eine neue Instanz des LicenseGenerators
   * @constructor
   * @param {Object} config - Die Konfiguration
   */
  constructor(config = {}) {
    this.config = {
      defaultDuration: 365, // Tage
      ...config
    };
    this.licenseManager = new LicenseManager(config.license);
  }

  /**
   * Generiert eine Standard-Lizenz
   * @param {Object} options - Die Lizenzoptionen
   * @returns {string} Der generierte Lizenzschlüssel
   */
  generateStandardLicense(options = {}) {
    return this.generateLicense({
      type: 'STANDARD',
      features: ['ticket_creation', 'ticket_scanning'],
      ...options
    });
  }

  /**
   * Generiert eine Premium-Lizenz
   * @param {Object} options - Die Lizenzoptionen
   * @returns {string} Der generierte Lizenzschlüssel
   */
  generatePremiumLicense(options = {}) {
    return this.generateLicense({
      type: 'PREMIUM',
      features: [
        'ticket_creation',
        'ticket_scanning',
        'advanced_reporting',
        'custom_branding',
        'api_access'
      ],
      ...options
    });
  }

  /**
   * Generiert eine Enterprise-Lizenz
   * @param {Object} options - Die Lizenzoptionen
   * @returns {string} Der generierte Lizenzschlüssel
   */
  generateEnterpriseLicense(options = {}) {
    return this.generateLicense({
      type: 'ENTERPRISE',
      features: [
        'ticket_creation',
        'ticket_scanning',
        'advanced_reporting',
        'custom_branding',
        'api_access',
        'multi_tenant',
        'sla_support',
        'dedicated_support'
      ],
      ...options
    });
  }

  /**
   * Generiert eine benutzerdefinierte Lizenz
   * @param {Object} options - Die Lizenzoptionen
   * @returns {string} Der generierte Lizenzschlüssel
   */
  generateLicense(options = {}) {
    try {
      // Setze Standardwerte
      const licenseData = {
        type: options.type || 'STANDARD',
        features: options.features || ['ticket_creation'],
        expiresAt: this._calculateExpiryDate(options.duration),
        ...options
      };

      // Generiere den Lizenzschlüssel
      return this.licenseManager.generateLicenseKey(licenseData);
    } catch (error) {
      console.error('Fehler bei der Lizenzgenerierung:', error);
      throw error;
    }
  }

  /**
   * Berechnet das Ablaufdatum
   * @private
   * @param {number} [duration] - Die Dauer in Tagen
   * @returns {string} Das Ablaufdatum als ISO-String
   */
  _calculateExpiryDate(duration) {
    const days = duration || this.config.defaultDuration;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    return expiryDate.toISOString();
  }
}

// Exportiere die Klasse
if (typeof module !== 'undefined') {
  module.exports = LicenseGenerator;
} 