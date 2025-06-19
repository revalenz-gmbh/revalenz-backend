/**
 * TicketManager.gs – Hauptfunktionalität für die Ticket-Verwaltung
 *
 * Dieses Modul enthält die Kernfunktionen für den Versand bezahlter Tickets
 * (inkl. QR-Code und E-Mail) im neuen mandantenfähigen System.
 */

/**
 * Sucht nach bezahlten, aber noch nicht versendeten Tickets,
 * generiert IDs und QR-Codes, gruppiert nach Empfänger-E-Mail
 * und versendet EINE E-Mail pro Empfänger mit allen seinen Tickets.
 * Diese Funktion kann manuell oder über das Menü gestartet werden.
 */
function sendPaidTickets() {
  // Konfiguration (kann später aus TicketConfig.gs gelesen werden)
  const sheetName = 'Tickets';
  const emailSubject = 'Ihr Ticket!';
  const emailSenderName = 'Ticket-Service';
  const emailBodyTemplate = `Hallo {NAME},\n\nIhr Ticket für die Veranstaltung.\n\nID: {TICKET_ID}\nTyp: {TICKET_TYP}\n\nViele Grüße,\nIhr Veranstalter`;

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      SpreadsheetApp.getUi().alert(`Fehler: Tabellenblatt "${sheetName}" nicht gefunden!`);
      return;
    }

    const dataRange = sheet.getDataRange();
    const allData = dataRange.getValues();
    const headerRow = allData.shift();

    // Spaltenindizes (an neue Struktur anpassen!)
    const ticketIdCol = 0; // 'Ticket-ID'
    const nameCol = 2;     // 'Name'
    const emailCol = 3;    // 'E-Mail'
    const ticketTypeCol = 4; // 'Ticket Typ'
    const quantityCol = 5; // 'Menge'
    const statusCol = 6;   // 'Status'
    const ticketSentCol = 10; // 'Ticket gesendet Zeitstempel'

    // Gruppiere Tickets nach Empfänger-E-Mail
    const ticketsToSendByEmail = {};
    for (let i = 0; i < allData.length; i++) {
      const row = allData[i];
      const status = row[statusCol];
      const ticketSentTimestamp = row[ticketSentCol];
      const ticketId = row[ticketIdCol];
      const recipientEmail = row[emailCol] ? String(row[emailCol]).trim() : null;
      const quantity = parseInt(row[quantityCol], 10) || 1;

      if (status === 'bezahlt' && !ticketSentTimestamp && recipientEmail) {
        const sheetRowIndex = i + 2;
        if (!ticketsToSendByEmail[recipientEmail]) {
          ticketsToSendByEmail[recipientEmail] = [];
        }
        for (let q = 0; q < quantity; q++) {
          ticketsToSendByEmail[recipientEmail].push({
            rowIndex: sheetRowIndex,
            rowData: row
          });
        }
      }
    }

    let totalTicketsSent = 0;
    let totalEmailsSent = 0;
    const processedRowIndices = [];

    for (const email in ticketsToSendByEmail) {
      const ticketsForThisEmail = ticketsToSendByEmail[email];
      let generatedTicketsData = [];
      let rowIndicesForThisEmail = [];
      let successThisEmail = true;
      const recipientName = ticketsForThisEmail.length > 0 ? ticketsForThisEmail[0].rowData[nameCol] : 'Gast';

      // IDs und QR-Codes generieren
      for (const ticketInfo of ticketsForThisEmail) {
        const rowIndex = ticketInfo.rowIndex;
        const rowData = ticketInfo.rowData;
        const ticketType = rowData[ticketTypeCol];
        const newTicketId = generateUUID();
        const qrCodeBlob = generateQrCode(newTicketId);
        if (!qrCodeBlob) {
          successThisEmail = false;
          break;
        }
        qrCodeBlob.setName('QRCode_' + newTicketId + '.png');
        try {
          sheet.getRange(rowIndex, ticketIdCol + 1).setValue(newTicketId);
          generatedTicketsData.push({ id: newTicketId, qrBlob: qrCodeBlob, type: ticketType, name: recipientName });
          rowIndicesForThisEmail.push(rowIndex);
        } catch (e) {
          successThisEmail = false;
          break;
        }
        Utilities.sleep(100);
      }
      if (!successThisEmail) {
        continue;
      }
      // E-Mail senden
      try {
        let ticketDetailsHtml = '';
        let inlineImages = {};
        for (let k = 0; k < generatedTicketsData.length; k++) {
          const ticket = generatedTicketsData[k];
          const imageCid = 'qrCodeImage' + k;
          ticketDetailsHtml += `------------------------------<br>Ticket ${k + 1} von ${generatedTicketsData.length}<br>Typ: ${ticket.type}<br>ID: ${ticket.id}<br><img src="cid:${imageCid}"><br>------------------------------<br>`;
          inlineImages[imageCid] = ticket.qrBlob;
        }
        let mailBody = emailBodyTemplate;
        mailBody = mailBody.replace('{NAME}', recipientName);
        mailBody = mailBody.replace('{TICKET_TYP}', generatedTicketsData.length > 1 ? 'Ihre persönlichen Tickets' : generatedTicketsData[0].type);
        mailBody = mailBody.replace('{TICKET_ID}', generatedTicketsData.length > 1 ? '(siehe Details)' : generatedTicketsData[0].id);
        mailBody += '<br><br>Ihre Tickets im Detail:<br>' + ticketDetailsHtml;
        const emailOptions = {
          to: email,
          subject: emailSubject,
          htmlBody: mailBody.replace(/\n/g, '<br>'),
          name: emailSenderName,
          inlineImages: inlineImages
        };
        MailApp.sendEmail(emailOptions);
        totalEmailsSent++;
        totalTicketsSent += generatedTicketsData.length;
        processedRowIndices.push(...rowIndicesForThisEmail);
        Utilities.sleep(500);
      } catch (mailError) {
        continue;
      }
    }
    // Zeitstempel setzen...
    const now = new Date();
    for (const rowIndex of processedRowIndices) {
      try {
        sheet.getRange(rowIndex, ticketSentCol + 1).setValue(now);
      } catch (tsError) {
        // Fehler beim Setzen des Zeitstempels ignorieren
      }
    }
    SpreadsheetApp.getUi().alert(totalTicketsSent + ' Tickets in ' + totalEmailsSent + ' E-Mails erfolgreich versendet.');
  } catch (error) {
    SpreadsheetApp.getUi().alert('Ein Fehler ist aufgetreten: ' + error.message);
  }
}

