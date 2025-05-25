/**
 * Interface.gs – Zentrale Schnittstelle für das Client-System (Ticketservice)
 *
 * Diese Datei kapselt die wichtigsten Funktionen für Aktivierung, Lizenzprüfung,
 * Setup und Menü-Integration. Die Lizenzprüfung erfolgt über die zentrale
 * Lizenzverwaltung (als Apps Script Library).
 */

// Konfigurationsobjekt
let _clientConfig = {
  serviceName: 'Ticketservice',
  licenseKey: null,
  email: null,
  licenseStatus: null
};

/**
 * Wird beim Öffnen der Tabelle ausgeführt.
 * Erstellt das Menü und prüft den Lizenzstatus.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  let config;
  try {
    config = getConfigurationValues();
  } catch (e) {
    config = {};
  }
  const menu = ui.createMenu('Ticket-Service');

  // Prüfe, ob die wichtigsten Felder gesetzt sind
  let setupIncomplete = false;
  try {
    setupIncomplete = !config.eventName || !config.orgName || !config.templateUrl || !config.ticketTypeMapping || JSON.parse(config.ticketTypeMapping).length === 0;
  } catch (e) {
    setupIncomplete = true;
  }

  if (setupIncomplete) {
    menu.addItem('Client-Konfiguration starten', 'openClientConfigDialog');
    menu.addToUi();
    ui.alert('Bitte schließe zuerst die Client-Konfiguration ab, um das System nutzen zu können.');
  } else {
    menu
      .addItem('Ticket bestellen (Self-Service)', 'openSelfServiceDialog')
      .addItem('Tickettypen & Preise konfigurieren', 'openTicketTypeConfigDialog')
      .addItem('Client-Konfiguration', 'openClientConfigDialog')
      .addToUi();
  }
}

/**
 * Zeigt den Aktivierungsdialog an.
 */
function showActivationDialog() {
  const html = HtmlService.createHtmlOutput(`
    <div style="padding: 20px;">
      <h2>Ticket-Service Aktivierung</h2>
      <p>Bitte geben Sie Ihre E-Mail-Adresse und Ihren Lizenzschlüssel ein:</p>
      <input type="email" id="email" placeholder="E-Mail" style="width: 100%; margin: 5px 0;" />
      <input type="text" id="licenseKey" placeholder="Lizenzschlüssel" style="width: 100%; margin: 5px 0;" />
      <button onclick="activate()">Aktivieren</button>
      <script>
        function activate() {
          const email = document.getElementById('email').value;
          const licenseKey = document.getElementById('licenseKey').value;
          if (!email || !licenseKey) {
            alert('Bitte geben Sie E-Mail und Lizenzschlüssel ein.');
            return;
          }
          google.script.run
            .withSuccessHandler(function(response) {
              if (response.success) {
                alert('Aktivierung erfolgreich!');
                google.script.host.close();
                google.script.run.onOpen();
              } else {
                alert('Fehler: ' + response.message);
              }
            })
            .withFailureHandler(function(error) {
              alert('Fehler: ' + error.message);
            })
            .activateLicense(email, licenseKey);
        }
      </script>
    </div>
  `)
  .setWidth(400)
  .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Ticket-Service Aktivierung');
}

/**
 * Aktiviert das System durch Lizenzprüfung gegen die zentrale Lizenzverwaltung.
 * Speichert Lizenzdaten in den ScriptProperties.
 * @param {string} email
 * @param {string} licenseKey
 * @returns {Object} Ergebnis der Aktivierung
 */
function activateLicense(email, licenseKey) {
  try {
    // Aufruf der zentralen Lizenzverwaltung als Library
    // ACHTUNG: Die Library muss im Projekt eingebunden sein und die Funktion validateLicense bereitstellen!
    var result = LicenseServer.validateLicense(licenseKey, _clientConfig.serviceName, email);
    if (result.valid) {
      PropertiesService.getScriptProperties().setProperties({
        'LICENSE_KEY': licenseKey,
        'LICENSE_EMAIL': email,
        'LICENSE_STATUS': 'aktiv'
      });
      return { success: true, message: 'System aktiviert!' };
    } else {
      return { success: false, message: result.message };
    }
  } catch (e) {
    Logger.log('Fehler in activateLicense: ' + e.message);
    return { success: false, message: e.message };
  }
}

