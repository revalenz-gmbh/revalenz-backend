/**
 * LicenseTest - Test-Umgebung für die Lizenzvalidierung
 * @class
 */
class LicenseTest {
  /**
   * Erstellt eine neue Instanz des LicenseTest
   * @constructor
   * @param {Object} config - Die Konfiguration
   */
  constructor(config = {}) {
    this.config = {
      testEndpoint: 'https://api.revalenz.com/v1/licenses/test',
      ...config
    };
    this.licenseManager = new LicenseManager(config.license);
    this.statusService = new LicenseStatusService(config.status);
  }

  /**
   * Führt einen vollständigen Lizenztest durch
   * @returns {Promise<Object>} Das Testergebnis
   */
  async runFullTest() {
    try {
      const results = {
        licenseValidation: await this.testLicenseValidation(),
        statusCheck: await this.testStatusCheck(),
        featureAccess: await this.testFeatureAccess(),
        timestamp: new Date().toISOString()
      };

      return {
        success: results.licenseValidation.success && 
                results.statusCheck.success && 
                results.featureAccess.success,
        results
      };
    } catch (error) {
      console.error('Fehler beim Lizenztest:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Testet die Lizenzvalidierung
   * @returns {Promise<Object>} Das Testergebnis
   */
  async testLicenseValidation() {
    try {
      const licenseKey = this.config.testLicenseKey;
      if (!licenseKey) {
        throw new Error('Kein Test-Lizenzschlüssel konfiguriert');
      }

      const result = await this.licenseManager.activateLicense(licenseKey);
      return {
        success: result.success,
        message: result.message,
        license: result.license
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Testet die Statusüberprüfung
   * @returns {Promise<Object>} Das Testergebnis
   */
  async testStatusCheck() {
    try {
      await this.statusService.initialize();
      const status = this.statusService.getStatus();
      
      return {
        success: status.isValid,
        status
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Testet den Feature-Zugriff
   * @returns {Promise<Object>} Das Testergebnis
   */
  async testFeatureAccess() {
    try {
      const status = this.statusService.getStatus();
      const requiredFeatures = ['ticket_creation', 'ticket_scanning'];
      
      const missingFeatures = requiredFeatures.filter(
        feature => !status.features.includes(feature)
      );

      return {
        success: missingFeatures.length === 0,
        missingFeatures,
        availableFeatures: status.features
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Generiert einen Testbericht
   * @param {Object} testResults - Die Testergebnisse
   * @returns {string} Der formatierte Testbericht
   */
  generateTestReport(testResults) {
    const report = [
      '=== Lizenztest-Bericht ===',
      `Datum: ${testResults.timestamp}`,
      '',
      '1. Lizenzvalidierung:',
      `   Status: ${testResults.results.licenseValidation.success ? 'Erfolgreich' : 'Fehlgeschlagen'}`,
      `   Nachricht: ${testResults.results.licenseValidation.message}`,
      '',
      '2. Statusüberprüfung:',
      `   Status: ${testResults.results.statusCheck.success ? 'Erfolgreich' : 'Fehlgeschlagen'}`,
      `   Letzte Prüfung: ${testResults.results.statusCheck.status.lastCheck}`,
      '',
      '3. Feature-Zugriff:',
      `   Status: ${testResults.results.featureAccess.success ? 'Erfolgreich' : 'Fehlgeschlagen'}`,
      testResults.results.featureAccess.missingFeatures.length > 0
        ? `   Fehlende Features: ${testResults.results.featureAccess.missingFeatures.join(', ')}`
        : '   Alle erforderlichen Features verfügbar',
      '',
      '=== Gesamtergebnis ===',
      `Status: ${testResults.success ? 'ERFOLGREICH' : 'FEHLGESCHLAGEN'}`
    ].join('\n');

    return report;
  }
}

// Exportiere die Klasse
if (typeof module !== 'undefined') {
  module.exports = LicenseTest;
} 