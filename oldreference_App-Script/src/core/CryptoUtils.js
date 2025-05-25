/**
 * CryptoUtils - Hilfsklasse für Verschlüsselungsoperationen
 * @class
 */
class CryptoUtils {
  /**
   * Erstellt eine neue Instanz der CryptoUtils
   * @constructor
   * @param {Object} config - Die Konfiguration
   */
  constructor(config = {}) {
    this.config = {
      key: 'REVALENZ-TICKET-SERVICE-2024', // Beispiel-Schlüssel
      ...config
    };
  }

  /**
   * Verschlüsselt einen Text
   * @param {string} text - Der zu verschlüsselnde Text
   * @returns {string} Der verschlüsselte Text
   */
  encrypt(text) {
    try {
      // Konvertiere den Text in Base64
      const base64 = btoa(text);
      
      // Verschlüssele den Base64-String mit XOR
      let encrypted = '';
      for (let i = 0; i < base64.length; i++) {
        const charCode = base64.charCodeAt(i) ^ this.config.key.charCodeAt(i % this.config.key.length);
        encrypted += String.fromCharCode(charCode);
      }
      
      // Konvertiere das Ergebnis in Base64
      return btoa(encrypted);
    } catch (error) {
      console.error('Fehler bei der Verschlüsselung:', error);
      throw error;
    }
  }

  /**
   * Entschlüsselt einen Text
   * @param {string} encryptedText - Der zu entschlüsselnde Text
   * @returns {string} Der entschlüsselte Text
   */
  decrypt(encryptedText) {
    try {
      // Dekodiere den Base64-String
      const decoded = atob(encryptedText);
      
      // Entschlüssele den String mit XOR
      let decrypted = '';
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ this.config.key.charCodeAt(i % this.config.key.length);
        decrypted += String.fromCharCode(charCode);
      }
      
      // Dekodiere den Base64-String
      return atob(decrypted);
    } catch (error) {
      console.error('Fehler bei der Entschlüsselung:', error);
      throw error;
    }
  }

  /**
   * Generiert einen Lizenzschlüssel
   * @param {Object} licenseData - Die Lizenzdaten
   * @returns {string} Der generierte Lizenzschlüssel
   */
  generateLicenseKey(licenseData) {
    try {
      // Erstelle einen String aus den Lizenzdaten
      const licenseString = JSON.stringify({
        type: licenseData.type,
        features: licenseData.features,
        expiresAt: licenseData.expiresAt,
        createdAt: new Date().toISOString(),
        checksum: this._generateChecksum(licenseData)
      });

      // Verschlüssele die Lizenzdaten
      const encrypted = this.encrypt(licenseString);

      // Formatiere den Schlüssel in Gruppen von 5 Zeichen
      return this._formatLicenseKey(encrypted);
    } catch (error) {
      console.error('Fehler bei der Lizenzschlüssel-Generierung:', error);
      throw error;
    }
  }

  /**
   * Dekodiert einen Lizenzschlüssel
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @returns {Object} Die dekodierten Lizenzdaten
   */
  decodeLicenseKey(licenseKey) {
    try {
      // Entferne die Formatierung
      const unformatted = licenseKey.replace(/-/g, '');
      
      // Entschlüssele den Schlüssel
      const decrypted = this.decrypt(unformatted);
      
      // Parse die Lizenzdaten
      const licenseData = JSON.parse(decrypted);
      
      // Überprüfe die Checksum
      if (!this._verifyChecksum(licenseData)) {
        throw new Error('Ungültige Checksum');
      }
      
      return licenseData;
    } catch (error) {
      console.error('Fehler bei der Lizenzschlüssel-Dekodierung:', error);
      throw error;
    }
  }

  /**
   * Generiert eine Checksum für die Lizenzdaten
   * @private
   * @param {Object} licenseData - Die Lizenzdaten
   * @returns {string} Die Checksum
   */
  _generateChecksum(licenseData) {
    const data = `${licenseData.type}${licenseData.features.join('')}${licenseData.expiresAt}`;
    let checksum = 0;
    
    for (let i = 0; i < data.length; i++) {
      checksum = ((checksum << 5) - checksum) + data.charCodeAt(i);
      checksum = checksum & checksum;
    }
    
    return checksum.toString(16);
  }

  /**
   * Überprüft die Checksum der Lizenzdaten
   * @private
   * @param {Object} licenseData - Die Lizenzdaten
   * @returns {boolean} Ob die Checksum gültig ist
   */
  _verifyChecksum(licenseData) {
    const { checksum, ...data } = licenseData;
    return this._generateChecksum(data) === checksum;
  }

  /**
   * Formatiert einen Lizenzschlüssel
   * @private
   * @param {string} key - Der unformatierte Schlüssel
   * @returns {string} Der formatierte Schlüssel
   */
  _formatLicenseKey(key) {
    const groups = [];
    for (let i = 0; i < key.length; i += 5) {
      groups.push(key.substr(i, 5));
    }
    return groups.join('-');
  }
}

// Exportiere die Klasse
if (typeof module !== 'undefined') {
  module.exports = CryptoUtils;
} 