/**
 * Gibt Lizenzstatus und -details zurück.
 * @returns {Object} Lizenzinformationen
 */
function getLicenseInfo() {
  const props = PropertiesService.getScriptProperties();
  const licenseKey = props.getProperty('LICENSE_KEY');
  const email = props.getProperty('LICENSE_EMAIL');
  if (!licenseKey || !email) {
    return { active: false };
  }
  // Prüfe Lizenz erneut gegen die zentrale Verwaltung
  try {
    var result = LicenseServer.validateLicense(licenseKey, _clientConfig.serviceName, email);
    return {
      active: result.valid,
      licenseKey: licenseKey,
      email: email,
      status: result.valid ? 'aktiv' : 'inaktiv',
      message: result.message
    };
  } catch (e) {
    return { active: false, message: e.message };
  }
}

/**
 * Legt die Tickets-Tabelle mit neuer Struktur an.
 * @returns {Object} Ergebnis der Einrichtung
 */
function setupTicketSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Tickets');
    if (!sheet) {
      sheet = ss.insertSheet('Tickets');
    }
    sheet.getRange('A1:N1').setValues([[
      'Ticket-ID', 'Erstellt am', 'Name', 'E-Mail', 'Ticket Typ', 'Menge', 'Status',
      'Bezahlt Zeitstempel', 'Check-In Zeitstempel', 'Check-In Scanner/User',
      'Ticket gesendet Zeitstempel', 'Preis pro Ticket', 'Herkunft', 'Absage Gesendet Zeitstempel'
    ]]);
    sheet.getRange('A1:N1').setFontWeight('bold').setBackground('#f3f3f3').setHorizontalAlignment('center');
    sheet.setColumnWidths(1, 14, 150);
    return { success: true, message: 'Tickets-Tabelle wurde erfolgreich eingerichtet.' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

// Platzhalter für weitere Funktionen (z.B. Ticket-Erstellung, Konfiguration, Dialoge)
function showTicketCreationDialog() {
  SpreadsheetApp.getUi().alert('Ticket-Erstellung: Funktion in Entwicklung.');
}

function showTicketManagementDialog() {
  SpreadsheetApp.getUi().alert('Ticket-Verwaltung: Funktion in Entwicklung.');
}

function openScanner() {
  SpreadsheetApp.getUi().alert('Scanner: Funktion in Entwicklung.');
}

function showLicenseInfo() {
  const info = getLicenseInfo();
  SpreadsheetApp.getUi().alert(
    'Lizenzinformationen',
    `Status: ${info.status || 'unbekannt'}\nLizenzschlüssel: ${info.licenseKey || '-'}\nE-Mail: ${info.email || '-'}`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Setzt die gespeicherten Lizenzdaten zurück (für Testzwecke oder erneute Aktivierung).
 */
function resetLicense() {
  PropertiesService.getScriptProperties().deleteProperty('LICENSE_KEY');
  PropertiesService.getScriptProperties().deleteProperty('LICENSE_EMAIL');
  PropertiesService.getScriptProperties().deleteProperty('LICENSE_STATUS');
  SpreadsheetApp.getUi().alert('Lizenzdaten wurden zurückgesetzt. Das System kann jetzt erneut aktiviert werden.');
  onOpen();
}

/**
 * Öffnet den Self-Service-Bestelldialog
 */
function openSelfServiceDialog() {
  var html = HtmlService.createHtmlOutputFromFile('SelfServiceDialog')
    .setWidth(420)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Ticket selbst bestellen');
}

/**
 * Öffnet den Konfigurationsdialog für Tickettypen & Preise
 */
function openTicketTypeConfigDialog() {
  var html = HtmlService.createHtmlOutputFromFile('TicketTypeConfigDialog')
    .setWidth(600)
    .setHeight(400);
  SpreadsheetApp.getUi().showModalDialog(html, 'Tickettypen & Preise konfigurieren');
}

/**
 * Öffnet den zentralen Client-Konfigurationsdialog
 */
function openClientConfigDialog() {
  var html = HtmlService.createHtmlOutputFromFile('ClientConfigDialog')
    .setWidth(600)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Client-Konfiguration');
} 