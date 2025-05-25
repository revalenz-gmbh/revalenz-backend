/**
 * Setup-Script für die zentrale Lizenzverwaltung (Revalenz GmbH)
 * Initialisiert das Lizenzverwaltungs-Spreadsheet und speichert wichtige IDs.
 */

/**
 * Initialisiert das Lizenzverwaltungs-System.
 * @param {string} sheetId - Die ID des Spreadsheets für die Lizenzverwaltung
 */
function setupLicenseManagement(sheetId) {
  try {
    if (!sheetId) {
      throw new Error('Bitte geben Sie die ID des Lizenzverwaltungs-Spreadsheets an.');
    }

    // Spreadsheet öffnen
    const licenseManagement = SpreadsheetApp.openById(sheetId);

    // ScriptProperties setzen
    PropertiesService.getScriptProperties().setProperties({
      'LICENSE_SHEET_ID': sheetId
    });

    // Licenses-Sheet initialisieren
    let sheet = licenseManagement.getSheetByName('Licenses');
    if (!sheet) {
      sheet = licenseManagement.insertSheet('Licenses');
    }

    // Spaltenüberschriften prüfen und ggf. setzen
    const headers = sheet.getRange('A1:I1').getValues()[0];
    if (!headers[0] || headers[0] !== 'Lizenzschlüssel') {
      sheet.getRange('A1:I1').setValues([[
        'Lizenzschlüssel',
        'Kunde',
        'E-Mail',
        'Service',
        'Lizenztyp',
        'Status',
        'Aktivierungsdatum',
        'Ablaufdatum',
        'Bemerkungen'
      ]]);
      sheet.getRange('A1:I1').setFontWeight('bold').setBackground('#f3f3f3').setHorizontalAlignment('center');
      sheet.setColumnWidths(1, 9, 150);

      // Beispieldaten einfügen
      sheet.appendRow([
        'XYZ-789-ABC', 'Demo GmbH', 'max@demo.de', 'Ticketservice', 'Standard', 'aktiv', '2024-06-01', '2025-06-01', 'Testkunde'
      ]);
      sheet.appendRow([
        'DEF-456-UVW', 'Musterfirma', 'info@musterfirma.de', 'Newsletter', 'Trial', 'abgelaufen', '2024-01-01', '2024-02-01', 'Testphase abgelaufen'
      ]);
    }

    Logger.log('Lizenzverwaltung wurde erfolgreich initialisiert.');
    return { success: true, message: "Lizenzverwaltung wurde erfolgreich initialisiert" };
  } catch (e) {
    Logger.log('Fehler beim Setup: ' + e.message);
    return { success: false, message: e.message };
  }
}

/**
 * Zeigt das Setup-Menü an.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Lizenzverwaltung')
    .addItem('Setup ausführen', 'showSetupDialog')
    .addToUi();
}

/**
 * Zeigt den Setup-Dialog an.
 */
function showSetupDialog() {
  const html = HtmlService.createHtmlOutput(`
    <div style="padding: 20px;">
      <h2>Lizenzverwaltung Setup</h2>
      <p>Bitte geben Sie die ID des Spreadsheets ein, das für die Lizenzverwaltung verwendet werden soll:</p>
      <input type="text" id="sheetId" style="width: 100%; margin: 10px 0;">
      <button onclick="initialize()">Initialisieren</button>
      <script>
        function initialize() {
          const sheetId = document.getElementById('sheetId').value;
          if (!sheetId) {
            alert('Bitte geben Sie eine gültige Sheet-ID ein.');
            return;
          }
          google.script.run
            .withSuccessHandler(function(response) {
              if (response.success) {
                alert('Setup erfolgreich abgeschlossen!');
                google.script.host.close();
              } else {
                alert('Fehler: ' + response.message);
              }
            })
            .withFailureHandler(function(error) {
              alert('Fehler: ' + error.message);
            })
            .setupLicenseManagement(sheetId);
        }
      </script>
    </div>
  `)
  .setWidth(400)
  .setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, 'Lizenzverwaltung Setup');
} 