/**
 * Importiert Tickets aus dem Blatt 'Import_Email_Tickets' und erstellt sie im Tickets-Blatt.
 * Markiert verarbeitete Zeilen und sendet optional Bestätigungs-E-Mails.
 */
function processEmailTickets() {
  const importSheetName = 'Import_Email_Tickets';
  const targetSheetName = 'Tickets';
  const emailSenderName = 'Ticket-Service';
  const emailSubject = 'Ihre Ticket-Bestätigung';

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const importSheet = ss.getSheetByName(importSheetName);
    const targetSheet = ss.getSheetByName(targetSheetName);
    if (!importSheet || !targetSheet) {
      SpreadsheetApp.getUi().alert(`Fehler: Blatt "${importSheetName}" oder "${targetSheetName}" nicht gefunden!`);
      return;
    }
    const importData = importSheet.getDataRange().getValues();
    const importHeader = importData.shift();
    const impEmailCol = 0;
    const impNameCol = 1;
    const impTypeCol = 2;
    const impStatusCol = 4;
    let ticketsProcessedCount = 0;
    let emailsSentCount = 0;
    for (let i = 0; i < importData.length; i++) {
      const importRow = importData[i];
      const importSheetRow = i + 2;
      if (importRow[impStatusCol] === 'Verarbeitet' || !importRow[impEmailCol]) {
        continue;
      }
      const recipientEmail = importRow[impEmailCol].trim();
      const recipientName = importRow[impNameCol] ? importRow[impNameCol].trim() : 'Gast';
      const ticketType = importRow[impTypeCol];
      const timestamp = new Date();
      const newTicketId = generateUUID();
      const qrCodeBlob = generateQrCode(newTicketId);
      if (!qrCodeBlob) {
        importSheet.getRange(importSheetRow, impStatusCol + 1).setValue('QR-Fehler');
        continue;
      }
      // Ticket im Hauptblatt anlegen
      const newRowData = [
        newTicketId, timestamp, recipientName, recipientEmail, ticketType, 1, 'importiert', '', '', '', '', '', '', ''
      ];
      targetSheet.appendRow(newRowData);
      // E-Mail senden (optional)
      try {
        const mailBody = `Hallo ${recipientName},\n\nIhr Ticket wurde erfolgreich importiert.\n\nTicket-Typ: ${ticketType}\nTicket-ID: ${newTicketId}\n\nViele Grüße,\n${emailSenderName}`;
        MailApp.sendEmail({
          to: recipientEmail,
          subject: emailSubject,
          body: mailBody,
          name: emailSenderName
        });
        emailsSentCount++;
      } catch (mailError) {
        // Fehler beim Senden ignorieren, aber Status setzen
      }
      importSheet.getRange(importSheetRow, impStatusCol + 1).setValue('Verarbeitet');
      ticketsProcessedCount++;
      Utilities.sleep(200);
    }
    SpreadsheetApp.getUi().alert(`${ticketsProcessedCount} Tickets importiert und ${emailsSentCount} E-Mails versendet.`);
  } catch (error) {
    SpreadsheetApp.getUi().alert('Fehler beim Import: ' + error.message);
  }
}

