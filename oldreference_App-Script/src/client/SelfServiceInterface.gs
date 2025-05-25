/**
 * SelfServiceInterface.gs – Bindeglied zwischen SelfServiceDialog und Ticket-Logik
 */

/**
 * Wird vom SelfServiceDialog.html aufgerufen, um ein oder mehrere Tickets zu bestellen.
 * @param {Object} data - Formulardaten (name, email, event, ticketType, quantity)
 * @return {string} Bestätigungstext oder Fehler
 */
function selfServiceOrderTicket(data) {
  try {
    // Ticket-Logik aufrufen (hier exemplarisch, ggf. anpassen)
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tickets');
    if (!sheet) {
      throw new Error('Tickets-Sheet nicht gefunden!');
    }
    var now = new Date();
    for (var i = 0; i < data.quantity; i++) {
      var ticketId = Utilities.getUuid();
      sheet.appendRow([
        ticketId,
        data.ticketType,
        data.name,
        1,
        'offen',
        now,
        now,
        JSON.stringify({ event: data.event, email: data.email })
      ]);
    }
    return 'Ticket(s) erfolgreich bestellt!';
  } catch (e) {
    throw new Error('Fehler bei der Ticketerstellung: ' + e.message);
  }
}

/**
 * Speichert die Konfiguration im Sheet "Konfiguration".
 * @param {Object} config
 * @return {string}
 */
function saveConfiguration(config) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Konfiguration');
  if (!sheet) {
    sheet = ss.insertSheet('Konfiguration');
    sheet.appendRow(['Schlüssel', 'Wert']);
  }
  Object.keys(config).forEach(function(key) {
    var range = sheet.createTextFinder(key).findNext();
    if (range) {
      sheet.getRange(range.getRow(), 2).setValue(config[key]);
    } else {
      sheet.appendRow([key, config[key]]);
    }
  });

  // Tickets-Blatt automatisch anlegen, falls nicht vorhanden
  var ticketSheet = ss.getSheetByName('Tickets');
  if (!ticketSheet) {
    ticketSheet = ss.insertSheet('Tickets');
    ticketSheet.appendRow([
      'Ticket-ID', 'Erstellt am', 'Name', 'E-Mail', 'Ticket Typ', 'Menge', 'Status',
      'Bezahlt Zeitstempel', 'Check-In Zeitstempel', 'Check-In Scanner/User',
      'Ticket gesendet Zeitstempel', 'Preis pro Ticket', 'Herkunft', 'Absage Gesendet Zeitstempel'
    ]);
  }

  // Tickettypen für Datenvalidierung extrahieren
  var ticketTypes = [];
  try {
    ticketTypes = JSON.parse(config.ticketTypeMapping).map(function(t) { return t.typ; });
  } catch (e) {}

  // Datenvalidierung für die Spalte "Ticket Typ" setzen
  if (ticketTypes.length > 0 && ticketSheet) {
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(ticketTypes, true)
      .setAllowInvalid(false)
      .build();
    // Spalte 5 = "Ticket Typ", ab Zeile 2 (ohne Header)
    ticketSheet.getRange(2, 5, ticketSheet.getMaxRows() - 1).setDataValidation(rule);
  }

  return 'Konfiguration gespeichert!';
}

/**
 * Lädt die Konfiguration aus dem Sheet "Konfiguration".
 * @return {Object}
 */
function getConfigurationValues() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Konfiguration');
  var config = {
    eventName: '',
    orgName: '',
    templateUrl: '',
    vipFolderId: '',
    ticketTypeMapping: '[]',
    licenseKey: '',
    licenseEmail: ''
  };
  if (!sheet) return config;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var key = data[i][0];
    var value = data[i][1];
    if (key in config) config[key] = value;
  }
  return config;
}

/**
 * Gibt alle verfügbaren Tickettypen und Preise aus der Konfiguration zurück.
 * @return {Array} Array von Objekten: [{typ, preis, beschreibung}]
 */
function getAvailableTicketTypes() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var configJson = scriptProperties.getProperty('ticketTypeMapping');
  if (!configJson) throw new Error('Keine Tickettypen konfiguriert!');
  return JSON.parse(configJson);
} 