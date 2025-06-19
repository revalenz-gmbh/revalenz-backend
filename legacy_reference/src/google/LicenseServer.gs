// LicenseServer.gs – Zentrale Lizenzverwaltung für Revalenz GmbH
// Diese Datei ist ausschließlich für die Verwaltung und Prüfung von Lizenzen zuständig.
// Sie greift auf ein zentrales Spreadsheet zu (über Spreadsheet-ID).

/**
 * Beispiel: Prüft, ob eine Lizenz gültig ist (Demo-Logik)
 * @param {string} licenseKey
 * @param {string} deviceId
 * @returns {boolean}
 */
function validateLicense(licenseKey, deviceId) {
  var sheet = getLicenseSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === licenseKey && data[i][1] === deviceId && data[i][2] === 'aktiv') {
      return true;
    }
  }
  return false;
}

/**
 * Liefert das zentrale Lizenz-Sheet (über Spreadsheet-ID)
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getLicenseSheet() {
  var LICENSE_SPREADSHEET_ID = 'HIER_DEINE_LIZENZ_SPREADSHEET_ID'; // TODO: Anpassen!
  var ss = SpreadsheetApp.openById(LICENSE_SPREADSHEET_ID);
  return ss.getSheetByName('Licenses');
}

// Weitere Verwaltungsfunktionen (z.B. Lizenz anlegen, sperren, etc.) können hier ergänzt werden.

/**
 * LicenseServer - Google Apps Script Version für die Lizenzvalidierung
 * @class
 */
class LicenseServer {
  /**
   * Erstellt eine neue Instanz des LicenseServer
   * @constructor
   * @param {Object} config - Die Konfiguration
   */
  constructor(config = {}) {
    this.config = {
      sheetName: 'Licenses',
      ...config
    };
    this.sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName(this.config.sheetName);
  }

  /**
   * Validiert eine Lizenz
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @param {string} deviceId - Die Geräte-ID
   * @returns {Object} Das Validierungsergebnis
   */
  validateLicense(licenseKey, deviceId) {
    try {
      // Lade die Lizenz aus dem Sheet
      const license = this._loadLicense(licenseKey);
      
      if (!license) {
        return {
          success: false,
          message: 'Lizenz nicht gefunden'
        };
      }

      // Überprüfe das Ablaufdatum
      if (new Date(license.expiresAt) < new Date()) {
        return {
          success: false,
          message: 'Lizenz abgelaufen'
        };
      }

      // Überprüfe die Gerätezuordnung
      const deviceMapping = this._loadDeviceMapping(licenseKey);
      if (deviceMapping && deviceMapping.deviceId !== deviceId) {
        return {
          success: false,
          message: 'Lizenz bereits auf einem anderen Gerät aktiviert'
        };
      }

      // Speichere die Gerätezuordnung
      this._saveDeviceMapping(licenseKey, deviceId);

      return {
        success: true,
        message: 'Lizenz validiert',
        license: {
          type: license.type,
          features: license.features,
          expiresAt: license.expiresAt
        }
      };
    } catch (error) {
      console.error('Fehler bei der Lizenzvalidierung:', error);
      throw error;
    }
  }

  /**
   * Holt den Lizenzstatus
   * @param {string} deviceId - Die Geräte-ID
   * @returns {Object} Der Lizenzstatus
   */
  getLicenseStatus(deviceId) {
    try {
      // Finde die Lizenz für das Gerät
      const deviceMapping = this._findDeviceMapping(deviceId);

      if (!deviceMapping) {
        return {
          isValid: false,
          features: [],
          message: 'Keine Lizenz für dieses Gerät gefunden'
        };
      }

      // Lade die Lizenz
      const license = this._loadLicense(deviceMapping.licenseKey);
      
      if (!license) {
        return {
          isValid: false,
          features: [],
          message: 'Lizenz nicht gefunden'
        };
      }

      // Überprüfe das Ablaufdatum
      const isValid = new Date(license.expiresAt) > new Date();

      return {
        isValid,
        features: isValid ? license.features : [],
        message: isValid ? 'OK' : 'Lizenz abgelaufen'
      };
    } catch (error) {
      console.error('Fehler bei der Statusabfrage:', error);
      throw error;
    }
  }

  /**
   * Lädt eine Lizenz aus dem Sheet
   * @private
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @returns {Object|null} Die Lizenz oder null
   */
  _loadLicense(licenseKey) {
    const data = this.sheet.getDataRange().getValues();
    const headerRow = data[0];
    const licenseIndex = headerRow.indexOf('licenseKey');
    
    if (licenseIndex === -1) return null;

    for (let i = 1; i < data.length; i++) {
      if (data[i][licenseIndex] === licenseKey) {
        return {
          type: data[i][headerRow.indexOf('type')],
          features: JSON.parse(data[i][headerRow.indexOf('features')]),
          expiresAt: data[i][headerRow.indexOf('expiresAt')]
        };
      }
    }
    return null;
  }

  /**
   * Lädt eine Gerätezuordnung aus dem Sheet
   * @private
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @returns {Object|null} Die Gerätezuordnung oder null
   */
  _loadDeviceMapping(licenseKey) {
    const deviceSheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName('DeviceMappings');
    const data = deviceSheet.getDataRange().getValues();
    const headerRow = data[0];
    const licenseIndex = headerRow.indexOf('licenseKey');
    
    if (licenseIndex === -1) return null;

    for (let i = 1; i < data.length; i++) {
      if (data[i][licenseIndex] === licenseKey) {
        return {
          deviceId: data[i][headerRow.indexOf('deviceId')],
          activatedAt: data[i][headerRow.indexOf('activatedAt')]
        };
      }
    }
    return null;
  }

  /**
   * Findet eine Gerätezuordnung anhand der Geräte-ID
   * @private
   * @param {string} deviceId - Die Geräte-ID
   * @returns {Object|null} Die Gerätezuordnung oder null
   */
  _findDeviceMapping(deviceId) {
    const deviceSheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName('DeviceMappings');
    const data = deviceSheet.getDataRange().getValues();
    const headerRow = data[0];
    const deviceIndex = headerRow.indexOf('deviceId');
    
    if (deviceIndex === -1) return null;

    for (let i = 1; i < data.length; i++) {
      if (data[i][deviceIndex] === deviceId) {
        return {
          licenseKey: data[i][headerRow.indexOf('licenseKey')],
          activatedAt: data[i][headerRow.indexOf('activatedAt')]
        };
      }
    }
    return null;
  }

  /**
   * Speichert eine Gerätezuordnung im Sheet
   * @private
   * @param {string} licenseKey - Der Lizenzschlüssel
   * @param {string} deviceId - Die Geräte-ID
   */
  _saveDeviceMapping(licenseKey, deviceId) {
    const deviceSheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName('DeviceMappings');
    
    // Lösche alte Zuordnung
    const data = deviceSheet.getDataRange().getValues();
    const headerRow = data[0];
    const licenseIndex = headerRow.indexOf('licenseKey');
    
    if (licenseIndex !== -1) {
      for (let i = data.length - 1; i > 0; i--) {
        if (data[i][licenseIndex] === licenseKey) {
          deviceSheet.deleteRow(i + 1);
        }
      }
    }

    // Füge neue Zuordnung hinzu
    deviceSheet.appendRow([
      licenseKey,
      deviceId,
      new Date().toISOString()
    ]);
  }
}

// Exportiere die Klasse für Google Apps Script
if (typeof global !== 'undefined') {
  global.LicenseServer = LicenseServer;
} 