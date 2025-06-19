/**
 * LicenseDatabase - Datenbankanbindung für die Lizenzverwaltung
 * @class
 */
const { MongoClient } = require('mongodb');

class LicenseDatabase {
  /**
   * Erstellt eine neue Instanz der LicenseDatabase
   * @constructor
   * @param {Object} config - Die Konfiguration
   */
  constructor(config = {}) {
    this.config = {
      url: 'mongodb://localhost:27017',
      dbName: 'ticket_service',
      ...config
    };
    this.client = null;
    this.db = null;
  }

  /**
   * Verbindet mit der Datenbank
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      this.client = new MongoClient(this.config.url);
      await this.client.connect();
      this.db = this.client.db(this.config.dbName);
      console.log('Datenbankverbindung hergestellt');
    } catch (error) {
      console.error('Fehler bei der Datenbankverbindung:', error);
      throw error;
    }
  }

  /**
   * Trennt die Datenbankverbindung
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Datenbankverbindung getrennt');
    }
  }

  /**
   * Speichert eine Lizenz
   * @param {Object} license - Die Lizenzdaten
   * @returns {Promise<Object>} Die gespeicherte Lizenz
   */
  async saveLicense(license) {
    try {
      const collection = this.db.collection('licenses');
      const result = await collection.updateOne(
        { key: license.key },
        { $set: license },
        { upsert: true }
      );
      return result;
    } catch (error) {
      console.error('Fehler beim Speichern der Lizenz:', error);
      throw error;
    }
  }

  /**
   * Lädt eine Lizenz
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @returns {Promise<Object|null>} Die Lizenz oder null
   */
  async loadLicense(licenseKey) {
    try {
      const collection = this.db.collection('licenses');
      return await collection.findOne({ key: licenseKey });
    } catch (error) {
      console.error('Fehler beim Laden der Lizenz:', error);
      throw error;
    }
  }

  /**
   * Aktualisiert den Lizenzstatus
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @param {Object} status - Der neue Status
   * @returns {Promise<Object>} Das Aktualisierungsergebnis
   */
  async updateLicenseStatus(licenseKey, status) {
    try {
      const collection = this.db.collection('licenses');
      const result = await collection.updateOne(
        { key: licenseKey },
        { 
          $set: { 
            status,
            lastUpdated: new Date()
          }
        }
      );
      return result;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Lizenzstatus:', error);
      throw error;
    }
  }

  /**
   * Speichert eine Gerätezuordnung
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @param {string} deviceId - Die Geräte-ID
   * @returns {Promise<Object>} Das Speicherergebnis
   */
  async saveDeviceMapping(licenseKey, deviceId) {
    try {
      const collection = this.db.collection('device_mappings');
      const result = await collection.updateOne(
        { licenseKey },
        { 
          $set: { 
            deviceId,
            lastUpdated: new Date()
          }
        },
        { upsert: true }
      );
      return result;
    } catch (error) {
      console.error('Fehler beim Speichern der Gerätezuordnung:', error);
      throw error;
    }
  }

  /**
   * Lädt eine Gerätezuordnung
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @returns {Promise<Object|null>} Die Gerätezuordnung oder null
   */
  async loadDeviceMapping(licenseKey) {
    try {
      const collection = this.db.collection('device_mappings');
      return await collection.findOne({ licenseKey });
    } catch (error) {
      console.error('Fehler beim Laden der Gerätezuordnung:', error);
      throw error;
    }
  }
}

// Exportiere die Klasse
if (typeof module !== 'undefined') {
  module.exports = LicenseDatabase;
} 