/**
 * Sendet Absage-E-Mails an alle Kontakte, deren Tickets den Status 'abgesagt' haben.
 * Markiert die Tickets als 'Absage gesendet'.
 */
function sendRejectionEmails() {
  const sheetName = 'Tickets';
  const emailSenderName = 'Ticket-Service';
  const emailSubject = 'Ihre Ticketanfrage – Absage';
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      SpreadsheetApp.getUi().alert(`Fehler: Tabellenblatt "${sheetName}" nicht gefunden!`);
      return;
    }
    const dataRange = sheet.getDataRange();
    const allData = dataRange.getValues();
    const headerRow = allData.shift();
    const nameCol = 2;
    const emailCol = 3;
    const ticketTypeCol = 4;
    const quantityCol = 5;
    const statusCol = 6;
    const rejectionSentCol = 13; // 'Absage Gesendet Zeitstempel'
    let totalEmailsSent = 0;
    let totalTicketsInvolved = 0;
    const processedRowIndices = [];
    for (let i = 0; i < allData.length; i++) {
      const row = allData[i];
      const status = row[statusCol];
      const recipientEmail = row[emailCol] ? String(row[emailCol]).trim().toLowerCase() : null;
      const rejectionSentTimestamp = row[rejectionSentCol];
      if (status === 'abgesagt' && recipientEmail && !rejectionSentTimestamp) {
        const sheetRowIndex = i + 2;
        const recipientName = row[nameCol];
        const ticketType = row[ticketTypeCol];
        const quantity = row[quantityCol];
        const mailBody = `Hallo ${recipientName},\n\nleider können wir Ihre Ticketanfrage für den Typ "${ticketType}" (${quantity} Stück) nicht berücksichtigen.\n\nWir bedauern dies sehr und hoffen, Sie bei einer anderen Veranstaltung begrüßen zu dürfen.\n\nViele Grüße,\n${emailSenderName}`;
        try {
          MailApp.sendEmail({
            to: recipientEmail,
            subject: emailSubject,
            body: mailBody,
            name: emailSenderName
          });
          totalEmailsSent++;
          totalTicketsInvolved++;
          sheet.getRange(sheetRowIndex, rejectionSentCol + 1).setValue(new Date());
          processedRowIndices.push(sheetRowIndex);
          Utilities.sleep(200);
        } catch (mailError) {
          // Fehler beim Senden ignorieren
        }
      }
    }
    SpreadsheetApp.getUi().alert(`${totalEmailsSent} Absage-E-Mails für ${totalTicketsInvolved} Tickets versendet.`);
  } catch (error) {
    SpreadsheetApp.getUi().alert('Fehler beim Versenden der Absagen: ' + error.message);
  }
} 