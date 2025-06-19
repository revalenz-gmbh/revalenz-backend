// LicenseServer.gs – Zentrale Lizenzverwaltung für Revalenz GmbH
// Mandanten- und servicefähige Lizenzlogik mit E-Mail-Bindung

/**
 * Prüft, ob eine Lizenz für einen bestimmten Service, Kunden und E-Mail gültig ist.
 * @param {string} licenseKey
 * @param {string} serviceName
 * @param {string} email
 * @param {string} [deviceId] Optional: Gerätebindung
 * @returns {Object} Ergebnis der Lizenzprüfung
 */
function validateLicense(licenseKey, serviceName, email, deviceId) {
  var sheet = getLicenseSheet();
  var data = sheet.getDataRange().getValues();
  var header = data[0];
  var idxKey = header.indexOf('Lizenzschlüssel');
  var idxService = header.indexOf('Service');
  var idxStatus = header.indexOf('Status');
  var idxAblauf = header.indexOf('Ablaufdatum');
  var idxKunde = header.indexOf('Kunde');
  var idxEmail = header.indexOf('E-Mail');

  for (var i = 1; i < data.length; i++) {
    if (
      data[i][idxKey] === licenseKey &&
      data[i][idxService] === serviceName &&
      data[i][idxStatus] === 'aktiv' &&
      data[i][idxEmail] === email
    ) {
      var ablauf = data[i][idxAblauf];
      if (ablauf && new Date(ablauf) < new Date()) {
        return { valid: false, message: 'Lizenz abgelaufen', license: data[i] };
      }
      // Optional: Gerätebindung prüfen
      if (deviceId) {
        var deviceOk = checkDeviceMapping(licenseKey, deviceId);
        if (!deviceOk) {
          return { valid: false, message: 'Lizenz ist an ein anderes Gerät gebunden', license: data[i] };
        }
      }
      return { valid: true, message: 'Lizenz gültig', license: data[i] };
    }
  }
  return { valid: false, message: 'Lizenz nicht gefunden oder nicht aktiv' };
}

/**
 * Prüft, ob die Lizenz an das angegebene Gerät gebunden ist (optional).
 * @param {string} licenseKey
 * @param {string} deviceId
 * @returns {boolean}
 */
function checkDeviceMapping(licenseKey, deviceId) {
  var sheet = getDeviceMappingSheet();
  var data = sheet.getDataRange().getValues();
  var header = data[0];
  var idxKey = header.indexOf('Lizenzschlüssel');
  var idxDevice = header.indexOf('DeviceId');
  for (var i = 1; i < data.length; i++) {
    if (data[i][idxKey] === licenseKey) {
      return data[i][idxDevice] === deviceId;
    }
  }
  // Noch keine Bindung: Erstelle sie
  sheet.appendRow([licenseKey, deviceId, new Date().toISOString()]);
  return true;
}

/**
 * Liefert das zentrale Lizenz-Sheet (über Spreadsheet-ID aus Properties)
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getLicenseSheet() {
  var LICENSE_SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('LICENSE_SHEET_ID');
  var ss = SpreadsheetApp.openById(LICENSE_SPREADSHEET_ID);
  return ss.getSheetByName('Licenses');
}

/**
 * Liefert das DeviceMapping-Sheet (optional für Gerätebindung)
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getDeviceMappingSheet() {
  var LICENSE_SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('LICENSE_SHEET_ID');
  var ss = SpreadsheetApp.openById(LICENSE_SPREADSHEET_ID);
  var sheet = ss.getSheetByName('DeviceMappings');
  if (!sheet) {
    sheet = ss.insertSheet('DeviceMappings');
    sheet.appendRow(['Lizenzschlüssel', 'DeviceId', 'activatedAt']);
  }
  return sheet;
}

// Weitere Verwaltungsfunktionen (z.B. Lizenz anlegen, sperren, etc.) können hier ergänzt werden. 