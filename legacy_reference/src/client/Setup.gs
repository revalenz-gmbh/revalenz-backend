/**
 * Setup-Funktionen für das Ticket-System (Kundensystem)
 */

/**
 * Initialisiert das System: Legt alle benötigten Kundensheets an und füllt sie mit Beispieldaten.
 * Kann beliebig oft ausgeführt werden, ohne bestehende Daten zu überschreiben.
 */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  createSheetIfNotExists(ss, 'Tickets', [
    'ticket_id',
    'created_at',
    'name',
    'email',
    'ticket_type',
    'quantity',
    'status',
    'paid_at',
    'checkin_at',
    'sent_at',
    'checkin_user',
    'price_per_ticket',
    'source',
    'cancelled_at'
  ], [
    [
      1001,
      '2024-05-01 10:00',
      'Max Mustermann',
      'max@beispiel.de',
      'VIP',
      2,
      'verkauft',
      '2024-05-01 10:05',
      '2024-05-02 18:00',
      '2024-05-01 10:10',
      'scanner1',
      99.00,
      'Online',
      ''
    ],
    [
      1002,
      '2024-05-01 11:00',
      'Erika Musterfrau',
      'erika@beispiel.de',
      'Standard',
      1,
      'reserviert',
      '',
      '',
      '',
      '',
      49.00,
      'Vorverkauf',
      ''
    ]
  ]);

  createSheetIfNotExists(ss, 'Devices', [
    'device_id',
    'name',
    'status',
    'last_active',
    'created_at'
  ], [
    ['DEV001', 'Scanner 1', 'online', '2024-05-01 13:00', '2024-05-01']
  ]);

  Logger.log('Setup abgeschlossen. Alle benötigten Kundensheets sind vorhanden.');
}

/**
 * Legt ein Sheet mit Spalten und Beispieldaten an, falls es noch nicht existiert.
 * @param {SpreadsheetApp.Spreadsheet} ss - Das Spreadsheet-Objekt
 * @param {string} name - Name des Sheets
 * @param {string[]} headers - Spaltenüberschriften
 * @param {Array[]} exampleRows - Array von Beispieldatensätzen
 */
function createSheetIfNotExists(ss, name, headers, exampleRows) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    exampleRows.forEach(row => sheet.appendRow(row));
    Logger.log('Sheet "' + name + '" wurde angelegt und mit Beispieldaten gefüllt.');
  } else {
    Logger.log('Sheet "' + name + '" existiert bereits.');
  }
}

/**
 * Öffnet die Scanner-Web-App
 */
function openScanner() {
  const scanner = new Scanner();
  const htmlOutput = scanner.createHtmlOutput();
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Ticket Scanner');
}

/**
 * Fügt einen Menüpunkt zum Öffnen des Scanners hinzu
 */
function onOpenSetup() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Ticket Service')
    .addItem('Scanner öffnen', 'openScanner')
    .addItem('Setup ausführen', 'setup')
    .addToUi();
} 